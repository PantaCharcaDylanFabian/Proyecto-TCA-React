/**
 * Suite de Pruebas Unitarias y de Integración para el Backend TCA
 * Valida Endpoints REST, Integración con Google Antigravity SDK y Modelos Matemáticos.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { antigravityService } from '../services/antigravityService.js';
import { supabaseService } from '../services/supabaseService.js';

test('1. Antigravity Service: Registro y Metadatos del SDK', () => {
  const status = antigravityService.getStatus();
  assert.equal(status.status, 'ONLINE');
  assert.equal(status.agent, 'TCA-Antigravity-Agent');
  assert.ok(status.toolsRegistered.includes('predecir_demanda'));
  assert.ok(status.toolsRegistered.includes('evaluar_riesgo_inventario'));
  assert.ok(status.toolsRegistered.includes('optimizar_ruta_despacho'));
  assert.ok(status.toolsRegistered.includes('sugerir_reposicion'));
  assert.ok(status.toolsRegistered.includes('benchmark_ml'));
});

test('2. Antigravity Tool: predecir_demanda (Regresión Polinomial Grado 2)', () => {
  const result = antigravityService.toolPredecirDemanda({
    codigo: 'TCA-029085',
    demandaSemanal: 31
  });
  assert.equal(result.herramienta, 'predecir_demanda');
  assert.equal(result.demandaSemanalHistorica, 31);
  assert.ok(result.demandaProyectadaQuincenal > 60);
  assert.equal(result.metricasValidacion.R2, 0.9977);
});

test('3. Antigravity Tool: evaluar_riesgo_inventario (Regresión Logística Sigmoide)', () => {
  const critico = antigravityService.toolEvaluarRiesgo({
    codigo: 'TCA-042822',
    stockActual: 2,
    demandaDiaria: 8.0
  });
  assert.equal(critico.alertaCritica, true);
  assert.equal(critico.nivelAlerta, 'CRÍTICO');

  const seguro = antigravityService.toolEvaluarRiesgo({
    codigo: 'TCA-042822',
    stockActual: 100,
    demandaDiaria: 2.0
  });
  assert.equal(seguro.alertaCritica, false);
  assert.equal(seguro.nivelAlerta, 'SEGURO');
});

test('4. Antigravity Tool: optimizar_ruta_despacho (A* Heurística Admisible vs BFS)', () => {
  const astar = antigravityService.toolOptimizarRuta({
    origen: 'ALMACEN_CENTRAL_CASTILLA',
    destino: 'BELLAVISTA_SULLANA',
    algoritmo: 'ASTAR'
  });
  assert.equal(astar.esOptimoGlobal, true);
  assert.equal(astar.distanciaKm, 43.7);

  const bfs = antigravityService.toolOptimizarRuta({
    origen: 'ALMACEN_CENTRAL_CASTILLA',
    destino: 'BELLAVISTA_SULLANA',
    algoritmo: 'BFS'
  });
  assert.equal(bfs.esOptimoGlobal, false);
  assert.ok(bfs.distanciaKm >= astar.distanciaKm);
});

test('5. Antigravity Tool: benchmark_ml (5-Fold Cross Validation)', () => {
  const bm = antigravityService.getMlBenchmark();
  assert.ok(Array.isArray(bm.modelos));
  assert.equal(bm.modelos.length, 6);
  assert.equal(bm.modelos[0].nombre, 'Gradient Boosting (Ensamble)');
  assert.ok(bm.modelos[0].accuracy >= 0.95);
  assert.ok(bm.modelos[0].crossValScoreMean >= 0.95);
});

test('6. Antigravity Copilot: Procesamiento en Lenguaje Natural', async () => {
  const resDemanda = await antigravityService.processQuery('¿Cuál es la proyección de demanda para TCA-029085?');
  assert.equal(resDemanda.executedTool, 'predecir_demanda');
  assert.ok(resDemanda.thoughtTrace.length > 0);

  const resRuta = await antigravityService.processQuery('Calcula la mejor ruta de despacho con A*');
  assert.equal(resRuta.executedTool, 'optimizar_ruta_despacho');
  assert.ok(resRuta.response.includes('43.7 km'));
});

test('7. Supabase Service: Catálogo e Inventario Resiliente', async () => {
  const { total, data } = await supabaseService.getProductos({ limit: 10 });
  assert.ok(total >= 150, `Debe haber al menos 150 productos (encontrados: ${total})`);
  assert.equal(data.length, 10);

  const inventario = await supabaseService.getInventario();
  assert.ok(inventario.resumen.totalProductos >= 150);
  assert.ok(inventario.resumen.valoracionTotalSoles > 0);
});

test('8. Supabase Service: Registro de Borrador de Pedido Atómico', async () => {
  const pedido = {
    cliente_nombre: 'Bodega San Martín Piura',
    cliente_documento: '20489912345',
    cliente_telefono: '969123456',
    lineas: [
      { producto_id: 'TCA-029085', cantidad: 10, precio_unitario: 7.50 },
      { producto_id: 'TCA-042822', cantidad: 5, precio_unitario: 4.90 }
    ]
  };

  const draft = await supabaseService.guardarPedidoBorrador(pedido);
  assert.equal(draft.estado, 'BORRADOR');
  assert.equal(draft.lineas.length, 2);
  assert.equal(draft.total, 99.50);

  const confirmed = await supabaseService.confirmarPedido(draft.id);
  assert.equal(confirmed.estado, 'CONFIRMADO');
});
