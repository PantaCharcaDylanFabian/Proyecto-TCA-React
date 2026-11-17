import { rpc, operationKey, errorMessage } from '../lib/api';
import { validateProduct } from '../domain/validation';
import type { ManagedProduct, ImportValidationResult } from '../types';
export { validateProduct, validateCatalogImport } from '../domain/validation';

export async function getManagedProducts(): Promise<{ data: ManagedProduct[]; source: 'supabase' }> {
  return { data: await rpc<ManagedProduct[]>('tca_productos'), source: 'supabase' };
}
async function persist(product: ManagedProduct, existing: ManagedProduct[], original: string | null, key: string) {
  const errors = validateProduct(product, existing, original !== null, original ?? undefined);
  if (errors.length) return { success: false, error: errors.map(e => e.message).join(' ') };
  try {
    const data = await rpc<ManagedProduct>('tca_guardar_producto', {
      p_producto: product, p_original: original, p_version: product.version ?? null, p_operacion: key,
    });
    return { success: true, data };
  } catch (error) { return { success: false, error: errorMessage(error) }; }
}
export function saveManagedProduct(product: ManagedProduct, existing: ManagedProduct[], key = operationKey()) {
  return persist(product, existing, null, key);
}
export function updateManagedProduct(original: string, product: ManagedProduct, existing: ManagedProduct[], key = operationKey()) {
  return persist(product, existing, original, key);
}
export async function deleteManagedProduct(codigo: string, _existing: ManagedProduct[]) {
  void _existing;
  try { await rpc('tca_desactivar_producto', { p_codigo: codigo }); return { success: true }; }
  catch (error) { return { success: false, error: errorMessage(error) }; }
}
export async function importAcceptedRows(rows: ManagedProduct[], _existing: ManagedProduct[], rejected: ImportValidationResult['rejectedRows'] = [], key = operationKey()) {
  // The complete batch commits or rolls back. A network failure never becomes success.
  return rpc<{ successCount: number; failedCount: number }>('tca_importar_productos', {
    p_productos: rows, p_rechazos: rejected, p_operacion: key,
  });
}
