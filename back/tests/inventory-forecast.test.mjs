import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inventoryInputs, forecastDemand, assessSupply } from '../services/inventoryForecast.js';

const artifact = JSON.parse(readFileSync(new URL('../services/inventory-models.json', import.meta.url), 'utf8'));
test('las predicciones desplegadas reproducen los resultados de scikit-learn', () => {
  for (const sample of artifact.references) {
    const result = assessSupply(sample.inputs);
    assert.ok(Math.abs(forecastDemand(sample.inputs) - sample.demand) < 1e-8);
    assert.ok(Math.abs(result.probabilidadQuiebre - sample.risk) < 1e-9);
    assert.equal(result.prioridad, ['Baja', 'Media', 'Crítica'][sample.priority]);
  }
});

test('un escenario admite existencias agotadas y exige cantidades válidas', () => {
  const scenario = { precio: 8, stockDisponible: 0, stockMinimo: 3, unidadesSemana: 35, pedidosSemana: 7, plazoDias: 5 };
  assert.equal(inventoryInputs(scenario).dias_inventario, 0);
  assert.equal(inventoryInputs({ ...scenario, unidadesSemana: 0 }), null);
  assert.equal(inventoryInputs({ ...scenario, pedidosSemana: 36 }), null);
  assert.equal(inventoryInputs({ ...scenario, plazoDias: -1 }), null);
});
