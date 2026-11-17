import type { ManagedProduct, ProductValidationError, ImportValidationResult, OrderDraft } from '../types/index.ts';

export function validateProduct(product: Partial<ManagedProduct>, existing: ManagedProduct[] = [], editing = false, original?: string): ProductValidationError[] {
  const errors: ProductValidationError[] = [];
  const code = typeof product.codigo === 'string' ? product.codigo.trim() : '';
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(code)) errors.push({ field: 'codigo', message: 'Código obligatorio: usa hasta 80 letras, números o guiones.' });
  if (existing.some(p => p.codigo.toLowerCase() === code.toLowerCase() && (!editing || p.codigo.toLowerCase() !== original?.toLowerCase()))) errors.push({ field: 'codigo', message: 'El código ya está registrado.' });
  if (typeof product.nombre !== 'string' || product.nombre.trim().length < 3 || product.nombre.length > 200) errors.push({ field: 'nombre', message: 'El nombre debe tener entre 3 y 200 caracteres.' });
  if (typeof product.categoria !== 'string' || !product.categoria.trim()) errors.push({ field: 'categoria', message: 'La categoría es obligatoria.' });
  if (!Number.isFinite(product.precio) || Number(product.precio) <= 0 || Number(product.precio) > 99999999) errors.push({ field: 'precio', message: 'El precio debe ser finito y mayor a cero.' });
  for (const field of ['stock_minimo', 'stock_actual'] as const) {
    if (!Number.isSafeInteger(product[field]) || Number(product[field]) < 0) errors.push({ field, message: `${field}: ingresa un entero no negativo.` });
  }
  if (product.stock_objetivo !== undefined && (!Number.isSafeInteger(product.stock_objetivo) || product.stock_objetivo < Number(product.stock_minimo))) errors.push({ field: 'stock_objetivo', message: 'El objetivo debe ser un entero mayor o igual al mínimo.' });
  if (product.imagen && !/^(imagenes\/[\w .\-ÁÉÍÓÚÑáéíóúñ()]+\.(png|jpe?g|webp|avif|svg)|https:\/\/[^\s]+)$/i.test(product.imagen)) errors.push({ field: 'imagen', message: 'Usa una imagen de public/imagenes o una URL HTTPS.' });
  return errors;
}

export function validateCatalogImport(input: unknown, existing: ManagedProduct[] = []): ImportValidationResult {
  const result: ImportValidationResult = { totalRows: 0, acceptedRows: [], rejectedRows: [] };
  let rows: unknown[] = [];
  if (Array.isArray(input)) rows = input;
  else if (input && typeof input === 'object') {
    for (const [category, value] of Object.entries(input)) {
      if (!value || typeof value !== 'object' || !Array.isArray(value.productos)) {
        result.rejectedRows.push({ row: 0, item: {}, errors: [`Estructura inválida en ${category}.`] });
        continue;
      }
      rows.push(...value.productos.map((row: unknown) => row && typeof row === 'object' ? { ...row, categoria: value.nombre || category } : row));
    }
  } else result.rejectedRows.push({ row: 0, item: {}, errors: ['El archivo debe contener un arreglo o categorías de productos.'] });
  if (!rows.length && !result.rejectedRows.length) result.rejectedRows.push({ row: 0, item: {}, errors: ['El archivo no contiene productos.'] });
  for (const [index, raw] of rows.entries()) {
    result.totalRows++;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      result.rejectedRows.push({ row: index + 1, item: {}, errors: ['La fila debe ser un objeto de producto.'] });
      continue;
    }
    const item = raw as Partial<ManagedProduct>;
    const errors = validateProduct(item, [...existing, ...result.acceptedRows]);
    if (errors.length) result.rejectedRows.push({ row: index + 1, item, errors: errors.map(e => e.message) });
    else result.acceptedRows.push({ ...item, codigo: item.codigo!.trim().toUpperCase(), nombre: item.nombre!.trim(), categoria: item.categoria!.trim(), activo: item.activo !== false } as ManagedProduct);
  }
  return result;
}

export function validateOrderDraft(order: Partial<OrderDraft>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof order.cliente_nombre !== 'string' || order.cliente_nombre.trim().length < 3 || order.cliente_nombre.length > 200) errors.push('El cliente debe tener entre 3 y 200 caracteres.');
  if (order.estado !== 'BORRADOR') errors.push('Solo se pueden guardar pedidos en BORRADOR.');
  if (!Array.isArray(order.lineas) || !order.lineas.length || order.lineas.length > 100) errors.push('Agrega entre 1 y 100 productos.');
  const seen = new Set<string>();
  for (const line of Array.isArray(order.lineas) ? order.lineas : []) {
    if (!line || !line.producto_id?.trim()) { errors.push('Selecciona un producto válido.'); continue; }
    if (!Number.isSafeInteger(line.cantidad) || line.cantidad <= 0 || line.cantidad > 1000000) errors.push('La cantidad debe ser un entero positivo, hasta 1 000 000.');
    if (!Number.isFinite(line.precio_unitario) || line.precio_unitario <= 0) errors.push('El precio debe ser finito y mayor a cero.');
    if (seen.has(line.producto_id.toUpperCase())) errors.push('El producto aparece repetido; agrupa las cantidades.');
    seen.add(line.producto_id.toUpperCase());
  }
  return { valid: !errors.length, errors };
}

export function calculateAvailability(physical: number, reserved: number) { return Math.max(0, physical - reserved); }
export function replenishmentQuantity(available: number, target: number, incoming = 0) { return Math.max(0, target - available - incoming); }
