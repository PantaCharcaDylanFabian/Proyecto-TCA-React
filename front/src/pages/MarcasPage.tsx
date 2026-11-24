import { useState } from 'react';
import { ResourceStatus } from '../components/OperationUI';
import { useCommerce } from '../context/CommerceContext';
import { normalizeCatalogText } from '../utils/catalogText';
import { getImageUrl } from '../utils/image';

interface PartnerBrand {
  name: string;
  logo: string;
}

const PARTNER_BRANDS: PartnerBrand[] = [
  { name: 'Colgate', logo: 'imagenes/colagatelogo.svg' },
  { name: 'Protex', logo: 'imagenes/protex-logo.png' },
  { name: 'Durex', logo: 'imagenes/Durex-Logo.png' },
  { name: 'Rendipel', logo: 'imagenes/rendipellogo.png' },
  { name: 'Paracas', logo: 'imagenes/paracas logo.png' },
  { name: 'Sapolio', logo: 'imagenes/Sapolio_logo.webp' },
  { name: 'Bolívar', logo: 'imagenes/bolivar logo.png' },
  { name: 'Suavitel', logo: 'imagenes/suavitel_logo.png' },
  { name: 'Ron Cartavio', logo: 'imagenes/roncartavio logo.png' },
  { name: 'Duff Beer', logo: 'imagenes/duff-beer-logo.png' },
  { name: 'Cielo', logo: 'imagenes/cielo logo.png' },
  { name: 'Florida', logo: 'imagenes/floridalogo1.jpg' },
  { name: 'Molitalia', logo: 'imagenes/molitalialogo.png' },
  { name: 'Quaker', logo: 'imagenes/quaker-logo.png' },
  { name: 'Ajinomen', logo: 'imagenes/ajinomenlogo.png' },
];

const logos: Record<string, string> = {
  ...Object.fromEntries(PARTNER_BRANDS.map(brand => [normalizeCatalogText(brand.name), brand.logo])),
  fanny: 'fannylogo.webp', campomar: 'campomarlogo.png', corona: 'corona-logo.png', duff: 'duff-beer-logo.png',
  inkarroz: 'inkarroz logo.png', pilsen: 'pilsen-callao-vector-logo-2022.png', real: 'reallogo.png',
};

export function MarcasPage() {
  const commerce = useCommerce();
  const [query, setQuery] = useState('');
  const brands = new Map<string, { name: string; count: number; image: string }>();
  for (const product of commerce.products) {
    const name = product.marca?.trim();
    if (!name) continue;
    const key = normalizeCatalogText(name);
    const brand = brands.get(key);
    if (brand) brand.count++;
    else brands.set(key, { name, count: 1, image: logos[key] || product.imagen || '' });
  }
  const search = normalizeCatalogText(query);
  const matches = [...brands.entries()]
    .filter(([key]) => key.includes(search))
    .sort(([, a], [, b]) => a.name.localeCompare(b.name, 'es'));

  return <section className="tca-page tca-brands">
    <header className="tca-brands-header">
      <div><h1>Marcas del catálogo</h1><p>Elige una marca para explorar sus productos.</p></div>
      <label>Buscar marca<input type="search" placeholder="Nombre de la marca" value={query} onChange={event => setQuery(event.target.value)} /></label>
    </header>
    <ResourceStatus loading={commerce.loading} error={commerce.error} retry={commerce.refresh} />
    {(!commerce.loading && !commerce.error || brands.size > 0) && <>
      <p className="tca-muted" role="status">{matches.length} {matches.length === 1 ? 'marca' : 'marcas'}{search && ' para tu búsqueda'}</p>
      {matches.length ? <ul className="tca-brand-grid">
        {matches.map(([key, brand]) => <li key={key}>
          <a className="tca-brand-card" href={`/catalogo?${new URLSearchParams({ marca: brand.name })}`}>
            <div className="tca-brand-art" aria-hidden="true">
              <span>{brand.name.slice(0, 2).toUpperCase()}</span>
              {brand.image && <img src={getImageUrl(brand.image)} alt="" loading="lazy" onError={event => { event.currentTarget.hidden = true; }} />}
            </div>
            <div className="tca-brand-caption">
              <div><strong>{brand.name}</strong><small>{brand.count} {brand.count === 1 ? 'producto' : 'productos'}</small></div>
              <span aria-hidden="true">→</span>
            </div>
          </a>
        </li>)}
      </ul> : <div className="tca-empty">
        <p>{search ? 'No encontramos esa marca en el catálogo.' : 'Aún no hay productos con marca publicada.'}</p>
        {search && <button className="tca-button secondary" onClick={() => setQuery('')}>Ver todas las marcas</button>}
      </div>}
    </>}
    <details className="tca-card tca-brand-partners">
      <summary>Marcas asociadas a la distribuidora</summary>
      <ul>{PARTNER_BRANDS.map(brand => <li key={brand.name}><img loading="lazy" src={getImageUrl(brand.logo)} alt={brand.name} /></li>)}</ul>
    </details>
  </section>;
}
