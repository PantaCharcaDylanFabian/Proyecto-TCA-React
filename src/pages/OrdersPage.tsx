import { money, dateTime } from '../utils/format';
import { useState } from 'react';
import { getDraftOrders, saveDraftOrder, confirmOrder, cancelOrder, dispatchOrder, prepareOrder } from '../services/orderService';
import { getManagedProducts } from '../services/productService';
import { useResource, useAction } from '../hooks/useResource';
import { useAuth } from '../context/AuthContext';
import { Page, ResourceStatus, Notice } from '../components/OperationUI';
import { OrderDraftFormModal } from '../components/orders/OrderDraftFormModal';
import { rpc } from '../lib/api';
import { whatsAppUrl } from '../utils/whatsapp';
import type { OrderDraft } from '../types';
import { CameraScanner } from '../components/CameraScanner';

export function OrdersPage() {
  const resource = useResource(async () => ({ orders: (await getDraftOrders()).data, products: (await getManagedProducts()).data }));
  const auth = useAuth(); const action = useAction(resource.refresh);
  const [filter,setFilter] = useState(''); const [status,setStatus] = useState('TODOS');
  const [selected,setSelected] = useState(''); const [editing,setEditing] = useState<OrderDraft | null>(null);
  const [formOpen,setFormOpen] = useState(false); const [partial,setPartial] = useState(false);
  const [scan,setScan] = useState(''); const [preparedQty,setPreparedQty] = useState('1');
  const [whatsapp,setWhatsapp] = useState('');
  const orders=resource.data?.orders || []; const products=resource.data?.products || [];
  const order=orders.find(o => o.id===selected);
  const sales=auth.can('GERENCIA','VENTAS'); const warehouse=auth.can('GERENCIA','ALMACEN');
  const shortage=order?.lineas.some(l => l.cantidad > ((products.find(p => p.codigo===l.producto_id)?.stock_actual || 0)-(products.find(p => p.codigo===l.producto_id)?.stock_reservado || 0)));
  const save = async (o: OrderDraft) => {
    let saved=false; let failure='';
    await action.run(JSON.stringify(o),async key => {
      const result=await saveDraftOrder(o,orders,key);
      if (!result.success) { failure=result.error || 'No se guardó el borrador.'; throw new Error(failure); }
      saved=true; if(result.data) setSelected(result.data.id);
    },'Borrador guardado. No se reservó ni descontó stock.');
    return { success:saved, error: saved ? undefined : failure || 'No se guardó el borrador. Comprueba tu conexión.' };
  };
  return <Page title="Pedidos y despacho" description="Atiende solicitudes web o internas, confirma lo disponible y prepara cada producto antes de despachar.">
    <ResourceStatus {...resource} retry={resource.refresh} /><Notice error={action.error} message={action.message} />
    <div className="tca-row no-print"><label className="grow">Buscar pedido o cliente<input type="search" value={filter} onChange={e => setFilter(e.target.value)} /></label>
      <label>Estado<select value={status} onChange={e => setStatus(e.target.value)}>{['TODOS','BORRADOR','CONFIRMADO','DESPACHADO','CANCELADO'].map(s => <option key={s}>{s}</option>)}</select></label>
      {sales && <button className="tca-button" onClick={() => { setEditing(null); setFormOpen(true); }}>Nuevo borrador</button>}
    </div>
    <div className="tca-table tca-card no-print"><table><thead><tr><th>Pedido / fecha</th><th>Cliente / canal</th><th>Estado</th><th>Total</th><th>Acciones</th></tr></thead><tbody>
      {orders.filter(o => (status==='TODOS'||o.estado===status) && `${o.id} ${o.cliente_nombre} ${o.cliente_documento}`.toLowerCase().includes(filter.toLowerCase())).map(o => <tr key={o.id}><td><small>{o.id}</small><br/>{dateTime(o.created_at)}</td><td>{o.cliente_nombre}<small className="block">{o.canal || 'INTERNO'}</small></td><td><span className={`tca-badge ${o.estado.toLowerCase()}`}>{o.estado}</span></td><td>{money(o.total)}</td><td><button className="tca-button secondary" onClick={() => { setSelected(o.id); setPartial(false); setWhatsapp(''); }}>Ver detalle</button></td></tr>)}
    </tbody></table>{!orders.length && !resource.loading && <p>No hay pedidos registrados.</p>}</div>
    {order && <section className="tca-card tca-stack print-document" aria-label="Detalle del pedido"><h2>{order.constancia || 'Detalle de pedido'}</h2>
      <p><strong>{order.cliente_nombre}</strong> · {order.cliente_documento}<br/>{order.cliente_telefono} · {order.cliente_direccion}</p>
      <p><small>{order.id}</small> · <strong>{order.estado}</strong> · {order.entrega || 'RECOJO'} · {dateTime(order.created_at)}</p>
      <div className="tca-table"><table><thead><tr><th>Producto</th><th>Solicitado</th><th>{order.estado==='BORRADOR'?'Disponible ahora':'Confirmado'}</th><th>Pendiente</th><th>Preparado</th><th>Precio</th></tr></thead><tbody>
        {order.lineas.map(l => { const p=products.find(p => p.codigo===l.producto_id); const available=p && p.activo ? p.stock_actual-(p.stock_reservado||0) : 0; const confirmed=order.estado==='BORRADOR'?Math.min(available,l.cantidad):(l.cantidad_confirmada||0);
          return <tr key={l.producto_id}><td>{l.producto_nombre}<small className="block">{l.producto_id}</small></td><td>{l.cantidad}</td><td>{order.estado==='BORRADOR'?available:confirmed}</td><td>{Math.max(0,l.cantidad-confirmed)>0?<strong className="text-red-700">{l.cantidad-confirmed} pendientes</strong>:'Completo'}</td><td>{l.cantidad_preparada||0}</td><td>{money(l.precio_unitario)}</td></tr>;
        })}</tbody></table></div>
      <p>Total {order.estado==='BORRADOR'?'solicitado':'confirmado'}: <strong>{money(order.total)}</strong>{order.total_solicitado!==order.total && <> · solicitado: {money(order.total_solicitado||0)}</>}</p>
      {order.notas && <p>Observaciones: {order.notas}</p>}
      {order.estado==='BORRADOR' && <div className="no-print"><p className="tca-muted">El borrador no reserva ni descuenta stock. La confirmación vuelve a comprobar la disponibilidad en la base de datos.</p>
        {shortage && <div className="tca-error"><strong>Sin stock suficiente.</strong> Revisa los pendientes antes de confirmar. Los productos sin unidades se excluyen de la reserva; los faltantes quedan registrados.</div>}
        {sales && <><div className="tca-row"><button className="tca-button secondary" onClick={() => { setEditing(order); setFormOpen(true); }}>Editar borrador / Ofrecer otro producto</button></div>
          {shortage && <label className="tca-check"><input type="checkbox" checked={partial} onChange={e => setPartial(e.target.checked)} />Acepto explícitamente entregar solo lo disponible y mantener los faltantes identificados.</label>}
          <button className="tca-button" disabled={action.busy || Boolean(shortage && !partial)} onClick={() => { void action.run(`confirm:${order.id}:${order.version}:${partial}`,key => confirmOrder(order.id,Boolean(shortage && partial),order.version||1,key),'Pedido confirmado. Las unidades fueron reservadas.'); }}>{shortage?'Entregar lo disponible':'Confirmar y reservar'}</button>
        </>}
      </div>}
      {order.estado==='CONFIRMADO' && warehouse && <section className="tca-card no-print"><h3>Preparación con código</h3><p>Escanea el código del producto y registra la cantidad total preparada de ese ítem.</p><CameraScanner onCode={setScan}/>
        <form className="tca-row" onSubmit={e => { e.preventDefault(); const p=products.find(p => p.codigo.toUpperCase()===scan.trim().toUpperCase() || p.codigo_barras===scan.trim()); if(!p) { action.setError('Código no reconocido. Usa un código de los ítems del pedido.'); return; } void action.run(`prepare:${order.id}:${p.codigo}:${preparedQty}`,key => prepareOrder(order.id,p.codigo,Number(preparedQty),key),'Preparación guardada.'); }}>
          <label>Código<input value={scan} onChange={e => setScan(e.target.value)} required placeholder="Escanea o escribe código" /></label><label>Cantidad preparada<input type="number" min="0" step="1" required value={preparedQty} onChange={e => setPreparedQty(e.target.value)} /></label><button className="tca-button secondary" disabled={action.busy}>Registrar preparación</button>
        </form><button className="tca-button" disabled={action.busy || order.lineas.some(l => (l.cantidad_preparada||0)!==(l.cantidad_confirmada||0))} onClick={() => { void action.run(`dispatch:${order.id}`,key => dispatchOrder(order.id,key),'Despacho registrado una sola vez. Constancia interna disponible.'); }}>Confirmar despacho</button>
      </section>}
      {sales && ['BORRADOR','CONFIRMADO'].includes(order.estado) && <button className="tca-button danger no-print" disabled={action.busy} onClick={() => { if(window.confirm('¿Cancelar el pedido y liberar sus reservas?')) void action.run(`cancel:${order.id}`,key => cancelOrder(order.id,key),'Pedido cancelado; reservas liberadas.'); }}>Cancelar pedido</button>}
      {order.constancia && <><p>Constancia interna de entrega. No es un comprobante fiscal SUNAT.</p><button className="tca-button secondary no-print" onClick={() => window.print()}>Imprimir constancia</button></>}
      {sales && ['CONFIRMADO','DESPACHADO'].includes(order.estado) && <div className="no-print"><button className="tca-button secondary" disabled={action.busy} onClick={() => { void action.run(`share:${order.id}`,async () => { const link=await rpc<{token:string}>('tca_link_seguimiento',{p_id:order.id}); const url=new URL('/seguimiento',window.location.origin);url.searchParams.set('id',order.id);url.searchParams.set('token',link.token);setWhatsapp(whatsAppUrl(`Pedido ${order.id}: ${order.estado}. Total ${money(order.total)}. ${order.lineas.map(l=>`${l.producto_nombre}: ${l.cantidad_confirmada||0} confirmados de ${l.cantidad}`).join('; ')}. Seguimiento: ${url}`,order.cliente_telefono)); },'Mensaje preparado. Debes revisarlo y enviarlo manualmente en WhatsApp.'); }}>Preparar confirmación por WhatsApp</button>
        {whatsapp && <p><a className="tca-button" href={whatsapp} target="_blank" rel="noopener noreferrer">Abrir mensaje preparado</a></p>}
      </div>}
    </section>}
    {formOpen && <OrderDraftFormModal key={editing?.id||'new'} isOpen onClose={() => setFormOpen(false)} onSave={save} orderToEdit={editing} existingOrders={orders} availableProducts={products.filter(p=>p.activo)} />}
  </Page>;
}
