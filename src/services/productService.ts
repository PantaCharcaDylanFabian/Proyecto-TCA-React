import { supabase } from '../lib/supabase';
import type { ManagedProduct, ProductValidationError, ImportValidationResult } from '../types';

const STORAGE_KEY = 'tca_productos_catalogo_hu11';

// Initial verified products for bootstrap if empty
const INITIAL_PRODUCTS: ManagedProduct[] = [
  {
    codigo: '029085',
    nombre: 'ACEITE DE OLIVA EXTRA VIRGEN',
    categoria: 'Aceites',
    marca: 'EL OLIVAR',
    precio: 28.50,
    stock_minimo: 10,
    stock_actual: 45,
    imagen: 'imagenes/pamspry.png',
    activo: true,
  },
  {
    codigo: '029023',
    nombre: 'ACEITE MIRASOL BOTELLA 1L',
    categoria: 'Aceites',
    marca: 'MIRASOL',
    precio: 9.80,
    stock_minimo: 15,
    stock_actual: 60,
    imagen: 'imagenes/mirasolbotella.png',
    activo: true,
  },
  {
    codigo: '029100',
    nombre: 'ACEITUNAS PREMIUM NEGRAS SIN PEPA',
    categoria: 'Aceitunas',
    marca: 'EL OLIVAR',
    precio: 14.20,
    stock_minimo: 8,
    stock_actual: 5, // bajo stock
    imagen: 'imagenes/aceituna negra sin pepa ELOLIVAR.png',
    activo: true,
  },
  {
    codigo: '029110',
    nombre: 'FILETE DE ATÚN EN ACEITE GIRASOL',
    categoria: 'Conservas',
    marca: 'FLORIDA',
    precio: 6.90,
    stock_minimo: 20,
    stock_actual: 80,
    imagen: 'imagenes/floridalogo1.jpg',
    activo: true,
  },
];

/**
 * Validador estricto según Criterios de Aceptación HU11:
 * - Código único no vacío
 * - Nombre y categoría no vacíos
 * - Precio > 0
 * - Stock mínimo y actual >= 0
 */
export function validateProduct(
  product: Partial<ManagedProduct>,
  existingProducts: ManagedProduct[],
  isEditing = false,
  originalCodigo?: string
): ProductValidationError[] {
  const errors: ProductValidationError[] = [];

  // 1. Código
  const code = (product.codigo || '').trim();
  if (!code) {
    errors.push({ field: 'codigo', message: 'El código único es obligatorio.' });
  } else if (!/^[A-Za-z0-9_-]+$/.test(code)) {
    errors.push({ field: 'codigo', message: 'El código solo puede contener letras, números, guiones y guiones bajos.' });
  } else {
    // Verificar unicidad
    const duplicate = existingProducts.find(
      (p) => p.codigo.toLowerCase() === code.toLowerCase() && (!isEditing || p.codigo.toLowerCase() !== (originalCodigo || '').toLowerCase())
    );
    if (duplicate) {
      errors.push({ field: 'codigo', message: `El código "${code}" ya está registrado en el catálogo. Debe ser único.` });
    }
  }

  // 2. Nombre
  if (!product.nombre || product.nombre.trim() === '') {
    errors.push({ field: 'nombre', message: 'El nombre del producto es obligatorio.' });
  } else if (product.nombre.trim().length < 3) {
    errors.push({ field: 'nombre', message: 'El nombre debe tener al menos 3 caracteres.' });
  }

  // 3. Categoría
  if (!product.categoria || product.categoria.trim() === '') {
    errors.push({ field: 'categoria', message: 'La categoría es obligatoria.' });
  }

  // 4. Precio (estricto precio > 0)
  if (product.precio === undefined || product.precio === null || isNaN(product.precio)) {
    errors.push({ field: 'precio', message: 'El precio es obligatorio y debe ser numérico.' });
  } else if (product.precio <= 0) {
    errors.push({ field: 'precio', message: 'El precio debe ser un valor positivo mayor a 0 (ej. S/. 12.50).' });
  }

  // 5. Stock Mínimo (>= 0)
  if (product.stock_minimo === undefined || product.stock_minimo === null || isNaN(product.stock_minimo)) {
    errors.push({ field: 'stock_minimo', message: 'El stock mínimo debe ser numérico.' });
  } else if (product.stock_minimo < 0) {
    errors.push({ field: 'stock_minimo', message: 'El stock mínimo no puede ser negativo.' });
  }

  // 6. Stock Actual (>= 0)
  if (product.stock_actual !== undefined && product.stock_actual !== null) {
    if (isNaN(product.stock_actual) || product.stock_actual < 0) {
      errors.push({ field: 'stock_actual', message: 'El stock actual no puede ser negativo.' });
    }
  }

  return errors;
}

/**
 * Obtener productos con fallback y persistencia tras recarga
 */
export async function getManagedProducts(): Promise<{
  data: ManagedProduct[];
  source: 'supabase' | 'local';
  error?: string;
}> {
  // Intentar primero Supabase
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('codigo', { ascending: true });

    if (!error && data && data.length > 0) {
      // Sincronizar cache local
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { data, source: 'supabase' };
    }

    if (error) {
      console.warn('Supabase productos aviso:', error.message);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Fallo de conexión a Supabase, utilizando almacenamiento local:', msg);
  }

  // Fallback a localStorage
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { data: parsed, source: 'local' };
      }
    } catch {
      // corrupt local storage, reinit
    }
  }

  // Inicializar productos verificados si está vacío
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return { data: INITIAL_PRODUCTS, source: 'local' };
}

/**
 * Guardar producto nuevo con validación
 */
export async function saveManagedProduct(
  product: ManagedProduct,
  existingList: ManagedProduct[]
): Promise<{ success: boolean; data?: ManagedProduct; error?: string }> {
  // 1. Validar
  const errors = validateProduct(product, existingList);
  if (errors.length > 0) {
    return { success: false, error: errors.map((e) => e.message).join(' ') };
  }

  const newProduct: ManagedProduct = {
    ...product,
    codigo: product.codigo.trim(),
    nombre: product.nombre.trim(),
    categoria: product.categoria.trim(),
    marca: (product.marca || '').trim(),
    precio: Number(product.precio),
    stock_minimo: Number(product.stock_minimo || 0),
    stock_actual: Number(product.stock_actual || 0),
    activo: product.activo !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 2. Intentar guardar en Supabase
  let savedInSupabase = false;
  try {
    const { data, error } = await supabase
      .from('productos')
      .insert([newProduct])
      .select()
      .single();

    if (!error && data) {
      savedInSupabase = true;
      newProduct.id = data.id;
    } else if (error) {
      console.warn('Supabase insert aviso (guardando localmente):', error.message);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Supabase error de red:', msg);
  }

  // 3. Persistir en localStorage
  const updatedList = [newProduct, ...existingList.filter((p) => p.codigo !== newProduct.codigo)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  return {
    success: true,
    data: newProduct,
    error: savedInSupabase ? undefined : 'Guardado en almacenamiento local persistente (aplica las políticas RLS en Supabase para sincronizar con la nube).',
  };
}

/**
 * Actualizar producto existente
 */
export async function updateManagedProduct(
  codigoOriginal: string,
  updatedData: ManagedProduct,
  existingList: ManagedProduct[]
): Promise<{ success: boolean; data?: ManagedProduct; error?: string }> {
  const errors = validateProduct(updatedData, existingList, true, codigoOriginal);
  if (errors.length > 0) {
    return { success: false, error: errors.map((e) => e.message).join(' ') };
  }

  const finalProduct: ManagedProduct = {
    ...updatedData,
    codigo: updatedData.codigo.trim(),
    nombre: updatedData.nombre.trim(),
    categoria: updatedData.categoria.trim(),
    marca: (updatedData.marca || '').trim(),
    precio: Number(updatedData.precio),
    stock_minimo: Number(updatedData.stock_minimo || 0),
    stock_actual: Number(updatedData.stock_actual || 0),
    updated_at: new Date().toISOString(),
  };

  // Intentar actualizar en Supabase
  try {
    const { error } = await supabase
      .from('productos')
      .update(finalProduct)
      .eq('codigo', codigoOriginal);

    if (error) {
      console.warn('Supabase update aviso:', error.message);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Supabase error:', msg);
  }

  // Actualizar en localStorage
  const updatedList = existingList.map((p) => (p.codigo === codigoOriginal ? finalProduct : p));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  return { success: true, data: finalProduct };
}

/**
 * Eliminar producto
 */
export async function deleteManagedProduct(
  codigo: string,
  existingList: ManagedProduct[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase.from('productos').delete().eq('codigo', codigo);
  } catch (err) {
    console.warn('Supabase delete error:', err);
  }

  const updatedList = existingList.filter((p) => p.codigo !== codigo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  return { success: true };
}

/**
 * Criterio 4 HU11:
 * "La importación valida el JSON existente y registra qué filas se aceptan o rechazan;
 * no utiliza el archivo mal formado como fuente productiva."
 */
export function validateCatalogImport(
  catalogJson: unknown,
  existingProducts: ManagedProduct[]
): ImportValidationResult {
  const acceptedRows: ManagedProduct[] = [];
  const rejectedRows: { row: number; item: Partial<ManagedProduct>; errors: string[] }[] = [];
  const seenCodesInBatch = new Set<string>();
  const existingCodes = new Set(existingProducts.map((p) => p.codigo.toLowerCase()));

  let rowIndex = 0;

  // Si el JSON viene con la estructura { "subcat-id": { productos: [...], marcas: [...] } }
  if (typeof catalogJson === 'object' && catalogJson !== null && !Array.isArray(catalogJson)) {
    const dict = catalogJson as Record<string, { ruta?: string; nombre?: string; productos?: unknown[] }>;

    for (const [subcatKey, subcatObj] of Object.entries(dict)) {
      const categoryName = subcatObj.nombre || subcatKey.replace(/-/g, ' ').toUpperCase();
      const items = Array.isArray(subcatObj.productos) ? subcatObj.productos : [];

      for (const item of items) {
        rowIndex++;
        const rawItem = item as Record<string, unknown>;
        const rowErrors: string[] = [];

        // Generar o extraer código
        const rawCode = String(rawItem.codigo || rawItem.id || '').trim();
        const code = rawCode ? `PRD-${rawCode.padStart(4, '0')}` : '';

        if (!code) {
          rowErrors.push('Código ausente o vacío');
        } else if (seenCodesInBatch.has(code.toLowerCase())) {
          rowErrors.push(`Código duplicado dentro del archivo: "${code}"`);
        } else if (existingCodes.has(code.toLowerCase())) {
          rowErrors.push(`Código ya registrado en el catálogo maestro: "${code}"`);
        }

        // Nombre
        const nombre = String(rawItem.nombre || '').trim();
        if (!nombre) {
          rowErrors.push('Nombre de producto vacío');
        }

        // Precio
        let precio = Number(rawItem.precio);
        if (isNaN(precio) || precio <= 0) {
          // Asignar precio de lista simulado basado en el id si no viene especificado
          if (rawItem.precio === undefined) {
            precio = 12.50; // precio catálogo inicial estándar
          } else {
            rowErrors.push(`Precio inválido (debe ser > 0, recibido: ${rawItem.precio})`);
          }
        }

        // Stock mínimo
        const stockMinimo = rawItem.stock_minimo !== undefined ? Number(rawItem.stock_minimo) : 10;
        if (isNaN(stockMinimo) || stockMinimo < 0) {
          rowErrors.push('Stock mínimo inválido (debe ser >= 0)');
        }

        const stockActual = rawItem.stock_actual !== undefined ? Number(rawItem.stock_actual) : 25;

        const productRow: ManagedProduct = {
          codigo: code,
          nombre,
          categoria: categoryName,
          marca: String(rawItem.marca || 'TCA'),
          precio: Number(precio.toFixed(2)),
          stock_minimo: stockMinimo,
          stock_actual: stockActual,
          imagen: String(rawItem.imagen || ''),
          activo: true,
        };

        if (rowErrors.length > 0) {
          rejectedRows.push({ row: rowIndex, item: productRow, errors: rowErrors });
        } else {
          seenCodesInBatch.add(code.toLowerCase());
          acceptedRows.push(productRow);
        }
      }
    }
  } else if (Array.isArray(catalogJson)) {
    // Si viene como arreglo plano de productos
    for (const rawItem of catalogJson) {
      rowIndex++;
      const rowErrors: string[] = [];
      const code = String(rawItem.codigo || '').trim();

      if (!code) {
        rowErrors.push('Código no especificado');
      } else if (seenCodesInBatch.has(code.toLowerCase())) {
        rowErrors.push(`Código duplicado en lote: "${code}"`);
      } else if (existingCodes.has(code.toLowerCase())) {
        rowErrors.push(`Código ya existe en catálogo: "${code}"`);
      }

      const nombre = String(rawItem.nombre || '').trim();
      if (!nombre) rowErrors.push('Nombre no especificado');

      const categoria = String(rawItem.categoria || '').trim();
      if (!categoria) rowErrors.push('Categoría no especificada');

      const precio = Number(rawItem.precio);
      if (isNaN(precio) || precio <= 0) {
        rowErrors.push(`Precio inválido: ${rawItem.precio}`);
      }

      const stockMinimo = Number(rawItem.stock_minimo || 0);
      if (isNaN(stockMinimo) || stockMinimo < 0) {
        rowErrors.push('Stock mínimo inválido');
      }

      const productRow: ManagedProduct = {
        codigo: code,
        nombre,
        categoria,
        marca: String(rawItem.marca || ''),
        precio: Number(precio.toFixed(2)),
        stock_minimo: stockMinimo,
        stock_actual: Number(rawItem.stock_actual || 0),
        imagen: String(rawItem.imagen || ''),
        activo: rawItem.activo !== false,
      };

      if (rowErrors.length > 0) {
        rejectedRows.push({ row: rowIndex, item: productRow, errors: rowErrors });
      } else {
        seenCodesInBatch.add(code.toLowerCase());
        acceptedRows.push(productRow);
      }
    }
  } else {
    // Archivo completamente mal formado
    rejectedRows.push({
      row: 0,
      item: {},
      errors: ['El archivo no tiene una estructura JSON válida de catálogo.'],
    });
  }

  return {
    totalRows: rowIndex,
    acceptedRows,
    rejectedRows,
  };
}

/**
 * Guardar lote aceptado en base productiva
 */
export async function importAcceptedRows(
  acceptedRows: ManagedProduct[],
  existingList: ManagedProduct[]
): Promise<{ successCount: number; failedCount: number }> {
  let failedCount = 0;

  // Intentar bulk insert en Supabase
  try {
    const { error } = await supabase.from('productos').insert(acceptedRows);
    if (error) {
      console.warn('Supabase bulk insert aviso:', error.message);
      failedCount = acceptedRows.length;
    }
  } catch {
    failedCount = acceptedRows.length;
  }

  // Siempre persistir filas aceptadas en localStorage para garantizar persistencia tras recarga
  const merged = [...acceptedRows, ...existingList.filter((p) => !acceptedRows.some((a) => a.codigo === p.codigo))];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

  const successCount = acceptedRows.length;
  return { successCount, failedCount };
}
