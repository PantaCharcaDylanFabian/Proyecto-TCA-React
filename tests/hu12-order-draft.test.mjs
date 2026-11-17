import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrderDraft,calculateAvailability,replenishmentQuantity } from '../src/domain/validation.ts';
const valid={cliente_nombre:'Cliente Demo',estado:'BORRADOR',lineas:[{producto_id:'PRD-001',cantidad:2,precio_unitario:5}]};
test('HU12 validador real exige cliente, líneas y estado borrador',()=>{
 assert.equal(validateOrderDraft(valid).valid,true);
 assert.equal(validateOrderDraft({...valid,cliente_nombre:''}).valid,false);
 assert.equal(validateOrderDraft({...valid,lineas:[]}).valid,false);
 assert.equal(validateOrderDraft({...valid,estado:'CONFIRMADO'}).valid,false);
});
test('HU12 cantidades positivas enteras y precios finitos; productos sin duplicados',()=>{
 for(const cantidad of [0,-1,1.5,NaN,Infinity]) assert.equal(validateOrderDraft({...valid,lineas:[{...valid.lineas[0],cantidad}]}).valid,false);
 for(const precio_unitario of [0,-1,NaN,Infinity]) assert.equal(validateOrderDraft({...valid,lineas:[{...valid.lineas[0],precio_unitario}]}).valid,false);
 assert.equal(validateOrderDraft({...valid,lineas:[valid.lineas[0],valid.lineas[0]]}).valid,false);
});
test('reglas utilizadas por la interfaz: disponibilidad y reposición con compras pendientes',()=>{
 assert.equal(calculateAvailability(30,10),20);
 assert.equal(replenishmentQuantity(10,60,20),30);
 assert.equal(replenishmentQuantity(60,60),0);
});
