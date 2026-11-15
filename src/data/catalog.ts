import rawCatalog from './productos.json';
import type { SubcategoryData, Product } from '../types';

export const CATALOG_DATA: Record<string, SubcategoryData> = rawCatalog as Record<string, SubcategoryData>;

/**
 * Mapping of legacy HTML filenames and URL paths to their corresponding catalog subcategory key.
 */
export const LEGACY_PATH_MAP: Record<string, string> = {
  // Direct subcategory HTML files
  'subcategoria-aceitesclasicos.html': 'aceites-clasicos',
  'subcategoria-aceitunasnegras.html': 'aceitunas-negras',
  'subcategoria-aceitunasverdes.html': 'aceitunas-verdes',
  'subcategoria-alimentosenconserva.html': 'conservas-alimentos',
  'subcategoria-arroz.html': 'arroz-anejo-superior',
  'subcategoria-arverjas.html': 'arverjas',
  'subcategoria-bañadas.html': 'galletas-banadas',
  'subcategoria-cervezas.html': 'cervezas',
  'subcategoria-chuño.html': 'chuno',
  'subcategoria-conservadebonito.html': 'conservas-bonito',
  'subcategoria-conservasdeatun.html': 'conservas-atun',
  'subcategoria-conservasdecaballa.html': 'conservas-caballa',
  'subcategoria-conservasdejurel.html': 'conservas-jurel',
  'subcategoria-endulzantesrefinados.html': 'endulzantes-refinados',
  'subcategoria-frijoles.html': 'frijoles',
  'subcategoria-frutasenconserva.html': 'conservas-fruta',
  'subcategoria-habastostadas.html': 'habas-tostadas',
  'subcategoria-lentejas.html': 'lentejas',
  'subcategoria-maicena.html': 'maicena',
  'subcategoria-maizpopcorn.html': 'maiz-pop-corn',
  'subcategoria-minidpk.html': 'compotas-fruta',
  'subcategoria-planas.html': 'galletas-planas',
  'subcategoria-puredepapa.html': 'pure-de-papa',
  'subcategoria-quinua.html': 'quinua',
  'subcategoria-semola.html': 'semola',
  'subcategoria-sinpreparar.html': 'harina-sin-preparar',
  'subcategoria-sopas.html': 'sopas',
  'categoria-endulzantesnaturales.html': 'endulzantes-naturales',
  'categoria-aceites.html': 'aceites-clasicos',
  'categoria-azucar.html': 'endulzantes-refinados',

  // Clean slugs without .html or with subcategoria- prefix
  'aceites-clasicos': 'aceites-clasicos',
  'aceitesclasicos': 'aceites-clasicos',
  'aceitunas-negras': 'aceitunas-negras',
  'aceitunasnegras': 'aceitunas-negras',
  'aceitunas-verdes': 'aceitunas-verdes',
  'aceitunasverdes': 'aceitunas-verdes',
  'conservas-alimentos': 'conservas-alimentos',
  'alimentosenconserva': 'conservas-alimentos',
  'arroz': 'arroz-anejo-superior',
  'arroz-anejo-superior': 'arroz-anejo-superior',
  'arverjas': 'arverjas',
  'banadas': 'galletas-banadas',
  'galletas-banadas': 'galletas-banadas',
  'cervezas': 'cervezas',
  'chuno': 'chuno',
  'chuño': 'chuno',
  'conservas-bonito': 'conservas-bonito',
  'conservadebonito': 'conservas-bonito',
  'conservas-atun': 'conservas-atun',
  'conservasdeatun': 'conservas-atun',
  'conservas-caballa': 'conservas-caballa',
  'conservasdecaballa': 'conservas-caballa',
  'conservas-jurel': 'conservas-jurel',
  'conservasdejurel': 'conservas-jurel',
  'endulzantes-refinados': 'endulzantes-refinados',
  'endulzantesrefinados': 'endulzantes-refinados',
  'endulzantes-naturales': 'endulzantes-naturales',
  'endulzantesnaturales': 'endulzantes-naturales',
  'frijoles': 'frijoles',
  'conservas-fruta': 'conservas-fruta',
  'frutasenconserva': 'conservas-fruta',
  'habas-tostadas': 'habas-tostadas',
  'habastostadas': 'habas-tostadas',
  'lentejas': 'lentejas',
  'maicena': 'maicena',
  'maiz-pop-corn': 'maiz-pop-corn',
  'maizpopcorn': 'maiz-pop-corn',
  'compotas-fruta': 'compotas-fruta',
  'minidpk': 'compotas-fruta',
  'galletas-planas': 'galletas-planas',
  'planas': 'galletas-planas',
  'pure-de-papa': 'pure-de-papa',
  'puredepapa': 'pure-de-papa',
  'quinua': 'quinua',
  'semola': 'semola',
  'harina-sin-preparar': 'harina-sin-preparar',
  'sinpreparar': 'harina-sin-preparar',
  'harina-preparada': 'harina-preparada',
  'sopas': 'sopas'
};

/**
 * Resolves any slug or legacy path to subcategory data
 */
export function getSubcategoryData(keyOrPath: string): { key: string; data: SubcategoryData } | null {
  if (!keyOrPath) return null;
  const clean = keyOrPath.toLowerCase().trim().replace(/^\//, '');

  // 1. Direct match in CATALOG_DATA
  if (CATALOG_DATA[clean]) {
    return { key: clean, data: CATALOG_DATA[clean] };
  }

  // 2. Direct match in LEGACY_PATH_MAP
  const mappedKey = LEGACY_PATH_MAP[clean];
  if (mappedKey && CATALOG_DATA[mappedKey]) {
    return { key: mappedKey, data: CATALOG_DATA[mappedKey] };
  }

  // 3. Match stripping "subcategoria-" or "categoria-" or ".html"
  const stripped = clean
    .replace(/^subcategoria-/, '')
    .replace(/^categoria-/, '')
    .replace(/\.html$/, '');

  if (CATALOG_DATA[stripped]) {
    return { key: stripped, data: CATALOG_DATA[stripped] };
  }

  if (LEGACY_PATH_MAP[stripped] && CATALOG_DATA[LEGACY_PATH_MAP[stripped]]) {
    const k = LEGACY_PATH_MAP[stripped];
    return { key: k, data: CATALOG_DATA[k] };
  }

  // 4. Try fuzzy match (removing hyphens)
  const normClean = stripped.replace(/-/g, '');
  for (const [k, v] of Object.entries(CATALOG_DATA)) {
    if (k.replace(/-/g, '') === normClean) {
      return { key: k, data: v };
    }
  }

  return null;
}

/**
 * Searches across all products in all subcategories
 */
export function searchAllProducts(query: string): { product: Product; subcatKey: string; subcatName: string }[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: { product: Product; subcatKey: string; subcatName: string }[] = [];
  const seenIds = new Set<string | number>();

  for (const [subcatKey, subcat] of Object.entries(CATALOG_DATA)) {
    const subcatName = subcat.nombre || subcatKey.replace(/-/g, ' ').toUpperCase();
    for (const prod of subcat.productos) {
      if (seenIds.has(prod.id)) continue;
      const matchName = prod.nombre.toLowerCase().includes(q);
      const matchBrand = prod.marca.toLowerCase().includes(q);
      const matchSubcat = subcatName.toLowerCase().includes(q);
      if (matchName || matchBrand || matchSubcat) {
        seenIds.add(prod.id);
        results.push({ product: prod, subcatKey, subcatName });
      }
    }
  }

  return results;
}
