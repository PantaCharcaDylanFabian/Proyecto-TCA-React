import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProduct, validateCatalogImport } from '../src/domain/validation.ts';
const valid = {codigo:'PRD-001',nombre:'Producto de prueba',categoria:'Útiles',precio:5,stock_minimo:2,stock_actual:20,activo:true};
test('HU11 usa el validador de producción y rechaza duplicados sin distinguir mayúsculas',()=>{
  assert.equal(validateProduct(valid).length,0);
  assert.ok(validateProduct({...valid,codigo:'prd-001'},[valid]).some(e=>e.field==='codigo'));
  assert.equal(validateProduct(valid,[valid],true,valid.codigo).length,0);
});
test('HU11 rechaza precio no finito, stocks negativos/decimales y objetivo bajo el mínimo',()=>{
  for(const precio of [0,-1,NaN,Infinity,null,'5']) assert.ok(validateProduct({...valid,precio}).some(e=>e.field==='precio'));
  for(const stock_actual of [-1,1.5,NaN,Infinity]) assert.ok(validateProduct({...valid,stock_actual}).some(e=>e.field==='stock_actual'));
  assert.ok(validateProduct({...valid,stock_objetivo:1}).some(e=>e.field==='stock_objetivo'));
});
test('HU11 importador real rechaza filas nulas, duplicadas y sin precio; no inventa valores',()=>{
  const result=validateCatalogImport([valid,null,{...valid},{...valid,codigo:'OTRO',stock_actual:-3},{codigo:'SIN-PRECIO',nombre:'Producto',categoria:'Útiles',stock_minimo:1,stock_actual:1}]);
  assert.equal(result.totalRows,5);assert.equal(result.acceptedRows.length,1);assert.equal(result.rejectedRows.length,4);
  const grouped=validateCatalogImport({categoria:{productos:[{id:1,nombre:'Sin código y precio'}]}});
  assert.equal(grouped.acceptedRows.length,0);assert.equal(grouped.rejectedRows.length,1);
});
test('HU11 estructura inválida se registra; imagen admite rutas existentes o HTTPS, no javascript',()=>{
  for(const value of [null,15,'bad']) assert.equal(validateCatalogImport(value).rejectedRows.length,1);
  assert.ok(validateProduct({...valid,imagen:'javascript:alert(1)'}).some(e=>e.field==='imagen'));
  assert.equal(validateProduct({...valid,imagen:'imagenes/aceituna negra sin pepa ELOLIVAR.png'}).length,0);
});
