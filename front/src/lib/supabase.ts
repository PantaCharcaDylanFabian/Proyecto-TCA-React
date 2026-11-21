import { createClient } from '@supabase/supabase-js';

const env = import.meta.env ?? {};
const url = (env.VITE_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const key = env.VITE_SUPABASE_ANON_KEY || '';
const privileged = key.startsWith('sb_secret_') || (() => {
  try { return JSON.parse(atob(key.split('.')[1])).role === 'service_role'; }
  catch { return false; }
})();
export const isConfigured = /^https?:\/\//.test(url) && Boolean(key) && !privileged;
export const configurationError = privileged
  ? 'La configuración contiene una clave privilegiada. Usa únicamente la clave pública de Supabase.'
  : 'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY siguiendo el README.';

// The public preview can open without .env. Services never contact this placeholder.
export const supabase = createClient(isConfigured ? url : 'https://unconfigured.invalid', isConfigured ? key : 'unconfigured', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
