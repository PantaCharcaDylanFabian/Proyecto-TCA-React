import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createDatabase, asUser, call } from './helpers/database.mjs';

test('PostgreSQL: permisos, inventario, reservas, pedidos y reposición', async t => {
  const db = await createDatabase();
  t.after(() => db.close());
  const product = (code, stock=20) => ({ codigo: code, nombre: `Producto ${code}`, categoria: 'Útiles', precio: 5, stock_actual: stock, stock_minimo: 10, stock_objetivo: 60, codigo_barras: `BAR-${code}`, activo: true });
  const draft = (code, qty) => ({ cliente_nombre: 'Cliente de prueba', cliente_documento: 'DEMO-1', cliente_telefono: '900000001', estado: 'BORRADOR', lineas: [{ producto_id: code, cantidad: qty, precio_unitario: 0.01 }] });
  await asUser(db,'manager');
  let p = await call(db,'tca_guardar_producto',[product('A'),null,null,randomUUID()]);
  assert.equal(p.stock_actual,20);
  await call(db,'tca_guardar_producto',[product('B',30),null,null,randomUUID()]);

  await t.test('entrada 20 + 40 = 60; reintento no duplica y una clave no sirve para otra cantidad', async () => {
    await asUser(db,'warehouse'); const key = randomUUID();
    await call(db,'tca_entrada',['A',40,'GUIA-1','Proveedor demo',key]);
    await call(db,'tca_entrada',['A',40,'GUIA-1','Proveedor demo',key]);
    p = (await call(db,'tca_productos')).find(p=>p.codigo==='A'); assert.equal(p.stock_actual,60);
    assert.equal((await call(db,'tca_movimientos')).filter(m=>m.tipo==='ENTRADA').length,1);
    await assert.rejects(call(db,'tca_entrada',['A',41,'GUIA-1','Proveedor demo',key]),/clave/i);
    await assert.rejects(call(db,'tca_entrada',['A',-1,'','',randomUUID()]),/inválida/);
  });
  await t.test('anon no lee tablas privadas ni ejecuta operaciones internas; Auth sin perfil tampoco', async () => {
    await asUser(db,'anon');
    await assert.rejects(db.query('SELECT * FROM public.pedidos'),/permission denied/);
    await assert.rejects(call(db,'tca_productos'),/permission denied/);
    const catalog = await call(db,'tca_catalogo'); assert.equal(catalog[0].disponible,60);
    assert.ok(!('stock_minimo' in catalog[0]));
    await asUser(db,'outsider'); assert.equal((await db.query('SELECT * FROM public.productos')).rows.length,0);
    await assert.rejects(call(db,'tca_productos'),/permiso/);
  });
  await t.test('Ventas no modifica inventario, Almacén no confirma, roles no se autoasignan', async () => {
    await asUser(db,'sales');
    await assert.rejects(call(db,'tca_entrada',['A',1,'','',randomUUID()]),/permiso/);
    await assert.rejects(db.query(`UPDATE public.perfiles SET rol='GERENCIA'`),/permission denied/);
    await assert.rejects(db.query('SELECT * FROM tca_private.operaciones'),/permission denied/);
    await assert.rejects(call(db,'tca_asignar_perfil',['sales@demo.test','Ventas','GERENCIA',true]),/permiso/);
    await assert.rejects(db.query(`UPDATE public.productos SET stock_actual=999`),/permission denied/);
  });
  let order;
  await t.test('borrador atómico, precio del servidor, ítems persistentes y sin reservas', async () => {
    await asUser(db,'sales'); const key = randomUUID();
    order = await call(db,'tca_guardar_borrador',[draft('B',24),null,null,key]);
    assert.equal(order.total,120); assert.equal(order.lineas[0].cantidad,24);
    const replay = await call(db,'tca_guardar_borrador',[draft('B',24),null,null,key]); assert.equal(replay.id,order.id);
    assert.equal((await call(db,'tca_productos')).find(p=>p.codigo==='B').stock_reservado,0);
    const invalid = draft('B',24); invalid.lineas.push({ producto_id: 'MISSING', cantidad: 1 });
    await assert.rejects(call(db,'tca_guardar_borrador',[invalid,order.id,order.version,randomUUID()]),/no disponible/);
    const restored = (await call(db,'tca_pedidos')).find(o=>o.id===order.id);
    assert.equal(restored.lineas.length,1); assert.equal(restored.version,order.version);
  });
  let first;
  await t.test('dos pedidos no pueden reservar las mismas últimas unidades; entrega parcial explícita', async () => {
    // Reserve 20 of physical 30, leaving 10. Order asks 24 -> 14 pending.
    first = await call(db,'tca_guardar_borrador',[draft('B',20),null,null,randomUUID()]);
    first = await call(db,'tca_confirmar',[first.id,false,first.version,randomUUID()]);
    await assert.rejects(call(db,'tca_confirmar',[order.id,false,order.version,randomUUID()]),/pendiente 14/);
    order = await call(db,'tca_confirmar',[order.id,true,order.version,randomUUID()]);
    assert.equal(order.lineas[0].cantidad_confirmada,10); assert.equal(order.lineas[0].cantidad-order.lineas[0].cantidad_confirmada,14);
    const next=await call(db,'tca_guardar_borrador',[draft('B',1),null,null,randomUUID()]);
    await assert.rejects(call(db,'tca_confirmar',[next.id,false,next.version,randomUUID()]),/stock suficiente/);
    const stock=(await call(db,'tca_productos')).find(p=>p.codigo==='B');assert.equal(stock.stock_reservado,30); assert.equal(stock.stock_actual,30);
  });
  await t.test('cancelar libera reservas; despacho exige preparación y descuenta una sola vez', async () => {
    await call(db,'tca_cancelar',[first.id,randomUUID()]);
    await asUser(db,'warehouse');
    await assert.rejects(call(db,'tca_despachar',[order.id,randomUUID()]),/preparación/);
    await call(db,'tca_preparar',[order.id,'B',10,randomUUID()]);
    const key=randomUUID(); order=await call(db,'tca_despachar',[order.id,key]);
    await call(db,'tca_despachar',[order.id,key]); await call(db,'tca_despachar',[order.id,randomUUID()]);
    const stock=(await call(db,'tca_productos')).find(p=>p.codigo==='B');assert.equal(stock.stock_actual,20); assert.equal(stock.stock_reservado,0);
    assert.equal(order.estado,'DESPACHADO');assert.ok(order.constancia);
    assert.equal((await call(db,'tca_movimientos')).filter(m=>m.tipo==='SALIDA').length,1);
    await assert.rejects(call(db,'tca_confirmar',[order.id,false,order.version,randomUUID()]),/permiso/);
  });
  await t.test('cliente web: disponibilidad revalidada, sin reserva y seguimiento privado por token', async () => {
    await asUser(db,'anon');
    await assert.rejects(call(db,'tca_enviar_pedido',[draft('B',21),randomUUID()]),/Stock insuficiente/);
    const result=await call(db,'tca_enviar_pedido',[draft('B',2),randomUUID()]);
    assert.equal(result.estado,'BORRADOR');
    assert.equal(await call(db,'tca_seguimiento',[result.id,randomUUID()]),null);
    const tracking=await call(db,'tca_seguimiento',[result.id,result.token]);assert.equal(tracking.lineas.length,1);assert.ok(!('cliente_telefono' in tracking));
    await asUser(db,'sales'); assert.equal((await call(db,'tca_productos')).find(p=>p.codigo==='B').stock_reservado,0);
  });
  await t.test('reposición revisable: aprobar y recibir una vez genera entrada', async () => {
    await asUser(db,'manager');
    const buy=await call(db,'tca_crear_compra',[[{ producto_codigo:'B',cantidad:40 }],'Proveedor',randomUUID()]);
    await assert.rejects(call(db,'tca_accion_compra',[buy.id,'RECIBIR',randomUUID()]),/Transición/);
    await call(db,'tca_accion_compra',[buy.id,'APROBAR',randomUUID()]);
    await asUser(db,'warehouse');const key=randomUUID();
    await call(db,'tca_accion_compra',[buy.id,'RECIBIR',key]);await call(db,'tca_accion_compra',[buy.id,'RECIBIR',key]);
    assert.equal((await call(db,'tca_productos')).find(p=>p.codigo==='B').stock_actual,60);
  });
  await t.test('contacto público se guarda sin exponer datos; importación rechaza lote entero inválido', async () => {
    await asUser(db,'anon'); const key=randomUUID();const contact={tipo:'CONTACTO',nombre:'Persona Demo',email:'demo@example.test',telefono:'900000001'};
    await call(db,'tca_contacto',[contact,key]); await call(db,'tca_contacto',[contact,key]);
    await assert.rejects(call(db,'tca_contactos'),/permission denied/);
    await asUser(db,'manager');assert.equal((await call(db,'tca_contactos')).length,1);
    await assert.rejects(call(db,'tca_importar_productos',[[product('C'),product('D',-1)],[],randomUUID()]));
    assert.ok(!(await call(db,'tca_productos')).some(p=>p.codigo==='C'));
  });
  await t.test('edición obsoleta no sobrescribe cambios y guarda la fecha de creación', async () => {
    await asUser(db,'sales');
    const original=await call(db,'tca_guardar_borrador',[draft('A',2),null,null,randomUUID()]);
    const updated=await call(db,'tca_guardar_borrador',[draft('A',3),original.id,original.version,randomUUID()]);
    assert.equal(updated.created_at,original.created_at);assert.equal(updated.version,original.version+1);
    await assert.rejects(call(db,'tca_guardar_borrador',[draft('A',4),original.id,original.version,randomUUID()]),/cambió/);
  });
  await t.test('las restricciones rechazan valores inválidos en llamadas directas y conservan el historial',async()=>{
    await asUser(db,'manager');
    for(const invalid of [{...product('INVALID'),precio:0},{...product('INVALID'),stock_actual:-1},{...product('INVALID'),stock_minimo:-1}]) await assert.rejects(call(db,'tca_guardar_producto',[invalid,null,null,randomUUID()]));
    const current=(await call(db,'tca_productos')).find(p=>p.codigo==='A');
    await assert.rejects(call(db,'tca_guardar_producto',[{...current,stock_actual:999},'A',current.version,randomUUID()]),/entrada o despacho/);
    await call(db,'tca_desactivar_producto',['A']);
    assert.ok((await call(db,'tca_movimientos')).some(m=>m.producto_codigo==='A'));
    assert.ok(!(await call(db,'tca_catalogo')).some(p=>p.codigo==='A'));
  });
});

test('la semilla agrega 160 ejemplos sin resetear stock ni ediciones al repetirse',async t=>{
  const db=await createDatabase();t.after(()=>db.close());
  await db.exec(await readFile('supabase/seed.sql','utf8'));
  await asUser(db,'manager');let products=await call(db,'tca_productos');assert.equal(products.length,160);assert.ok(products.every(p=>p.datos_ejemplo));
  const original=products[0];await call(db,'tca_entrada',[original.codigo,40,'TEST','',randomUUID()]);
  const changed=(await call(db,'tca_productos')).find(p=>p.codigo===original.codigo);
  await call(db,'tca_guardar_producto',[{...changed,precio:99.99},changed.codigo,changed.version,randomUUID()]);
  await db.exec('RESET ROLE');await db.exec(await readFile('supabase/seed.sql','utf8'));
  await asUser(db,'manager');products=await call(db,'tca_productos');assert.equal(products.length,160);
  const saved=products.find(p=>p.codigo===original.codigo);assert.equal(saved.stock_actual,original.stock_actual+40);assert.equal(saved.precio,99.99);
});
