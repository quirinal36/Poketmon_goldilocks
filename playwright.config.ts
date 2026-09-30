import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', timeout: 180000, expect: { timeout: 10000 }, workers: 1,
  use: { baseURL: 'http://127.0.0.1:5301', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run dev -- --port 5301', url: 'http://127.0.0.1:5301', reuseExistingServer: true },
  projects: [{ name: 'landscape', use: { viewport: { width: 1024, height: 768 } } }, { name: 'portrait', use: { viewport: { width: 768, height: 1024 } } }],
});
