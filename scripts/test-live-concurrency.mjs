// Opt-in verification against a TEST Supabase project, with separate auth sessions.
// The normal npm test command never contacts a remote database.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

if(process.env.TCA_LIVE_TEST!=='1') throw new Error('Solo para un proyecto de prueba: configura TCA_LIVE_TEST=1 y las cuentas indicadas en README.');
const config=['VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY','TCA_TEST_MANAGER_EMAIL','TCA_TEST_MANAGER_PASSWORD','TCA_TEST_SALES_EMAIL','TCA_TEST_SALES_PASSWORD'];
for(const key of config)if(!process.env[key])throw new Error(`Falta ${key}`);
const create=()=>createClient(process.env.VITE_SUPABASE_URL,process.env.VITE_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const manager=create(),salesA=create(),salesB=create();
async function signIn(client,email,password){const {error}=await client.auth.signInWithPassword({email,password});if(error)throw new Error('No se pudo iniciar una cuenta de prueba. Revisa configuración y perfiles.');}
async function rpc(client,name,args={}){const {data,error}=await client.rpc(name,args);if(error)throw new Error(error.message);return data;}
const created=[];const code=`TEST-${randomUUID()}`;
try{
  await signIn(manager,process.env.TCA_TEST_MANAGER_EMAIL,process.env.TCA_TEST_MANAGER_PASSWORD);
  await signIn(salesA,process.env.TCA_TEST_SALES_EMAIL,process.env.TCA_TEST_SALES_PASSWORD);
  await signIn(salesB,process.env.TCA_TEST_SALES_EMAIL,process.env.TCA_TEST_SALES_PASSWORD);
  await rpc(manager,'tca_guardar_producto',{p_producto:{codigo:code,nombre:'PRUEBA DE CONCURRENCIA',categoria:'Pruebas',precio:1,stock_minimo:0,stock_actual:10,stock_objetivo:10,activo:true,datos_ejemplo:true},p_original:null,p_version:null,p_operacion:randomUUID()});
  const draft={cliente_nombre:'CLIENTE FICTICIO DE PRUEBA',lineas:[{producto_id:code,cantidad:10}]};
  for(const client of [salesA,salesB])created.push(await rpc(client,'tca_guardar_borrador',{p_pedido:draft,p_id:null,p_version:null,p_operacion:randomUUID()}));
  const requests=await Promise.allSettled([salesA,salesB].map((client,i)=>rpc(client,'tca_confirmar',{p_id:created[i].id,p_parcial:false,p_version:created[i].version,p_operacion:randomUUID()})));
  assert.equal(requests.filter(r=>r.status==='fulfilled').length,1,'Solo una sesión debe obtener las últimas 10 unidades.');
  let product=(await rpc(manager,'tca_productos')).find(p=>p.codigo===code);assert.equal(product.stock_reservado,10);assert.equal(product.stock_actual,10);
  const winner=requests.find(r=>r.status==='fulfilled').value;
  await rpc(manager,'tca_preparar',{p_id:winner.id,p_codigo:code,p_cantidad:10,p_operacion:randomUUID()});
  await Promise.all([1,2].map(()=>rpc(manager,'tca_despachar',{p_id:winner.id,p_operacion:randomUUID()})));
  product=(await rpc(manager,'tca_productos')).find(p=>p.codigo===code);assert.equal(product.stock_actual,0);assert.equal(product.stock_reservado,0);
  console.log('Correcto: reserva concurrente protegida y dos despachos concurrentes sin doble descuento.');
}finally{
  for(const order of created){try{await rpc(manager,'tca_cancelar',{p_id:order.id,p_operacion:randomUUID()});}catch{/* Dispatched records remain auditable. */}}
  try{await rpc(manager,'tca_desactivar_producto',{p_codigo:code});}catch{/* Preserve failed setup for inspection. */}
  await Promise.all([manager,salesA,salesB].map(c=>c.auth.signOut()));
}
