import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// base './' — 모든 자산을 상대경로로 만든다 (렛츠코딩 라운지 ZIP 업로드 규칙: 루트 절대경로 금지).
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        questions: resolve(__dirname, 'questions.html'),
      },
    },
  },
  server: { host: true },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
} as any);
