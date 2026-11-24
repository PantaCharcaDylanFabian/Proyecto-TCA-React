import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => {
  const frontendDir = fileURLToPath(new URL('./', import.meta.url));
  const workspaceDir = fileURLToPath(new URL('../', import.meta.url));
  const env = { ...loadEnv(mode, workspaceDir, 'VITE_'), ...loadEnv(mode, frontendDir, 'VITE_') };
  const key = env.VITE_SUPABASE_ANON_KEY || '';
  let privileged = key.startsWith('sb_secret_');
  try { privileged ||= JSON.parse(Buffer.from(key.split('.')[1] || '', 'base64url').toString()).role === 'service_role'; } catch { /* opaque publishable keys are supported */ }
  if (privileged) throw new Error('No se permite una clave privilegiada en VITE_SUPABASE_ANON_KEY. Usa la clave pública.');
  return {
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(key),
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  };
})
