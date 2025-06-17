import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  testMatch: '**/*.spec.ts',
  timeout: 10000,
  retries: 0,
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
  },
});
