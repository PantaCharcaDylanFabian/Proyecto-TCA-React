import { money } from '../utils/format';
import { useState } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { useUI } from '../context/UIContext';
import { useAction } from '../hooks/useResource';
import { submitWebOrder } from '../services/catalogService';
import type { WebOrderResult } from '../services/catalogService';
import { Page, Notice, ResourceStatus } from '../components/OperationUI';
import { whatsAppUrl } from '../utils/whatsapp';

export function CartPage() {
  const commerce = useCommerce(); const { navigate } = useUI(); const action = useAction();
  const [customer, setCustomer] = useState({ cliente_nombre:'', cliente_documento:'', cliente_telefono:'', cliente_direccion:'', notas:'', entrega:'RECOJO' });
  const [result, setResult] = useState<WebOrderResult | null>(null);
  const lines = commerce.cart.map(l => ({ ...l, product: commerce.products.find(p => p.codigo === l.codigo) }));
  const invalid = !lines.length || lines.some(l => !l.product || l.cantidad > l.product.disponible);
  const total = lines.reduce((n,l) => n+l.cantidad*(l.product?.precio||0),0);
  const tracking = result ? `/seguimiento?id=${encodeURIComponent(result.id)}&token=${encodeURIComponent(result.token)}` : '';
  return <Page title="Tu carrito" description="Consultar o agregar productos no reserva stock. Al enviar, revisamos disponibilidad y registramos tu solicitud para Ventas.">
    <ResourceStatus loading={commerce.loading} error={commerce.error} retry={commerce.refresh} /><Notice error={action.error} message={action.message} />
    {result ? <div className="tca-card tca-stack"><h2>Solicitud recibida en Ventas</h2><p>Pedido {result.id}. Estado: <strong>BORRADOR</strong>. Ventas confirmará las cantidades; todavía no hay reserva ni promesa de entrega.</p>
      <a className="tca-button" href={tracking}>Ver seguimiento</a><p>Conserva este enlace privado para consultar el estado.</p>
      <a className="tca-button secondary" href={whatsAppUrl(`Envié la solicitud ${result.id}. Quisiera consultar su atención. Seguimiento: ${window.location.origin}${tracking}`)} target="_blank" rel="noopener noreferrer">Abrir mensaje preparado en WhatsApp</a>
      <p className="tca-muted">Se abre un mensaje para que lo revises y envíes manualmente; no hay envío automático.</p>
    </div> : <>
      {commerce.example && <p className="tca-warning">Carrito de ejemplo: no se pueden enviar pedidos hasta configurar Supabase.</p>}
      <div className="tca-table tca-card"><table><thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Disponible</th><th>Subtotal</th><th>Acción</th></tr></thead><tbody>
        {lines.map(l => <tr key={l.codigo}><td>{l.product?.nombre || `${l.codigo} — producto no disponible`}</td><td>{money(l.product?.precio||0)}</td><td><input aria-label={`Cantidad de ${l.product?.nombre||l.codigo}`} className="w-24" type="number" min="1" max="1000000" step="1" value={l.cantidad} onChange={e => commerce.setQuantity(l.codigo,Number(e.target.value))} /></td><td>{l.product?.disponible||0}{l.cantidad>(l.product?.disponible||0) && <strong className="block text-red-700">Stock insuficiente</strong>}</td><td>{money(l.cantidad*(l.product?.precio||0))}</td><td><button className="tca-button secondary" onClick={() => commerce.setQuantity(l.codigo,0)}>Quitar</button></td></tr>)}
      </tbody></table><p>Total referencial: <strong>{money(total)}</strong>. Los precios se vuelven a calcular al enviar.</p></div>
      {!lines.length ? <button className="tca-button" onClick={() => navigate('/catalogo')}>Elegir productos</button> : <form className="tca-card tca-stack" onSubmit={async e => {
        e.preventDefault(); const payload = { ...customer, lineas: commerce.cart.map(l => ({ producto_id:l.codigo,cantidad:l.cantidad })) };
        if (await action.run(JSON.stringify(payload),async key => { const response=await submitWebOrder(payload,key);setResult(response);commerce.clear(); },'Solicitud guardada en Ventas.')) void commerce.refresh();
      }}>
        <h2>Datos para atender tu solicitud</h2><div className="tca-grid">
          <label>Nombre o razón social<input required minLength={3} maxLength={200} value={customer.cliente_nombre} onChange={e=>setCustomer({...customer,cliente_nombre:e.target.value})} /></label>
          <label>Documento comercial (opcional)<input maxLength={30} value={customer.cliente_documento} onChange={e=>setCustomer({...customer,cliente_documento:e.target.value})} /></label>
          <label>Teléfono<input required type="tel" minLength={7} maxLength={30} value={customer.cliente_telefono} onChange={e=>setCustomer({...customer,cliente_telefono:e.target.value})} /></label>
          <label>Forma de entrega<select value={customer.entrega} onChange={e=>setCustomer({...customer,entrega:e.target.value})}><option value="RECOJO">Recojo</option><option value="DELIVERY">Entrega a domicilio</option></select></label>
        </div>
        <label>Dirección<input required={customer.entrega==='DELIVERY'} maxLength={300} value={customer.cliente_direccion} onChange={e=>setCustomer({...customer,cliente_direccion:e.target.value})} /></label>
        <label>Observaciones<textarea maxLength={1000} value={customer.notas} onChange={e=>setCustomer({...customer,notas:e.target.value})} /></label>
        <p>El pedido queda pendiente de confirmación comercial. No se cobra ni procesa un pago desde esta página.</p>
        <button className="tca-button" disabled={action.busy || invalid || commerce.example || commerce.loading || !!commerce.error}>{action.busy?'Enviando…':'Enviar solicitud a Ventas'}</button>
      </form>}
    </>}
  </Page>;
}
