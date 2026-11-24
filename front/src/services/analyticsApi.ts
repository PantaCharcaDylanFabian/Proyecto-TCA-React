export async function requestAnalytics<T>(path: string, service: string, options?: RequestInit): Promise<T> {
  const base = (import.meta.env.VITE_TCA_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:3001' : '')).replace(/\/$/, '');
  let response: Response;
  try {
    response = await fetch(`${base}/api/ai/${path}`, { ...options, signal: AbortSignal.timeout(10000) });
  } catch {
    throw new Error(`No se pudo conectar con el servidor de ${service}. Vuelve a intentar.`);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || data.error) {
    throw new Error(typeof data?.error === 'string' ? data.error : `El servicio de ${service} no devolvió un resultado válido.`);
  }
  return data;
}
