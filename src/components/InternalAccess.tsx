import { lazy } from 'react';
import type { ReactNode } from 'react';
import type { Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { Notice, Page } from './OperationUI';
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
export function InternalAccess({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const auth = useAuth();
  if (auth.loading) return <Page title="Verificando sesión"><p role="status">Espera un momento…</p></Page>;
  if (!auth.profile) return <LoginPage />;
  if (!auth.can(...roles)) return <Page title="Acceso restringido"><Notice error="Tu rol no tiene acceso a esta operación." /></Page>;
  return children;
}
