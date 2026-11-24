import { money } from '../utils/format';
import { useState } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { useAction } from '../hooks/useResource';
import { submitWebOrder } from '../services/catalogService';
import { useUI } from '../context/UIContext';
import { Page, Notice, ResourceStatus } from '../components/OperationUI';

export function CartPage() {
  const commerce = useCommerce(); const action = useAction();
  const [customer, setCustomer] = useState({ cliente_nombre:'', cliente_documento:'', cliente_telefono:'', cliente_direccion:'', notas:'', entrega:'RECOJO' });
  const { navigate } = useUI();
  const lines = commerce.cart.map(l => ({ ...l, product: commerce.products.find(p => p.codigo === l.codigo) }));
  const invalid = !lines.length || lines.some(l => !l.product || l.cantidad > l.product.disponible);
  const total = lines.reduce((n,l) => n+l.cantidad*(l.product?.precio||0),0);
  return <Page title="Tu carrito" description="Revisa tus productos y envía una solicitud a Ventas para confirmar la disponibilidad.">
    <ResourceStatus loading={commerce.loading} error={commerce.error} retry={commerce.refresh} /><Notice error={action.error} message={action.message} />
      {commerce.example && <p className="tca-warning">Carrito de ejemplo: no se pueden enviar pedidos hasta configurar Supabase.</p>}
      {!lines.length ? <section className="tca-card">
        <h2>Tu carrito está vacío</h2>
        <a className="tca-button" href="/catalogo">Elegir productos</a>
      </section> : <div className="tca-checkout">
        <section className="tca-card tca-operation-panel" aria-labelledby="cart-products">
          <h2 id="cart-products">Productos seleccionados</h2>
          <ul className="tca-cart-items">
            {lines.map(({ codigo, product, cantidad }) => <li key={codigo}>
              <div>
                <h3>{product?.nombre || codigo}</h3>
                {product ? <small>{money(product.precio)} por unidad · {product.disponible} disponibles</small> :
                  <small>Producto no disponible</small>}
                {product && cantidad > product.disponible && <strong className="block text-sm text-red-700">Stock insuficiente</strong>}
              </div>
              <div className="tca-row tca-cart-item-controls">
                <label>Cantidad<input aria-label={`Cantidad de ${product?.nombre || codigo}`} type="number" min="1" max="1000000" step="1" value={cantidad} onChange={event => {
                  const value = event.currentTarget.valueAsNumber;
                  if (value >= 1) commerce.setQuantity(codigo, value);
                }} /></label>
                <strong>{product ? money(cantidad * product.precio) : '—'}</strong>
                <button type="button" className="tca-link" aria-label={`Quitar ${product?.nombre || codigo}`} onClick={() => commerce.setQuantity(codigo, 0)}>Quitar</button>
              </div>
            </li>)}
          </ul>
          <div className="tca-cart-total"><span>Total referencial</span><strong>{money(total)}</strong></div>
          <p className="tca-muted">El total se vuelve a calcular al enviar la solicitud.</p>
        </section>
        <form className="tca-card tca-stack tca-operation-panel" onSubmit={async e => {
        e.preventDefault();
        const payload = { ...customer, cliente_direccion: customer.entrega === 'DELIVERY' ? customer.cliente_direccion : '', lineas: commerce.cart.map(l => ({ producto_id:l.codigo,cantidad:l.cantidad })) };
        if (await action.run(JSON.stringify(payload), async key => {
          const { id, token } = await submitWebOrder(payload, key);
          commerce.clear();
          navigate(`/confirmacion?${new URLSearchParams({ id, token })}`);
        })) void commerce.refresh();
      }}>
        <h2>Datos de contacto</h2>
          <label>Nombre o razón social<input required minLength={3} maxLength={200} value={customer.cliente_nombre} onChange={e=>setCustomer({...customer,cliente_nombre:e.target.value})} /></label>
          <label>Documento comercial (opcional)<input maxLength={30} value={customer.cliente_documento} onChange={e=>setCustomer({...customer,cliente_documento:e.target.value})} /></label>
          <label>Teléfono<input required type="tel" minLength={7} maxLength={30} value={customer.cliente_telefono} onChange={e=>setCustomer({...customer,cliente_telefono:e.target.value})} /></label>
        <h3 className="tca-operation-subsection">Entrega</h3>
        <label>Forma de entrega<select value={customer.entrega} onChange={e=>setCustomer({...customer,entrega:e.target.value})}><option value="RECOJO">Recojo</option><option value="DELIVERY">Entrega a domicilio</option></select></label>
        {customer.entrega === 'DELIVERY' && <label>Dirección de entrega<input required autoComplete="street-address" maxLength={300} value={customer.cliente_direccion} onChange={e=>setCustomer({...customer,cliente_direccion:e.target.value})} /></label>}
        <label>Observaciones<textarea maxLength={1000} value={customer.notas} onChange={e=>setCustomer({...customer,notas:e.target.value})} /></label>
        <p className="tca-muted">Ventas confirmará el pedido después de recibir tu solicitud.</p>
        <button className="tca-button" disabled={action.busy || invalid || commerce.example || commerce.loading || !!commerce.error}>{action.busy?'Enviando…':'Enviar solicitud a Ventas'}</button>
      </form></div>}
  </Page>;
}
