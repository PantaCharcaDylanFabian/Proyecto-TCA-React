import { readFileSync } from 'node:fs';

const models = JSON.parse(readFileSync(new URL('./inventory-models.json', import.meta.url), 'utf8'));
export const forecastEvaluation = models.evaluation;

export function inventoryInputs(scenario) {
  if (!scenario || typeof scenario !== 'object') return null;
  const { precio, stockDisponible, stockMinimo, unidadesSemana, pedidosSemana, plazoDias } = scenario;
  if (!Number.isFinite(precio) || precio <= 0 || precio > 1e9) return null;
  if (![stockDisponible, stockMinimo, unidadesSemana, pedidosSemana, plazoDias].every(
    value => Number.isSafeInteger(value) && value >= 0 && value <= 1e9
  )) return null;
  if (!unidadesSemana || !pedidosSemana || pedidosSemana > unidadesSemana || !plazoDias) return null;
  // Match the coverage feature used by data_loader.py, including its rounding.
  return {
    precio, stock_actual: stockDisponible, stock_minimo: stockMinimo,
    demanda_semanal: unidadesSemana, frecuencia_pedidos: pedidosSemana,
    lead_time_days: plazoDias, dias_inventario: Number((stockDisponible / (unidadesSemana / 7 + 0.01)).toFixed(2)),
  };
}

function linearScore(model, values) {
  return values.reduce((sum, value, index) =>
    sum + model.weights[index] * ((value - model.mean[index]) / model.scale[index]), model.intercept);
}

export function forecastDemand(inputs) {
  const values = models.demand.features.map(key => inputs[key]);
  const expanded = models.demand.powers.map(powers =>
    powers.reduce((product, exponent, index) => product * values[index] ** exponent, 1));
  return linearScore(models.demand, expanded);
}

export function assessSupply(inputs) {
  const riskScore = linearScore(models.risk, models.risk.features.map(key => inputs[key]));
  const tree = models.priority;
  let node = 0;
  while (tree.left[node] !== -1) {
    // scikit-learn decision trees compare float32 features to double thresholds.
    const value = Math.fround(inputs[tree.features[tree.feature[node]]]);
    node = value <= tree.threshold[node] ? tree.left[node] : tree.right[node];
  }
  return {
    probabilidadQuiebre: 1 / (1 + Math.exp(-riskScore)),
    prioridad: ['Baja', 'Media', 'Crítica'][tree.label[node]],
    fueraDeRango: Object.entries(models.ranges).some(([key, [min, max]]) => inputs[key] < min || inputs[key] > max),
  };
}
