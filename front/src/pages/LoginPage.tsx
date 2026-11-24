import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { configurationError, isConfigured } from '../lib/supabase';
import { errorMessage } from '../lib/api';
import { Notice } from '../components/OperationUI';
import { getImageUrl } from '../utils/image';

export function LoginPage() {
  const auth = useAuth(); const { navigate } = useUI();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  return <section className="tca-login" aria-labelledby="login-title">
    <div className="tca-login-card">
      <div className="tca-login-photo" aria-hidden="true">
        <img className="tca-login-brand" src={getImageUrl('imagenes/TCALOGOINICIO.png')} alt="" />
      </div>
      <div className="tca-login-content">
      <h1 id="login-title">Acceso del equipo TCA</h1>
      <p className="tca-login-intro">{auth.profile ? 'Tu sesión está activa.' : 'Ingresa con tu cuenta de Gerencia, Ventas o Almacén.'}</p>
      <Notice error={error || auth.error || (!isConfigured ? configurationError : '')} />
      {auth.profile ? <><p>{auth.profile.nombre} · {auth.profile.rol}</p><button className="tca-button" onClick={() => navigate('/panel')}>Abrir panel</button></> :
        <form className="tca-stack" onSubmit={async e => { e.preventDefault(); setBusy(true); setError(''); try { await auth.signIn(email, password); setPassword(''); navigate('/panel'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }}>
          <label>Correo<input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <div className="tca-login-password">
            <label htmlFor="login-password">Contraseña</label>
            <div>
              <input id="login-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" aria-controls="login-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </div>
          <button className="tca-button" disabled={busy || !isConfigured}>{busy ? 'Ingresando…' : 'Iniciar sesión'}</button>
        </form>}
      {auth.session && !auth.profile && <button className="tca-button secondary" onClick={() => { void auth.signOut().catch(e => setError(errorMessage(e))); }}>Cerrar sesión</button>}
      </div>
    </div>
  </section>;
}
