import { rpc, operationKey, errorMessage } from '../lib/api';
import { validateOrderDraft } from '../domain/validation';
import type { CustomerPreset, OrderDraft } from '../types';
export { validateOrderDraft } from '../domain/validation';

export const CLIENTES_PRUEBA: CustomerPreset[] = [
  { nombre: 'BODEGA DEMO LIMA', documento: 'DEMO-001', telefono: '900000001', direccion: 'Dirección ficticia de prueba, Lima' },
  { nombre: 'LIBRERÍA DEMO LIMA', documento: 'DEMO-002', telefono: '900000002', direccion: 'Dirección ficticia de prueba, Lima' },
];
export async function getDraftOrders(): Promise<{ data: OrderDraft[]; source: 'supabase' }> {
  return { data: await rpc<OrderDraft[]>('tca_pedidos'), source: 'supabase' };
}
export async function saveDraftOrder(order: Omit<OrderDraft, 'id'> & { id?: string }, _existing: OrderDraft[], key = operationKey()) {
  const validation = validateOrderDraft(order);
  if (!validation.valid) return { success: false, error: validation.errors.join(' ') };
  try {
    const data = await rpc<OrderDraft>('tca_guardar_borrador', {
      p_pedido: order, p_id: order.id || null, p_version: order.version ?? null, p_operacion: key,
    });
    return { success: true, data };
  } catch (error) { return { success: false, error: errorMessage(error) }; }
}
export async function deleteDraftOrder(id: string, _existing: OrderDraft[], key = operationKey()) {
  try { await cancelOrder(id, key); return { success: true }; }
  catch (error) { return { success: false, error: errorMessage(error) }; }
}
export const confirmOrder = (id: string, partial: boolean, version: number, key: string) =>
  rpc<OrderDraft>('tca_confirmar', { p_id: id, p_parcial: partial, p_version: version, p_operacion: key });
export const cancelOrder = (id: string, key: string) => rpc<OrderDraft>('tca_cancelar', { p_id: id, p_operacion: key });
export const prepareOrder = (id: string, code: string, quantity: number, key: string) =>
  rpc<OrderDraft>('tca_preparar', { p_id: id, p_codigo: code, p_cantidad: quantity, p_operacion: key });
export const dispatchOrder = (id: string, key: string) => rpc<OrderDraft>('tca_despachar', { p_id: id, p_operacion: key });
