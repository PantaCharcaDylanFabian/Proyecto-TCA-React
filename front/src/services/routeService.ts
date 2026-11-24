import { requestAnalytics } from './analyticsApi';

interface RouteResponse {
  distanciaKm: number;
  rutaSecuencia: string;
}

export type RouteLocations = Record<string, { name: string; lat: number; lng: number }>;
export type RouteGraph = { nodos: RouteLocations; conexiones: Record<string, [string, number][]> };

export async function getRouteLocations() {
  const data = await requestAnalytics<RouteGraph>('routes', 'rutas');
  if (!data.nodos || !Object.keys(data.nodos).length) throw new Error('El servicio de rutas no devolvió los puntos de reparto.');
  return data;
}

export async function calculateRoute(origin: string, destination: string) {
  const data = await requestAnalytics<RouteResponse>('optimal-route', 'rutas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origen: origin, destino: destination, algoritmo: 'ASTAR' }),
  });
  if (typeof data.rutaSecuencia !== 'string' || !Number.isFinite(data.distanciaKm)) throw new Error('El servicio de rutas no devolvió un recorrido válido.');
  if (data.rutaSecuencia === 'Sin ruta') throw new Error('No se encontró una ruta entre los puntos seleccionados.');
  return { path: data.rutaSecuencia.split(' ➔ '), cost: data.distanciaKm };
}
