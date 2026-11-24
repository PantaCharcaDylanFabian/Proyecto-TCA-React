import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { errorMessage } from '../lib/api';
import type { Role } from '../types';
import { Notice } from './OperationUI';

export interface TeamPageLink {
  paths: string[];
  label: string;
  roles: Role[];
}

export function TeamNavigation({ pages, activePath }: { pages: TeamPageLink[]; activePath: string }) {
  const auth = useAuth();
  const { navigate } = useUI();
  const [error, setError] = useState('');
  const profile = auth.profile;

  async function signOut() {
    setError('');
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      setError(errorMessage(error));
    }
  }

  return <header className="tca-team no-print">
    <div className="tca-workspace-bar">
      <strong>TCA · Panel interno</strong>
      {profile && <>
        <span className="tca-workspace-user">{profile.nombre} · {profile.rol}</span>
        <button type="button" onClick={signOut}>Cerrar sesión</button>
      </>}
      <a href="/">Volver a la tienda</a>
    </div>
    {profile && <nav className="tca-workspace-nav" aria-label="Operaciones TCA">
      {pages.filter(({ roles }) => auth.can(...roles)).map(({ paths, label }) =>
        <a key={paths[0]} href={`/${paths[0]}`} aria-current={paths.includes(activePath) ? 'page' : undefined}>{label}</a>
      )}
    </nav>}
    {error && <div className="tca-workspace-nav"><Notice error={error} /></div>}
  </header>;
}
