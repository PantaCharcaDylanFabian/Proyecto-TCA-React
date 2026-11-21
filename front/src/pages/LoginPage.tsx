import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { configurationError, isConfigured } from '../lib/supabase';
import { errorMessage } from '../lib/api';
import { Notice, Page } from '../components/OperationUI';

export function LoginPage() {
  const auth = useAuth(); const { navigate } = useUI();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  return <Page title="Acceso del equipo TCA" description="Ingresa con tu cuenta autorizada de Gerencia, Ventas o Almacén.">
    <div className="tca-card max-w-lg mx-auto">
      <Notice error={error || auth.error || (!isConfigured ? configurationError : '')} />
      {auth.profile ? <><p>Sesión activa: {auth.profile.nombre} · {auth.profile.rol}</p><button className="tca-button" onClick={() => navigate('/panel')}>Abrir panel</button></> :
        <form className="tca-stack" onSubmit={async e => { e.preventDefault(); setBusy(true); setError(''); try { await auth.signIn(email, password); setPassword(''); navigate('/panel'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }}>
          <label>Correo<input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Contraseña<input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label>
          <button className="tca-button" disabled={busy || !isConfigured}>{busy ? 'Ingresando…' : 'Iniciar sesión'}</button>
        </form>}
      {auth.session && !auth.profile && <button className="tca-button secondary" onClick={() => { void auth.signOut().catch(e => setError(errorMessage(e))); }}>Cerrar sesión</button>}
    </div>
  </Page>;
}
