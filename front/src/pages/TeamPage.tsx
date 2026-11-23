import { useState } from 'react';
import { rpc } from '../lib/api';
import { useResource,useAction } from '../hooks/useResource';
import { Page, ResourceStatus, Notice } from '../components/OperationUI';
import type { Profile,Role } from '../types';
export function TeamPage(){
  const resource=useResource(()=>rpc<Profile[]>('tca_perfiles'));const action=useAction(resource.refresh);
  const [form,setForm]=useState({p_email:'',p_nombre:'',p_rol:'VENTAS' as Role,p_activo:true});
  return <Page title="Equipo y permisos" description="Asigna perfiles a cuentas creadas o invitadas previamente en Supabase Auth. Los permisos se comprueban también en PostgreSQL.">
    <ResourceStatus {...resource} retry={resource.refresh}/><Notice error={action.error} message={action.message}/>
    <form className="tca-card tca-stack" onSubmit={e=>{e.preventDefault();void action.run(JSON.stringify(form),()=>rpc('tca_asignar_perfil',form),'Perfil actualizado. El cambio de permisos se aplica en las siguientes operaciones.');}}>
      <label>Correo de la cuenta<input required type="email" value={form.p_email} onChange={e=>setForm({...form,p_email:e.target.value})}/></label>
      <label>Nombre<input required minLength={3} maxLength={200} value={form.p_nombre} onChange={e=>setForm({...form,p_nombre:e.target.value})}/></label>
      <label>Rol<select value={form.p_rol} onChange={e=>setForm({...form,p_rol:e.target.value as Role})}><option>GERENCIA</option><option>VENTAS</option><option>ALMACEN</option></select></label>
      <label className="tca-check"><input type="checkbox" checked={form.p_activo} onChange={e=>setForm({...form,p_activo:e.target.checked})}/>Acceso activo</label>
      <button className="tca-button" disabled={action.busy}>Guardar permisos</button>
    </form><div className="tca-table tca-card"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acceso</th><th>Acción</th></tr></thead><tbody>{resource.data?.map(p=><tr key={p.id}><td>{p.nombre}</td><td>{p.email}</td><td>{p.rol}</td><td>{p.activo?'Activo':'Desactivado'}</td><td><button className="tca-button secondary" onClick={()=>setForm({p_email:p.email||'',p_nombre:p.nombre,p_rol:p.rol,p_activo:p.activo})}>Editar</button></td></tr>)}</tbody></table></div>
  </Page>;
}
