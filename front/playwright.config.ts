import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1, timeout: 30000,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4175', headless: true, channel: process.platform === 'win32' ? 'msedge' : undefined, trace: 'retain-on-failure' },
  webServer: [{
    command: 'node ../back/api/server.js', url: 'http://127.0.0.1:4176/health',
    env: { PORT: '4176', TCA_API_HOST: '127.0.0.1' }, reuseExistingServer: false,
  }, {
    command: 'npm run dev -- --host 127.0.0.1 --port 4175 --strictPort', url: 'http://127.0.0.1:4175', reuseExistingServer: false,
    env: { VITE_SUPABASE_URL: 'http://127.0.0.1:54399', VITE_SUPABASE_ANON_KEY: 'test-public-key', VITE_TCA_API_URL: 'http://127.0.0.1:4176' },
  }],
});
