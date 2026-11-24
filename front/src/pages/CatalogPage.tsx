import { money } from '../utils/format';
import { useState } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { useUI } from '../context/UIContext';
import { Page, ResourceStatus } from '../components/OperationUI';
import { getImageUrl, handleImageError } from '../utils/image';
import { normalizeCatalogText as normalize } from '../utils/catalogText';

export function CatalogPage({ initialCategory = '', initialSlug = '' }: { initialCategory?: string; initialSlug?: string }) {
  const commerce = useCommerce(); const { currentPath, navigate } = useUI();
  const params = new URLSearchParams(currentPath.split('?')[1] || '');
  const [query, setQuery] = useState(params.get('q') || ''); const [category, setCategory] = useState(initialCategory);
  const [added, setAdded] = useState('');
  const brand = params.get('marca')?.trim() || '';
  const categories = [...new Set([initialCategory, ...commerce.products.map(p => p.macro_categoria)])].filter(Boolean).sort();
  const slug = params.get('subcat') || initialSlug;
  const search = normalize(query.trim());
  const products = commerce.products.filter(p => (!category || normalize(`${p.macro_categoria} ${p.categoria}`).includes(normalize(category)))
    && (!slug || p.subcategoria_slug === slug)
    && (!brand || normalize(p.marca || '') === normalize(brand))
    && normalize(`${p.nombre} ${p.codigo} ${p.codigo_barras || ''} ${p.marca} ${p.categoria}`).includes(search));
  const cartQuantity = commerce.cart.reduce((total, item) => total + item.cantidad, 0);

  function clearFilters() {
    setQuery('');
    setCategory('');
    if (currentPath !== '/catalogo') navigate('/catalogo');
  }

  return <Page title={brand ? `Productos de ${brand}` : slug ? slug.replace(/-/g,' ').toUpperCase() : 'Catálogo de productos'} description="Consulta precios y unidades disponibles. Ventas confirmará tu solicitud.">
    {brand && <a className="tca-link" href="/marcas">Volver a marcas</a>}
    <ResourceStatus loading={commerce.loading} error={commerce.error} retry={commerce.refresh} />
    {commerce.example && <p className="tca-warning">Vista de ejemplo con semilla de prueba. Los precios y existencias son ficticios; configura Supabase para enviar pedidos.</p>}
    <div className="tca-row tca-operation-toolbar"><label className="grow">Buscar por nombre o código<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <label>Categoría<select value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
      {(search || category || slug || brand) && <button className="tca-button secondary" onClick={clearFilters}>Limpiar filtros</button>}
    </div>
    <div className="tca-catalog-results">
      {!commerce.loading && !commerce.error && <p role="status">{products.length} {products.length === 1 ? 'producto' : 'productos'}</p>}
      <button className="tca-link" disabled={commerce.loading} onClick={() => { void commerce.refresh(); }}>Actualizar disponibilidad</button>
      <button className="tca-button secondary" onClick={() => navigate('/carrito')}>Ver carrito ({cartQuantity})</button>
    </div>
    {added && <p className="tca-success" role="status">{added}</p>}
    <div className="tca-products">{products.map(p => {
      const inCart = commerce.cart.find(l => l.codigo === p.codigo)?.cantidad || 0;
      return <article className="tca-product" key={p.codigo}>
        <div className="tca-product-image"><img src={getImageUrl(p.imagen)} alt="" onError={e => handleImageError(e,p.nombre)} loading="lazy" /></div>
        <h2>{p.nombre}</h2>
        <small>{[p.marca, p.codigo].filter(Boolean).join(' · ')}</small>
        {p.descripcion && <p>{p.descripcion}</p>}
        {p.datos_ejemplo && <small className="text-amber-900">Precio y existencias de ejemplo</small>}
        <div className="tca-product-purchase">
          <strong className="tca-price">{money(p.precio)}</strong>
          <p className={p.disponible===0?'text-red-700':'text-green-800'}>{p.disponible===0?'Agotado':`${p.disponible} disponibles`}</p>
          <button className="tca-button" disabled={p.disponible <= inCart || (!inCart && commerce.cart.length >= 100) || commerce.loading || !!commerce.error} onClick={() => { commerce.add(p.codigo); setAdded(`${p.nombre} agregado al carrito.`); }}>Agregar al carrito{inCart ? ` (${inCart})` : ''}</button>
        </div>
      </article>;
    })}</div>{!products.length && !commerce.loading && !commerce.error && <div className="tca-empty">{search || category || slug || brand ? 'No hay productos que coincidan con los filtros.' : 'Aún no hay productos en el catálogo.'}</div>}
  </Page>;
}
