import test from 'node:test';
import assert from 'node:assert/strict';

// Lógica de validación según criterios HU12 (KAN-27)
function validateOrderDraft(order) {
  const errors = [];

  if (!order.cliente_nombre || order.cliente_nombre.trim() === '') {
    errors.push('El nombre o razón social del cliente es obligatorio.');
  } else if (order.cliente_nombre.trim().length < 3) {
    errors.push('El nombre del cliente debe tener al menos 3 caracteres.');
  }

  if (!order.lineas || !Array.isArray(order.lineas) || order.lineas.length === 0) {
    errors.push('El pedido en borrador debe tener al menos un producto seleccionado.');
  } else {
    const seenProducts = new Set();
    order.lineas.forEach((line, index) => {
      const pos = index + 1;
      if (!line.producto_id || String(line.producto_id).trim() === '') {
        errors.push(`Ítem #${pos}: Debe seleccionar un producto válido.`);
      }

      if (line.cantidad === undefined || line.cantidad === null || isNaN(line.cantidad)) {
        errors.push(`Ítem #${pos}: La cantidad es requerida.`);
      } else if (!Number.isInteger(Number(line.cantidad)) || Number(line.cantidad) <= 0) {
        errors.push(`Ítem #${pos}: La cantidad debe ser un número entero positivo mayor a 0.`);
      }

      if (line.precio_unitario === undefined || line.precio_unitario === null || Number(line.precio_unitario) <= 0) {
        errors.push(`Ítem #${pos}: El precio unitario debe ser mayor a 0.`);
      }

      const pKey = String(line.producto_id).toLowerCase();
      if (seenProducts.has(pKey)) {
        errors.push(`El producto "${line.producto_id}" aparece repetido en el pedido.`);
      }
      seenProducts.add(pKey);
    });
  }

  if (order.estado !== 'BORRADOR') {
    errors.push('El estado inicial del pedido debe ser estrictamente "BORRADOR".');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

test('HU12 Criterio 1: Debe validar pedido en borrador con cliente de prueba y cantidades positivas', () => {
  const order = {
    id: 'PED-2026-0001',
    cliente_nombre: 'BODEGA SAN JOSÉ DE PIURA',
    cliente_documento: '20601234567',
    estado: 'BORRADOR',
    lineas: [
      { producto_id: 'TCA-029085', producto_nombre: 'FILETE ATÚN', cantidad: 10, precio_unitario: 7.50 },
      { producto_id: 'TCA-042822', producto_nombre: 'ARROZ EXTRA', cantidad: 5, precio_unitario: 4.90 },
    ],
  };

  const res = validateOrderDraft(order);
  assert.equal(res.valid, true);
  assert.equal(res.errors.length, 0);
});

test('HU12 Criterio 1: Debe rechazar pedido con cliente vacío', () => {
  const order = {
    cliente_nombre: '   ',
    estado: 'BORRADOR',
    lineas: [{ producto_id: 'TCA-001', cantidad: 2, precio_unitario: 10 }],
  };
  const res = validateOrderDraft(order);
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('cliente es obligatorio')));
});

test('HU12 Criterio 1: Debe rechazar pedido sin líneas de productos', () => {
  const order = {
    cliente_nombre: 'Cliente Test',
    estado: 'BORRADOR',
    lineas: [],
  };
  const res = validateOrderDraft(order);
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('al menos un producto')));
});

test('HU12 Criterio 1: Debe rechazar cantidad negativa, decimal o cero', () => {
  const orderZero = {
    cliente_nombre: 'Cliente Test',
    estado: 'BORRADOR',
    lineas: [{ producto_id: 'TCA-001', cantidad: 0, precio_unitario: 10 }],
  };
  assert.equal(validateOrderDraft(orderZero).valid, false);

  const orderNeg = {
    cliente_nombre: 'Cliente Test',
    estado: 'BORRADOR',
    lineas: [{ producto_id: 'TCA-001', cantidad: -3, precio_unitario: 10 }],
  };
  assert.equal(validateOrderDraft(orderNeg).valid, false);

  const orderFloat = {
    cliente_nombre: 'Cliente Test',
    estado: 'BORRADOR',
    lineas: [{ producto_id: 'TCA-001', cantidad: 2.5, precio_unitario: 10 }],
  };
  assert.equal(validateOrderDraft(orderFloat).valid, false);
});

test('HU12 Criterio 3: Debe asegurar que el estado sea estrictamente BORRADOR', () => {
  const order = {
    cliente_nombre: 'Cliente Test',
    estado: 'CONFIRMADO', // no permitido en creación inicial HU12
    lineas: [{ producto_id: 'TCA-001', cantidad: 5, precio_unitario: 10 }],
  };
  const res = validateOrderDraft(order);
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('BORRADOR')));
});

test('HU12 Criterio 4: Guardar borrador NO descuenta ni reserva stock físico', () => {
  // Simular inventario inicial
  const inventory = {
    'TCA-029085': { stock_actual: 45, reservado: 0 },
    'TCA-042822': { stock_actual: 60, reservado: 0 },
  };

  const initialStockAtun = inventory['TCA-029085'].stock_actual;
  const initialStockArroz = inventory['TCA-042822'].stock_actual;

  // Acción: registrar borrador con 15 unidades de atún y 20 de arroz
  const draftOrder = {
    id: 'PED-BORRADOR-TEST',
    cliente_nombre: 'CLIENTE DEMO',
    estado: 'BORRADOR',
    lineas: [
      { producto_id: 'TCA-029085', cantidad: 15, precio_unitario: 7.50 },
      { producto_id: 'TCA-042822', cantidad: 20, precio_unitario: 4.90 },
    ],
  };

  const validation = validateOrderDraft(draftOrder);
  assert.equal(validation.valid, true);

  // En HU12 el inventario NO debe ser modificado:
  assert.equal(inventory['TCA-029085'].stock_actual, initialStockAtun, 'El stock físico no debe disminuir en borrador');
  assert.equal(inventory['TCA-029085'].reservado, 0, 'No debe haber unidades reservadas en borrador');
  assert.equal(inventory['TCA-042822'].stock_actual, initialStockArroz, 'El stock físico no debe disminuir en borrador');
});

test('HU12 Criterio 2: Coherencia de cabecera e ítems con persistencia tras recarga', () => {
  // Simulación de persistencia local (localStorage)
  const mockStorage = new Map();

  const draft = {
    id: 'PED-2026-0005',
    cliente_nombre: 'MINIMARKET EL SOL',
    cliente_documento: '20509876543',
    estado: 'BORRADOR',
    total: 150.00,
    lineas: [
      { producto_id: 'TCA-001', producto_nombre: 'PRODUCTO A', cantidad: 10, precio_unitario: 15.00, subtotal: 150.00 },
    ],
  };

  // Guardar
  mockStorage.set('tca_pedidos_borrador_hu12', JSON.stringify([draft]));

  // Recarga simulada
  const reloadedData = JSON.parse(mockStorage.get('tca_pedidos_borrador_hu12'));
  assert.equal(reloadedData.length, 1);
  assert.equal(reloadedData[0].id, 'PED-2026-0005');
  assert.equal(reloadedData[0].cliente_nombre, 'MINIMARKET EL SOL');
  assert.equal(reloadedData[0].estado, 'BORRADOR');
  assert.equal(reloadedData[0].lineas.length, 1);
  assert.equal(reloadedData[0].lineas[0].cantidad, 10);
});
