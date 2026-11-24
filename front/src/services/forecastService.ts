import { requestAnalytics } from './analyticsApi';

export interface SupplyScenario {
  precio: number;
  stockDisponible: number;
  stockMinimo: number;
  unidadesSemana: number;
  pedidosSemana: number;
  plazoDias: number;
}

interface SupplyRisk {
  prioridad: 'Baja' | 'Media' | 'Crítica';
  probabilidadQuiebre: number;
  fueraDeRango: boolean;
}

export async function estimateSupply(escenario: SupplyScenario) {
  const request = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ escenario }) };
  const [demand, risk] = await Promise.all([
    requestAnalytics<{ demandaQuincenal: number }>('predict-demand', 'abastecimiento', request),
    requestAnalytics<SupplyRisk>('stockout-risk', 'abastecimiento', request),
  ]);
  if (!Number.isFinite(demand.demandaQuincenal) || demand.demandaQuincenal < 0 ||
      !Number.isFinite(risk.probabilidadQuiebre) || risk.probabilidadQuiebre < 0 || risk.probabilidadQuiebre > 1 ||
      !['Baja', 'Media', 'Crítica'].includes(risk.prioridad) || typeof risk.fueraDeRango !== 'boolean') {
    throw new Error('El servidor no devolvió la previsión del escenario solicitado.');
  }
  return { ...demand, ...risk };
}

interface Evaluation {
  productosEvaluados: number;
  errorDemanda: number;
  aciertoRiesgo: number;
  aciertoPrioridad: number;
}

export async function getForecastEvaluation() {
  const data = await requestAnalytics<Evaluation>('ml-benchmark?uso=reposicion', 'abastecimiento');
  if (![data.productosEvaluados, data.errorDemanda, data.aciertoRiesgo, data.aciertoPrioridad].every(Number.isFinite)) {
    throw new Error('La referencia de precisión no está disponible.');
  }
  return data;
}
