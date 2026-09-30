import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', timeout: 180000, expect: { timeout: 10000 }, workers: 1,
  use: { baseURL: 'http://127.0.0.1:5301', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    command: 'npm run dev -- --port 5301', url: 'http://127.0.0.1:5301', reuseExistingServer: true,
    // End-to-end tests use local saves unless auth.spec.ts supplies its own mock Supabase server.
    env: { VITE_SUPABASE_URL: '', SUPABASE_PROJECT_URL: '', SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '', SUPABASE_ANON_KEY: '' },
  },
  projects: [{ name: 'landscape', use: { viewport: { width: 1024, height: 768 } } }, { name: 'portrait', use: { viewport: { width: 768, height: 1024 } } }],
});
