import { dateTime } from '../utils/format';
import { useState } from 'react';
import { getManagedProducts } from '../services/productService';
import { rpc } from '../lib/api';
import { useAction, useResource } from '../hooks/useResource';
import { useAuth } from '../context/AuthContext';
import { Page, ResourceStatus, Notice } from '../components/OperationUI';
import { replenishmentQuantity } from '../domain/validation';
import type { Purchase } from '../types';

export function ReplenishmentPage() {
  const resource=useResource(async()=>({ products:(await getManagedProducts()).data, purchases:await rpc<Purchase[]>('tca_compras') }));
  const action=useAction(resource.refresh); const auth=useAuth();
  const [quantities,setQuantities]=useState<Record<string,number>>({}); const [supplier,setSupplier]=useState('');
  const products=resource.data?.products||[]; const purchases=resource.data?.purchases||[];
  const alerts=products.filter(p=>p.activo && p.stock_actual-(p.stock_reservado||0)<=p.stock_minimo);
  const incoming=(code:string)=>purchases.filter(c=>['PROPUESTA','APROBADA'].includes(c.estado)).flatMap(c=>c.lineas).filter(l=>l.producto_codigo===code).reduce((s,l)=>s+l.cantidad,0);
  return <Page title="Alertas y reposición" description="Las alertas se activan al alcanzar el mínimo disponible. Revisa la propuesta antes de aprobarla; no se envía automáticamente al proveedor.">
    <ResourceStatus {...resource} retry={resource.refresh}/><Notice error={action.error} message={action.message}/>
    <div className="tca-card"><h2>Regla de sugerencia</h2><p>Disponible = físico − reservado. Cantidad sugerida = máximo de 0 y (objetivo configurado − disponible − compras pendientes).</p><p className="tca-muted">La regla usa parámetros del producto. No supone un historial de ventas de 30 días. La semilla inicial contiene cantidades y precios de ejemplo.</p></div>
    <form className="tca-card tca-stack" onSubmit={async e=>{e.preventDefault();const lines=Object.entries(quantities).map(([producto_codigo,cantidad])=>({producto_codigo,cantidad}));if(!lines.length){action.setError('Selecciona al menos un producto.');return;}const payload={p_lineas:lines,p_proveedor:supplier};if(await action.run(JSON.stringify(payload),key=>rpc('tca_crear_compra',{...payload,p_operacion:key}),'Propuesta creada para revisión. No se envió al proveedor.'))setQuantities({});}}>
      <h2>Productos por reponer ({alerts.length})</h2><div className="tca-table"><table><thead><tr><th>Seleccionar</th><th>Producto</th><th>Físico / reservado</th><th>Disponible</th><th>Mínimo</th><th>Objetivo</th><th>En compras</th><th>Propuesta</th></tr></thead><tbody>{alerts.map(p=>{const available=p.stock_actual-(p.stock_reservado||0);const suggested=replenishmentQuantity(available,p.stock_objetivo||p.stock_minimo,incoming(p.codigo));return <tr key={p.codigo}>
        <td>{auth.can('GERENCIA')&&<input aria-label={`Seleccionar ${p.nombre}`} type="checkbox" checked={p.codigo in quantities} onChange={e=>setQuantities(old=>{const next={...old};if(e.target.checked)next[p.codigo]=Math.max(1,suggested);else delete next[p.codigo];return next;})}/>}</td><td>{p.nombre}</td><td>{p.stock_actual} / {p.stock_reservado||0}</td><td><strong className="text-red-700">{available}</strong></td><td>{p.stock_minimo}</td><td>{p.stock_objetivo}</td><td>{incoming(p.codigo)}</td><td>{p.codigo in quantities?<input aria-label={`Cantidad a comprar de ${p.nombre}`} className="w-24" type="number" required min="1" max="1000000" step="1" value={quantities[p.codigo]} onChange={e=>setQuantities({...quantities,[p.codigo]:Number(e.target.value)})}/>:suggested}</td>
      </tr>;})}</tbody></table></div>{!alerts.length&&<p>No hay productos en el umbral de reposición.</p>}
      {auth.can('GERENCIA')&&<><label>Proveedor de la propuesta<input maxLength={200} value={supplier} onChange={e=>setSupplier(e.target.value)}/></label><button className="tca-button" disabled={action.busy||!Object.keys(quantities).length}>Crear propuesta revisable</button></>}
    </form>
    <div className="tca-card"><h2>Propuestas y órdenes internas</h2>{purchases.map(c=><article className="tca-purchase" key={c.id}><h3>{c.estado} · {c.proveedor||'Proveedor por definir'}</h3><small>{c.id} · {dateTime(c.created_at)}</small><ul>{c.lineas.map(l=><li key={l.producto_codigo}>{l.nombre}: <strong>{l.cantidad}</strong> unidades</li>)}</ul><div className="tca-row">
      {c.estado==='PROPUESTA'&&auth.can('GERENCIA')&&<button className="tca-button" disabled={action.busy} onClick={()=>{void action.run(`approve:${c.id}`,key=>rpc('tca_accion_compra',{p_id:c.id,p_accion:'APROBAR',p_operacion:key}),'Compra aprobada. Coordina el envío al proveedor por tu canal habitual.');}}>Aprobar propuesta</button>}
      {c.estado==='APROBADA'&&<button className="tca-button" disabled={action.busy} onClick={()=>{if(window.confirm('¿Confirmar que se recibieron todas las unidades indicadas?'))void action.run(`receive:${c.id}`,key=>rpc('tca_accion_compra',{p_id:c.id,p_accion:'RECIBIR',p_operacion:key}),'Recepción registrada y orden cerrada.');}}>Recibir todas las unidades</button>}
      {['PROPUESTA','APROBADA'].includes(c.estado)&&auth.can('GERENCIA')&&<button className="tca-button secondary" disabled={action.busy} onClick={()=>{void action.run(`cancelbuy:${c.id}`,key=>rpc('tca_accion_compra',{p_id:c.id,p_accion:'CANCELAR',p_operacion:key}),'Compra cancelada.');}}>Cancelar compra</button>}
    </div></article>)}{!purchases.length&&<p>No hay propuestas registradas.</p>}</div>
  </Page>;
}
