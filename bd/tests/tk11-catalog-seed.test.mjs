import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const findFirst = (candidates) => candidates.find(c => fs.existsSync(c)) || candidates[0];

const DEPURADO_PATH = findFirst([
  path.join(ROOT_DIR, 'data', 'catalogo-depurado.json'),
  path.join(ROOT_DIR, 'bd', 'data', 'catalogo-depurado.json'),
  path.join(ROOT_DIR, 'front', 'src', 'data', 'catalogo-depurado.json'),
  path.join(ROOT_DIR, '..', 'front', 'src', 'data', 'catalogo-depurado.json'),
]);

const SEED_SQL_PATH = findFirst([
  path.join(ROOT_DIR, 'supabase', 'seed.sql'),
  path.join(ROOT_DIR, 'bd', 'supabase', 'seed.sql'),
  path.join(ROOT_DIR, '..', 'bd', 'supabase', 'seed.sql'),
]);

const REPORT_MD_PATH = findFirst([
  path.join(ROOT_DIR, 'INFORME_TK11_DEPURACION_CATALOGO.md'),
  path.join(ROOT_DIR, '..', 'INFORME_TK11_DEPURACION_CATALOGO.md'),
]);

const PUBLIC_DIR = findFirst([
  path.join(ROOT_DIR, 'front', 'public'),
  path.join(ROOT_DIR, '..', 'front', 'public'),
]);

test('TK11 Criterio 1: Origen JSON depurado debe existir y ser válido', () => {
  assert.ok(fs.existsSync(DEPURADO_PATH), `catalogo-depurado.json debe existir en ${DEPURADO_PATH}`);
  const content = fs.readFileSync(DEPURADO_PATH, 'utf8');
  const products = JSON.parse(content);
  assert.ok(Array.isArray(products), 'Debe ser un arreglo de productos');
  assert.ok(products.length >= 150, `Debe contener al menos 150 productos (encontrados: ${products.length})`);
});

test('TK11 Criterio 2: Inventario de imágenes debe resolver todas las referencias sin enlaces rotos', () => {
  const products = JSON.parse(fs.readFileSync(DEPURADO_PATH, 'utf8'));
  const missingFiles = [];

  for (const p of products) {
    const filePath = path.join(PUBLIC_DIR, p.imagen);
    if (!fs.existsSync(filePath)) {
      missingFiles.push({ codigo: p.codigo, imagen: p.imagen, filePath });
    }
  }

  assert.equal(missingFiles.length, 0, `No debe haber imágenes rotas. Fallaron: ${JSON.stringify(missingFiles)}`);
});

test('TK11 Criterio 3: Deduplicación estricta de códigos (0 duplicados)', () => {
  const products = JSON.parse(fs.readFileSync(DEPURADO_PATH, 'utf8'));
  const seen = new Set();
  const duplicates = [];

  for (const p of products) {
    if (!p.codigo || typeof p.codigo !== 'string' || p.codigo.trim() === '') {
      assert.fail(`El producto "${p.nombre}" no tiene código válido.`);
    }
    const code = p.codigo.trim().toUpperCase();
    if (seen.has(code)) {
      duplicates.push(code);
    }
    seen.add(code);
  }

  assert.equal(duplicates.length, 0, `No debe haber códigos duplicados. Duplicados: ${duplicates.join(', ')}`);
});

test('TK11 Criterio 4: Semilla reproducible SQL debe existir y contener cláusula ON CONFLICT', () => {
  assert.ok(fs.existsSync(SEED_SQL_PATH), 'supabase/seed.sql debe existir');
  const sql = fs.readFileSync(SEED_SQL_PATH, 'utf8');
  assert.ok(sql.includes('INSERT INTO public.productos'), 'Debe insertar en public.productos');
  assert.ok(sql.includes('ON CONFLICT (codigo) DO UPDATE'), 'Debe ser idempotente y reproducible con ON CONFLICT');
  assert.ok(sql.includes('TCA-079365'), 'Debe incluir productos verificados');
});

test('TK11 Criterio 5: Trazabilidad del recurso original preservada', () => {
  const products = JSON.parse(fs.readFileSync(DEPURADO_PATH, 'utf8'));
  for (const p of products) {
    assert.ok(p.codigo_original !== undefined, `Producto ${p.codigo} debe preservar codigo_original`);
    assert.ok(p.recurso_origen, `Producto ${p.codigo} debe registrar recurso_origen`);
    assert.ok(p.ruta_origen, `Producto ${p.codigo} debe registrar ruta_origen`);
  }
});

test('TK11 Criterio 6: Confirmación de categorías del negocio (Abarrotes, Bebidas, Limpieza, Útiles)', () => {
  const products = JSON.parse(fs.readFileSync(DEPURADO_PATH, 'utf8'));
  const categories = new Set(products.map((p) => p.macro_categoria));

  assert.ok(categories.has('Alimentos'), 'Debe incluir macro-categoría Alimentos');
  assert.ok(categories.has('Bebidas'), 'Debe incluir macro-categoría Bebidas');
  assert.ok(categories.has('Limpieza del Hogar'), 'Debe incluir categoría Limpieza del documento inicial');
  assert.ok(categories.has('Útiles de Oficina'), 'Debe incluir categoría Útiles del documento inicial');
  assert.ok(fs.existsSync(REPORT_MD_PATH), 'Informe de auditoría debe existir');
});
