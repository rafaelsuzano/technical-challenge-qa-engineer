export const apiBaseURL = process.env.API_BASE_URL ?? 'http://localhost:3001';

/**
 * `tokenAIApi` vindo do `.env` (raiz do repo ou `e2e/.env`, carregados em `playwright.config.ts`).
 * Espaços em branco são ignorados.
 */
export const tokenAIApi = (process.env.tokenAIApi ?? '').trim();
