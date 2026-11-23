import { money, dateTime } from '../utils/format';
import { useUI } from '../context/UIContext';
import { useResource } from '../hooks/useResource';
import { getTracking } from '../services/catalogService';
import { Page, ResourceStatus } from '../components/OperationUI';
export function TrackingPage() {
  const { currentPath } = useUI(); const params=new URLSearchParams(currentPath.split('?')[1]||'');
  const id=params.get('id')||''; const token=params.get('token')||'';
  const resource=useResource(async () => {
    if(!id || !/^[\da-f-]{36}$/i.test(token)) throw new Error('El enlace de seguimiento está incompleto. Usa el enlace recibido al registrar tu pedido.');
    return getTracking(id,token);
  },`${id}:${token}`);
  return <Page title="Seguimiento de tu solicitud"><ResourceStatus {...resource} retry={resource.refresh} />
    {resource.data ? <div className="tca-card"><h2>{resource.data.estado}</h2><small>{resource.data.id}</small><p>Última actualización: {dateTime(resource.data.updated_at)}</p>
      {resource.data.estado==='BORRADOR' && <p>Ventas recibió tu solicitud y debe confirmar las cantidades. No hay reserva ni entrega prometida.</p>}
      {resource.data.estado==='CONFIRMADO' && <p>Las cantidades confirmadas están reservadas y pendientes de despacho.</p>}
      {resource.data.estado==='DESPACHADO' && <p>Se registró el despacho de las cantidades confirmadas.</p>}
      {resource.data.estado==='CANCELADO' && <p>La solicitud fue cancelada. Sus reservas fueron liberadas.</p>}
      <ul>{resource.data.lineas.map((l,i)=><li key={i}>{l.nombre}: {l.solicitado} solicitados · {l.confirmado} confirmados</li>)}</ul>
      <p>Total: {money(resource.data.total)} · {resource.data.entrega}</p><button className="tca-button secondary" onClick={()=>{void resource.refresh();}}>Actualizar estado</button>
    </div> : !resource.loading && !resource.error && <p className="tca-error">No encontramos una solicitud con este enlace.</p>}
  </Page>;
}
