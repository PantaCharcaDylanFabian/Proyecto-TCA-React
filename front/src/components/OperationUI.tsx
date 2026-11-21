import type { ReactNode } from 'react';
export function Notice({ error, message }: { error?: string; message?: string }) {
  return <>{error && <div role="alert" className="tca-error">{error}</div>}{message && <div role="status" className="tca-success">{message}</div>}</>;
}
export function ResourceStatus({ loading, error, retry }: { loading: boolean; error: string; retry: () => unknown }) {
  return <>{loading && <p role="status">Actualizando datos…</p>}{error && <div className="tca-error" role="alert">{error} <button className="tca-button secondary" onClick={() => retry()}>Reintentar</button></div>}</>;
}
export function Page({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="tca-page"><h1>{title}</h1>{description && <p className="tca-muted">{description}</p>}{children}</section>;
}
