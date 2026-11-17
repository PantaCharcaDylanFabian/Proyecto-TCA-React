import { useState } from 'react';
import { useAction } from '../hooks/useResource';
import { submitContact } from '../services/catalogService';
import { Notice } from './OperationUI';
import { useUI } from '../context/UIContext';
export function Footer(){
  const [email,setEmail]=useState('');const [subscribed,setSubscribed]=useState(false);const action=useAction();const {openStickyModal}=useUI();
  return <footer className="tca-footer no-print"><div><h2>Distribuidora TCA</h2><p>Catálogo e inventarios conectados para una atención comercial clara.</p><div className="tca-row"><a href="/nosotros">Nosotros</a><a href="/catalogo">Catálogo</a><button className="tca-link" onClick={openStickyModal}>Solicitar contacto</button><a href="/login">Acceso interno</a></div></div><div><h3>Solicitar novedades comerciales</h3><p>Registra tu correo para que el equipo gestione tu suscripción. No se envía un correo automático.</p><Notice error={action.error}/>{subscribed?<p className="tca-success" role="status">Solicitud de suscripción registrada.</p>:<form className="tca-row" onSubmit={async e=>{e.preventDefault();if(await action.run(email,key=>submitContact({tipo:'SUSCRIPCION',nombre:'Suscripción comercial',email},key)))setSubscribed(true);}}><label className="grow">Correo<input required type="email" maxLength={200} value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="tca-button" disabled={action.busy}>{action.busy?'Registrando…':'Suscribirme'}</button></form>}</div></footer>;
}
