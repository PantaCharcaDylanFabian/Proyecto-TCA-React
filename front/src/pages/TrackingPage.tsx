import { money, dateTime } from '../utils/format';
import { useState } from 'react';
import { whatsAppUrl } from '../utils/whatsapp';
import { useUI } from '../context/UIContext';
import { useResource } from '../hooks/useResource';
import { getTracking } from '../services/catalogService';
import { Page, ResourceStatus } from '../components/OperationUI';

const statusMessages: Record<string, string> = {
  BORRADOR: 'Ventas recibió tu solicitud y revisará cuántas unidades puede confirmar.',
  CONFIRMADO: 'Las unidades confirmadas están reservadas y pendientes de despacho.',
  DESPACHADO: 'Se registró el despacho de las unidades confirmadas.',
  CANCELADO: 'La solicitud fue cancelada y se liberaron sus reservas.',
};

export function TrackingPage({ confirmation = false }: { confirmation?: boolean }) {
  const { currentPath } = useUI();
  const params = new URLSearchParams(currentPath.split('?')[1] ?? '');
  const id = params.get('id') ?? '';
  const token = params.get('token') ?? '';
  const valid = id && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(token);

  return <Page title={confirmation ? 'Confirmación de solicitud' : 'Seguimiento de tu solicitud'}>
    {valid ? <TrackingDetails key={`${id}:${token}`} id={id} token={token} confirmation={confirmation} /> : <section className="tca-card">
      <h2>Necesitas el enlace de tu pedido</h2>
      <p>Abre el enlace que recibiste al enviar tu solicitud o el que te compartió Ventas.</p>
      <a className="tca-button secondary" href="/catalogo">Volver al catálogo</a>
    </section>}
  </Page>;
}

function TrackingDetails({ id, token, confirmation }: { id: string; token: string; confirmation: boolean }) {
  const resource = useResource(() => getTracking(id, token));
  const order = resource.data;
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const tracking = new URL('/seguimiento', window.location.origin);
  tracking.search = new URLSearchParams({ id, token }).toString();

  return <>
    <ResourceStatus {...resource} retry={resource.refresh} />
    {order && confirmation && <section className="tca-card">
      <h2>Solicitud recibida en Ventas</h2>
      <p>Conserva el enlace privado del pedido {id} para consultar su estado.</p>
      <div className="tca-row">
        <a className="tca-button" href={tracking.pathname + tracking.search}>Ver seguimiento</a>
        <button className="tca-button secondary" onClick={async () => {
          try { await navigator.clipboard.writeText(tracking.href); setCopyState('copied'); }
          catch { setCopyState('manual'); }
        }}>Copiar enlace de seguimiento</button>
        <a className="tca-link" href={whatsAppUrl(`Quisiera consultar mi pedido ${id}. Seguimiento: ${tracking.href}`)} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
      </div>
      {copyState === 'copied' && <p role="status">Enlace copiado.</p>}
      {copyState === 'manual' && <label className="tca-stack">Selecciona y copia el enlace<input readOnly value={tracking.href} onFocus={event => event.target.select()} /></label>}
    </section>}
    {order ? <div className="tca-checkout">
      <section className="tca-card tca-operation-panel" aria-labelledby="tracking-status">
        <p className="tca-muted">Estado de la solicitud</p>
        <h2 id="tracking-status"><span className={`tca-badge ${order.estado.toLowerCase()}`}>{order.estado}</span></h2>
        <p>{statusMessages[order.estado]}</p>
        <dl className="tca-tracking-meta">
          <div><dt>Pedido</dt><dd>{order.id}</dd></div>
          <div><dt>Última actualización</dt><dd>{dateTime(order.updated_at)}</dd></div>
          <div><dt>Forma de entrega</dt><dd>{order.entrega === 'DELIVERY' ? 'Entrega a domicilio' : 'Recojo'}</dd></div>
        </dl>
        <button className="tca-button secondary" disabled={resource.loading} onClick={() => { void resource.refresh(); }}>Actualizar estado</button>
      </section>

      <section className="tca-card tca-operation-panel" aria-labelledby="tracking-products">
        <h2 id="tracking-products">Productos de la solicitud</h2>
        <ul className="tca-cart-items">
          {order.lineas.map((line, index) => <li key={`${line.nombre}:${index}`}>
            <h3>{line.nombre}</h3>
            <small><strong>{line.solicitado}</strong> {line.solicitado === 1 ? 'unidad solicitada' : 'unidades solicitadas'}</small>
            {order.estado !== 'BORRADOR' && <small className="block"><strong>{line.confirmado ?? 0}</strong> unidades confirmadas</small>}
          </li>)}
        </ul>
        <div className="tca-cart-total"><span>{order.estado === 'BORRADOR' ? 'Total referencial' : 'Total registrado'}</span><strong>{money(order.total)}</strong></div>
      </section>
    </div> : !resource.loading && !resource.error && <p className="tca-empty">No encontramos una solicitud con este enlace. Comprueba que el enlace esté completo.</p>}
  </>;
}
