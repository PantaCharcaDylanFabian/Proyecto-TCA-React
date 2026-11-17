import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const key = env.VITE_SUPABASE_ANON_KEY || '';
  let privileged = key.startsWith('sb_secret_');
  try { privileged ||= JSON.parse(Buffer.from(key.split('.')[1] || '', 'base64url').toString()).role === 'service_role'; } catch { /* opaque publishable keys are supported */ }
  if (privileged) throw new Error('No se permite una clave privilegiada en VITE_SUPABASE_ANON_KEY. Usa la clave pública.');
  return {
  plugins: [
    react(),
    tailwindcss(),
  ],
  };
})
