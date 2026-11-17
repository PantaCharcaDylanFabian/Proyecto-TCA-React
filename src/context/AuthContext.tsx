import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Profile, Role } from '../types';
import { supabase, isConfigured, configurationError } from '../lib/supabase';
import { errorMessage, rpc } from '../lib/api';

interface AuthState {
  session: Session | null; profile: Profile | null; loading: boolean; error: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  can: (...roles: Role[]) => boolean;
}
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isConfigured);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const invalidate = useCallback(() => { generation.current++; }, []);
  const loadProfile = async () => {
    const current = ++generation.current;
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      const next = data.session ? await rpc<Profile | null>('tca_mi_perfil') : null;
      if (current === generation.current) {
        setSession(data.session); setProfile(next);
        setError(data.session && !next ? 'Tu cuenta no tiene un perfil interno activo. Solicita acceso a Gerencia.' : '');
      }
    } catch (e) { if (current === generation.current) { setProfile(null); setError(errorMessage(e)); } }
    finally { if (current === generation.current) setLoading(false); }
  };
  useEffect(() => {
    if (!isConfigured) return;
    let active = true;
    // Auth callbacks stay synchronous to avoid locking the auth client's session API.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => { if (active) void loadProfile(); }, 0);
    });
    const onFocus = () => { if (active) void loadProfile(); };
    window.addEventListener('focus', onFocus);
    return () => { active = false; invalidate(); subscription.unsubscribe(); window.removeEventListener('focus', onFocus); };
  }, [invalidate]);
  const signIn = async (email: string, password: string) => {
    if (!isConfigured) throw new Error(configurationError);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error('Correo o contraseña inválidos, o cuenta no habilitada.');
    await loadProfile();
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    generation.current++; setSession(null); setProfile(null); setError(''); setLoading(false);
    // Do not erase potentially unsynced records from the previous application.
    // Gerencia can export those records before reconciling them manually.
  };
  return <AuthContext.Provider value={{ session, profile, loading, error, signIn, signOut, refresh: loadProfile, can: (...roles) => Boolean(profile?.activo && roles.includes(profile.rol)) }}>{children}</AuthContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('AuthProvider requerido.');
  return auth;
}
