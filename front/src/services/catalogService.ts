import seed from '../data/catalogo-depurado.json';
import { rpc } from '../lib/api';
import { isConfigured } from '../lib/supabase';
import type { CommercialProduct } from '../types';

export async function getPublicCatalog(): Promise<{ products: CommercialProduct[]; example: boolean }> {
  if (!isConfigured) return { example: true, products: seed.filter(p => p.activo).map(p => ({
    ...p, codigo_barras: null, disponible: p.stock_actual,
  })) };
  return { products: await rpc<CommercialProduct[]>('tca_catalogo'), example: false };
}

export interface WebOrderResult { id: string; token: string; estado: string; }
export interface Tracking {
  id: string; estado: string; total: number; entrega: string; updated_at: string;
  lineas: { nombre: string; solicitado: number; confirmado: number }[];
}
export const submitWebOrder = (order: Record<string, unknown>, key: string) =>
  rpc<WebOrderResult>('tca_enviar_pedido', { p_pedido: order, p_operacion: key });
export const getTracking = (id: string, token: string) => rpc<Tracking | null>('tca_seguimiento', { p_id: id, p_token: token });
export const submitContact = (data: Record<string, string>, key: string) =>
  rpc<{ id: string }>('tca_contacto', { p_datos: data, p_operacion: key });
