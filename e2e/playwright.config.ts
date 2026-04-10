import path from 'path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

// Raiz do repo e, por último, e2e/.env — assim `tokenAIApi` pode vir de qualquer um (e2e sobrescreve).
loadEnv({ path: path.resolve(__dirname, '../.env') });
loadEnv({ path: path.resolve(__dirname, '.env'), override: true });

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  // Um único worker: a API/banco é compartilhada; `deleteAllTasks` no fixture apaga tudo e
  // com vários workers testes em paralelo se invalidam (ex.: persistência após reload).
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    headless: process.env.HEADED === '1' ? false : true,
    trace: 'on-first-retry',
    // Screenshots por passo vêm do fixture `passo` (full page); evita duplicar com print em todo teste
    screenshot: 'only-on-failure',
    // Gravação de vídeo anexada ao relatório HTML em cada teste
    video: 'on',
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
