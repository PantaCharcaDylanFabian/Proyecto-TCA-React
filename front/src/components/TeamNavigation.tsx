import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { errorMessage } from '../lib/api';
import { Notice } from './OperationUI';
export function TeamNavigation() {
  const auth = useAuth(); const { navigate, currentPath } = useUI(); const [error, setError] = useState('');
  const links = [
    ['/apf3','✨ APF 3 (IA & DevOps)',true],
    ['/catalogo','Catálogo',true],['/carrito','Carrito',true],['/panel','Panel',!!auth.profile],
    ['/gestion-productos','Productos',auth.can('GERENCIA')],['/inventario','Inventario',auth.can('GERENCIA','ALMACEN')],
    ['/pedidos','Pedidos',auth.can('GERENCIA','VENTAS','ALMACEN')],['/reposicion','Reposición',auth.can('GERENCIA','ALMACEN')],
    ['/equipo','Equipo',auth.can('GERENCIA')],['/contactos','Contactos',auth.can('GERENCIA','VENTAS')],
  ] as const;
  return <><nav className="tca-team no-print" aria-label="Operaciones TCA">
    {links.filter(l => l[2]).map(([path, label]) => <a key={path} href={path} aria-current={currentPath.split('?')[0] === path ? 'page' : undefined} onClick={e => { e.preventDefault(); navigate(path); }}>{label}</a>)}
    {auth.profile ? <><span>{auth.profile.nombre} · {auth.profile.rol}</span><button onClick={async () => { try { await auth.signOut(); navigate('/login'); } catch (e) { setError(errorMessage(e)); } }}>Cerrar sesión</button></> : <a href="/login">Acceso interno</a>}
  </nav><nav className="tca-mobile-nav no-print" aria-label="Navegación móvil">
    {(auth.profile ? links.filter(l => l[2] && ['/panel','/inventario','/pedidos','/reposicion','/catalogo'].includes(l[0])) : links.filter(l => l[2])).slice(0,5).map(([path,label]) => <a key={path} href={path}>{label}</a>)}
  </nav><Notice error={error} /></>;
}
