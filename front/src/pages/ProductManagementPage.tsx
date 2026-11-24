import { useState } from 'react';
import { money } from '../utils/format';
import { getManagedProducts, saveManagedProduct, updateManagedProduct, deleteManagedProduct } from '../services/productService';
import { useResource, useAction } from '../hooks/useResource';
import { Page, ResourceStatus, Notice } from '../components/OperationUI';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { CatalogImportModal } from '../components/admin/CatalogImportModal';
import type { ManagedProduct } from '../types';

export function ProductManagementPage() {
  const resource = useResource(async () => (await getManagedProducts()).data);
  const action = useAction(resource.refresh);
  const [query, setQuery] = useState('');
  const [low, setLow] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedProduct | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const products = resource.data ?? [];
  const search = query.trim().toLowerCase();
  const rows = products.map(product => ({
    product,
    available: product.stock_actual - (product.stock_reservado ?? 0),
  })).filter(({ product, available }) =>
    `${product.codigo} ${product.nombre} ${product.marca ?? ''}`.toLowerCase().includes(search) &&
    (!low || available <= product.stock_minimo),
  );

  function openForm(product: ManagedProduct | null) {
    setEditing(product);
    setFormOpen(true);
  }

  async function save(product: ManagedProduct) {
    let failure = '';
    const saved = await action.run(JSON.stringify(product), async key => {
      const result = editing
        ? await updateManagedProduct(editing.codigo, product, products, key)
        : await saveManagedProduct(product, products, key);
      if (!result.success) {
        failure = result.error || 'No se pudo guardar el producto.';
        throw new Error(failure);
      }
    }, `Producto guardado en el inventario central. Código: ${product.codigo}.`);
    return { success: saved, error: saved ? undefined : failure || 'No se pudo guardar el producto.' };
  }

  function deactivate(product: ManagedProduct) {
    if (!window.confirm('¿Desactivar este producto? Su historial se conserva.')) return;
    void action.run(`disable:${product.codigo}`, async () => {
      const result = await deleteManagedProduct(product.codigo, products);
      if (!result.success) throw new Error(result.error);
    }, 'Producto desactivado.');
  }

  return <Page title="Gestión de productos" description="Administra los códigos, precios, imágenes y parámetros de reposición del catálogo.">
    <ResourceStatus {...resource} retry={resource.refresh} />
    {!formOpen && <Notice error={action.error} message={action.message} />}

    <section className="tca-card tca-operation-panel" aria-labelledby="product-actions">
      <h2 id="product-actions">Agregar al catálogo</h2>
      <div className="tca-row">
        <button className="tca-button" onClick={() => openForm(null)}>Crear producto</button>
        <button className="tca-button secondary" onClick={() => setImportOpen(true)}>Validar e importar JSON</button>
      </div>
    </section>

    <section className="tca-card tca-operation-panel" aria-labelledby="product-list">
      <h2 id="product-list">Productos registrados</h2>
      <p className="tca-muted">Las existencias se actualizan mediante recepción o despacho.</p>
      <div className="tca-row tca-operation-toolbar">
        <label className="grow">Buscar producto<input type="search" placeholder="Código, nombre o marca" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label className="tca-check"><input type="checkbox" checked={low} onChange={event => setLow(event.target.checked)} />En mínimo o agotado</label>
        {(search || low) && <button className="tca-button secondary" onClick={() => { setQuery(''); setLow(false); }}>Limpiar filtros</button>}
      </div>
      {resource.data && <p className="tca-muted" role="status">{rows.length} de {products.length} productos</p>}
      {rows.length > 0 ? <div className="tca-table" tabIndex={0} role="region" aria-label="Resultados de productos">
        <table>
          <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Físico</th><th>Reservado</th><th>Disponible / mínimo</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>{rows.map(({ product, available }) => <tr key={product.codigo}>
            <td><strong>{product.nombre}</strong><small className="block tca-muted">{product.codigo}</small></td>
            <td>{product.categoria}</td><td>{money(product.precio)}</td>
            <td>{product.stock_actual}</td><td>{product.stock_reservado ?? 0}</td>
            <td><strong className={available <= product.stock_minimo ? 'text-red-700' : 'text-green-800'}>{available}</strong> / {product.stock_minimo}</td>
            <td><span className={`tca-badge ${product.activo ? 'activo' : 'inactivo'}`}>{product.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td><div className="tca-row tca-product-actions">
              <button className="tca-button secondary" onClick={() => openForm(product)}>Editar</button>
              {product.activo && <button className="tca-button secondary" disabled={action.busy} onClick={() => deactivate(product)}>Desactivar</button>}
            </div></td>
          </tr>)}</tbody>
        </table>
      </div> : resource.data && <p className="tca-empty">{products.length ? 'Ningún producto coincide con los filtros.' : 'Crea tu primer producto o importa un catálogo JSON.'}</p>}
    </section>

    {formOpen && <ProductFormModal key={editing?.codigo || 'new'} isOpen onClose={() => setFormOpen(false)} onSave={save} productToEdit={editing} existingProducts={products} />}
    <CatalogImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} existingProducts={products} onImportCompleted={() => { void resource.refresh(); }} />
  </Page>;
}
