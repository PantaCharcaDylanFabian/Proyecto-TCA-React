import { FormDialog } from '../FormDialog';
import { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { useAction } from '../../hooks/useResource';
import { submitContact } from '../../services/catalogService';
import { Notice } from '../OperationUI';
export function StickyModal(){
  const {isStickyModalOpen,closeStickyModal}=useUI();const action=useAction();
  const [form,setForm]=useState({nombre:'',email:'',telefono:''});const [received,setReceived]=useState(false);
  if(!isStickyModalOpen)return null;
  const close=()=>{if(!action.busy){closeStickyModal();if(received){setForm({nombre:'',email:'',telefono:''});setReceived(false);}}};
  return <FormDialog title="Solicitar contacto" className="tca-dialog" closeLabel="Cerrar contacto" busy={action.busy} onClose={close}>
    <h2>Solicitar contacto</h2><p>Tu solicitud quedará en la bandeja del equipo comercial. La atención no es automática.</p><Notice error={action.error}/>
    {received?<div role="status" className="tca-success">Solicitud registrada. El equipo podrá consultar tus datos para atenderte.</div>:<form className="tca-stack" onSubmit={async e=>{e.preventDefault();if(await action.run(JSON.stringify(form),key=>submitContact({...form,tipo:'CONTACTO'},key),'Solicitud registrada.'))setReceived(true);}}>
      <label>Nombre o razón social<input autoFocus required minLength={3} maxLength={200} value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></label>
      <label>Correo<input type="email" required maxLength={200} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Teléfono<input type="tel" required minLength={7} maxLength={30} value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></label><button className="tca-button" disabled={action.busy}>{action.busy?'Registrando…':'Enviar solicitud'}</button>
    </form>}</FormDialog>;
}
