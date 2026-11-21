import { money } from '../utils/format';
import { useState } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { useUI } from '../context/UIContext';
import { Page, ResourceStatus } from '../components/OperationUI';
import { getImageUrl, handleImageError } from '../utils/image';

export function CatalogPage({ initialCategory = '', initialSlug = '' }: { initialCategory?: string; initialSlug?: string }) {
  const commerce = useCommerce(); const { currentPath, navigate } = useUI();
  const params = new URLSearchParams(currentPath.split('?')[1] || '');
  const [query, setQuery] = useState(params.get('q') || ''); const [category, setCategory] = useState(initialCategory);
  const [added, setAdded] = useState('');
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const categories = [...new Set(commerce.products.map(p => p.macro_categoria))].sort();
  const slug = params.get('subcat') || initialSlug;
  const products = commerce.products.filter(p => (!category || normalize(`${p.macro_categoria} ${p.categoria}`).includes(normalize(category)))
    && (!slug || p.subcategoria_slug === slug)
    && normalize(`${p.nombre} ${p.codigo} ${p.codigo_barras || ''} ${p.marca} ${p.categoria}`).includes(normalize(query)));
  return <Page title={slug ? slug.replace(/-/g,' ').toUpperCase() : 'Catálogo de productos'} description="Precios en soles y disponibilidad del inventario central. El carrito no reserva unidades; Ventas confirma la atención.">
    <ResourceStatus loading={commerce.loading} error={commerce.error} retry={commerce.refresh} />
    {commerce.example && <p className="tca-warning">Vista de ejemplo con semilla de prueba. Los precios y existencias son ficticios; configura Supabase para enviar pedidos.</p>}
    <div className="tca-row"><label className="grow">Buscar por nombre o código<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <label>Categoría<select value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
      {slug && <button className="tca-button secondary" onClick={() => navigate('/catalogo')}>Ver todo el catálogo</button>}
      <button className="tca-button" onClick={() => navigate('/carrito')}>Ver carrito ({commerce.cart.reduce((n,l)=>n+l.cantidad,0)})</button>
    </div>{added && <p className="tca-success" role="status">{added}</p>}
    <p>{products.length} productos. <button className="tca-link" onClick={() => { void commerce.refresh(); }}>Actualizar disponibilidad</button></p>
    <div className="tca-products">{products.map(p => {
      const inCart = commerce.cart.find(l => l.codigo === p.codigo)?.cantidad || 0;
      return <article className="tca-product" key={p.codigo}>
        <img src={getImageUrl(p.imagen)} alt={p.nombre} onError={e => handleImageError(e,p.nombre)} loading="lazy" />
        <small>{p.marca} · {p.codigo}</small><h2>{p.nombre}</h2><p>{p.descripcion}</p>
        {p.datos_ejemplo && <small className="text-amber-900">Precio y existencias de ejemplo</small>}
        <strong className="tca-price">{money(p.precio)}</strong><p className={p.disponible===0?'text-red-700':'text-green-800'}>{p.disponible===0?'Agotado':`${p.disponible} disponibles`}</p>
        <button className="tca-button" disabled={p.disponible <= inCart || commerce.loading || !!commerce.error} onClick={() => { commerce.add(p.codigo); setAdded(`${p.nombre} agregado al carrito.`); }}>Agregar al carrito{inCart ? ` (${inCart})` : ''}</button>
      </article>;
    })}</div>{!products.length && !commerce.loading && <div className="tca-card">No hay productos para esta búsqueda. <button className="tca-link" onClick={() => navigate('/catalogo')}>Ver todas las categorías</button></div>}
  </Page>;
}
