import { configurationError, isConfigured, supabase } from './supabase';

export function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'No se pudo completar la operación. Comprueba tu conexión e inténtalo de nuevo.';
}

export async function rpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!isConfigured) throw new Error(configurationError);
  const { data, error } = await supabase.rpc(name, args).abortSignal(AbortSignal.timeout(20000));
  if (error) {
    const messages: Record<string, string> = {
      '23505': 'El código o registro ya existe. Actualiza la lista y revisa los duplicados.',
      '23514': 'Hay valores inválidos. Revisa cantidades, precios y parámetros de stock.',
      '23503': 'Una referencia ya no existe o está en uso. Actualiza los datos antes de continuar.',
      '42501': 'Tu cuenta no tiene permiso para realizar esta operación.',
      'PGRST202': 'El servicio aún no está habilitado. El equipo debe aplicar la migración de activación.',
    };
    throw new Error(messages[error.code] || error.message);
  }
  if (typeof window !== 'undefined' && /^(tca_guardar_|tca_importar_|tca_desactivar_|tca_entrada$|tca_confirmar$|tca_cancelar$|tca_despachar$|tca_accion_compra$)/.test(name)) window.dispatchEvent(new Event('tca:changed'));
  return data as T;
}

export const operationKey = (): string => crypto.randomUUID();
