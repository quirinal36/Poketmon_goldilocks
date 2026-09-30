import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';

// base './' — 모든 자산을 상대경로로 만들어 배포 경로와 무관하게 불러온다.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Only the public URL and anon key may enter the browser bundle.
  return {
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL ?? env.SUPABASE_PROJECT_URL ?? env.SUPABASE_URL ?? ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY ?? env.SUPABASE_ANON_KEY ?? ''),
    },
    base: './',
    build: {
      target: 'es2020',
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname, 'index.html'),
          questions: resolve(import.meta.dirname, 'questions.html'),
        },
      },
    },
    server: { host: true },
    test: {
      include: ['tests/unit/**/*.test.{ts,mjs}'],
      environment: 'node',
    },
  } as any;
});
