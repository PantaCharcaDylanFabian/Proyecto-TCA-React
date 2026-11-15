import test from 'node:test';
import assert from 'node:assert/strict';

function validateProduct(product, existingProducts = [], isEditing = false, originalCodigo) {
  const errors = [];
  const code = (product.codigo || '').trim();
  if (!code) {
    errors.push({ field: 'codigo', message: 'El código único es obligatorio.' });
  } else if (!/^[A-Za-z0-9_-]+$/.test(code)) {
    errors.push({ field: 'codigo', message: 'El código solo puede contener letras, números, guiones y guiones bajos.' });
  } else {
    const duplicate = existingProducts.find(
      (p) => p.codigo.toLowerCase() === code.toLowerCase() && (!isEditing || p.codigo.toLowerCase() !== (originalCodigo || '').toLowerCase())
    );
    if (duplicate) {
      errors.push({ field: 'codigo', message: `El código "${code}" ya está registrado en el catálogo. Debe ser único.` });
    }
  }

  if (!product.nombre || product.nombre.trim() === '') {
    errors.push({ field: 'nombre', message: 'El nombre del producto es obligatorio.' });
  } else if (product.nombre.trim().length < 3) {
    errors.push({ field: 'nombre', message: 'El nombre debe tener al menos 3 caracteres.' });
  }

  if (!product.categoria || product.categoria.trim() === '') {
    errors.push({ field: 'categoria', message: 'La categoría es obligatoria.' });
  }

  if (product.precio === undefined || product.precio === null || isNaN(product.precio)) {
    errors.push({ field: 'precio', message: 'El precio es obligatorio y debe ser numérico.' });
  } else if (product.precio <= 0) {
    errors.push({ field: 'precio', message: 'El precio debe ser un valor positivo mayor a 0 (ej. S/. 12.50).' });
  }

  if (product.stock_minimo === undefined || product.stock_minimo === null || isNaN(product.stock_minimo)) {
    errors.push({ field: 'stock_minimo', message: 'El stock mínimo debe ser numérico.' });
  } else if (product.stock_minimo < 0) {
    errors.push({ field: 'stock_minimo', message: 'El stock mínimo no puede ser negativo.' });
  }

  if (product.stock_actual !== undefined && product.stock_actual !== null) {
    if (isNaN(product.stock_actual) || product.stock_actual < 0) {
      errors.push({ field: 'stock_actual', message: 'El stock actual no puede ser negativo.' });
    }
  }

  return errors;
}

function validateCatalogImport(catalogJson, existingProducts = []) {
  const acceptedRows = [];
  const rejectedRows = [];
  const seenCodesInBatch = new Set();
  const existingCodes = new Set(existingProducts.map((p) => p.codigo.toLowerCase()));
  let rowIndex = 0;

  if (Array.isArray(catalogJson)) {
    for (const rawItem of catalogJson) {
      rowIndex++;
      const rowErrors = [];
      const code = String(rawItem.codigo || '').trim();

      if (!code) {
        rowErrors.push('Código no especificado');
      } else if (seenCodesInBatch.has(code.toLowerCase())) {
        rowErrors.push(`Código duplicado en lote: "${code}"`);
      } else if (existingCodes.has(code.toLowerCase())) {
        rowErrors.push(`Código ya existe en catálogo: "${code}"`);
      }

      const nombre = String(rawItem.nombre || '').trim();
      if (!nombre) rowErrors.push('Nombre no especificado');

      const categoria = String(rawItem.categoria || '').trim();
      if (!categoria) rowErrors.push('Categoría no especificada');

      const precio = Number(rawItem.precio);
      if (isNaN(precio) || precio <= 0) {
        rowErrors.push(`Precio inválido: ${rawItem.precio}`);
      }

      const stockMinimo = Number(rawItem.stock_minimo !== undefined ? rawItem.stock_minimo : 5);
      if (isNaN(stockMinimo) || stockMinimo < 0) {
        rowErrors.push('Stock mínimo inválido');
      }

      const productRow = {
        codigo: code,
        nombre,
        categoria,
        marca: String(rawItem.marca || ''),
        precio: Number(precio.toFixed(2)),
        stock_minimo: stockMinimo,
        stock_actual: Number(rawItem.stock_actual || 0),
        imagen: String(rawItem.imagen || ''),
        activo: rawItem.activo !== false,
      };

      if (rowErrors.length > 0) {
        rejectedRows.push({ row: rowIndex, item: productRow, errors: rowErrors });
      } else {
        seenCodesInBatch.add(code.toLowerCase());
        acceptedRows.push(productRow);
      }
    }
  }

  return { totalRows: rowIndex, acceptedRows, rejectedRows };
}

test('HU11: Debe aceptar producto con código único, nombre, categoría, precio > 0 y stock >= 0', () => {
  const p = {
    codigo: 'PRD-001',
    nombre: 'ACEITE DE OLIVA EXTRA VIRGEN',
    categoria: 'Aceites',
    precio: 28.5,
    stock_minimo: 10,
    stock_actual: 50,
    imagen: 'imagenes/pamspry.png',
  };
  const errors = validateProduct(p, []);
  assert.equal(errors.length, 0);
});

test('HU11: Debe rechazar código duplicado', () => {
  const existing = [{ codigo: 'PRD-001', nombre: 'Existente', categoria: 'Aceites', precio: 10, stock_minimo: 1, stock_actual: 5, imagen: '' }];
  const p = { codigo: 'PRD-001', nombre: 'Nuevo duplicado', categoria: 'Aceites', precio: 15, stock_minimo: 2, stock_actual: 10, imagen: '' };
  const errors = validateProduct(p, existing);
  assert.ok(errors.some((e) => e.field === 'codigo' && e.message.includes('ya está registrado')));
});

test('HU11: Debe rechazar precio menor o igual a 0', () => {
  const p1 = { codigo: 'PRD-002', nombre: 'Producto Cero', categoria: 'Aceites', precio: 0, stock_minimo: 1, stock_actual: 5, imagen: '' };
  const p2 = { codigo: 'PRD-003', nombre: 'Producto Negativo', categoria: 'Aceites', precio: -5.5, stock_minimo: 1, stock_actual: 5, imagen: '' };
  assert.ok(validateProduct(p1, []).some((e) => e.field === 'precio'));
  assert.ok(validateProduct(p2, []).some((e) => e.field === 'precio'));
});

test('HU11: Debe rechazar stock mínimo negativo', () => {
  const p = { codigo: 'PRD-004', nombre: 'Producto Stock Negativo', categoria: 'Aceites', precio: 10, stock_minimo: -1, stock_actual: 5, imagen: '' };
  const errors = validateProduct(p, []);
  assert.ok(errors.some((e) => e.field === 'stock_minimo'));
});

test('HU11 Importación: Debe registrar qué filas se aceptan o rechazan sin usar archivo mal formado como fuente', () => {
  const rawBatch = [
    { codigo: 'PRD-101', nombre: 'Producto Válido 1', categoria: 'Abarrotes', precio: 15.0, stock_minimo: 5, stock_actual: 20 },
    { codigo: 'PRD-102', nombre: '', categoria: 'Abarrotes', precio: 12.0, stock_minimo: 5 }, // inválido: sin nombre
    { codigo: 'PRD-103', nombre: 'Producto Precio Inválido', categoria: 'Abarrotes', precio: -3.0, stock_minimo: 5 }, // inválido: precio negativo
    { codigo: 'PRD-101', nombre: 'Producto Duplicado', categoria: 'Abarrotes', precio: 20.0, stock_minimo: 5 }, // inválido: duplicado en lote
    { codigo: 'PRD-104', nombre: 'Producto Válido 2', categoria: 'Lácteos', precio: 8.5, stock_minimo: 2, stock_actual: 10 },
  ];

  const result = validateCatalogImport(rawBatch, []);
  assert.equal(result.totalRows, 5);
  assert.equal(result.acceptedRows.length, 2);
  assert.equal(result.rejectedRows.length, 3);

  // Fila 2 rechazada por nombre
  assert.ok(result.rejectedRows.find((r) => r.row === 2)?.errors.some((e) => e.includes('Nombre')));
  // Fila 3 rechazada por precio
  assert.ok(result.rejectedRows.find((r) => r.row === 3)?.errors.some((e) => e.includes('Precio')));
  // Fila 4 rechazada por duplicado
  assert.ok(result.rejectedRows.find((r) => r.row === 4)?.errors.some((e) => e.includes('duplicado')));

  // Las aceptadas son exactamente PRD-101 y PRD-104
  assert.deepEqual(result.acceptedRows.map((r) => r.codigo), ['PRD-101', 'PRD-104']);
});
