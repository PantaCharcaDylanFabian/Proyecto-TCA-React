import { dateTime } from '../utils/format';
import { rpc } from '../lib/api';
import { useResource } from '../hooks/useResource';
import { Page, ResourceStatus } from '../components/OperationUI';
interface Contact { id:string;tipo:string;nombre:string;email:string;telefono:string;created_at:string; }
export function ContactsPage(){
  const resource=useResource(()=>rpc<Contact[]>('tca_contactos'));
  return <Page title="Solicitudes de contacto" description="Registros recibidos desde el sitio. La atención y el envío de correos se realizan manualmente."><ResourceStatus {...resource} retry={resource.refresh}/><div className="tca-table tca-card"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Nombre</th><th>Correo</th><th>Teléfono</th></tr></thead><tbody>{resource.data?.map(c=><tr key={c.id}><td>{dateTime(c.created_at)}</td><td>{c.tipo}</td><td>{c.nombre}</td><td><a href={`mailto:${c.email}`}>{c.email}</a></td><td>{c.telefono}</td></tr>)}</tbody></table>{resource.data?.length===0&&<p>No hay solicitudes.</p>}</div></Page>;
}
