import { test, expect } from '@playwright/test';
import { apiBaseURL, tokenAIApi } from '../lib/config';
import type { TaskDto } from '../lib/task-types';

/**
 * Contrato HTTP de `POST /ai/generate` (equivalente ao curl no Swagger / OpenAPI).
 * Testes de UI em `web-rf05-rf06-ia.spec.ts` mockam a rota no browser — aqui validamos a API real.
 */
test.describe.configure({ mode: 'serial' });

test.describe('Contrato API POST /ai/generate', () => {
  test('rejeita payload sem objective', async ({ request }) => {
    const res = await request.post(`${apiBaseURL}/ai/generate`, {
      data: { apiKey: 'sk-placeholder' },
    });
    expect(res.status(), await res.text()).toBe(400);
  });

  test('rejeita payload sem apiKey', async ({ request }) => {
    const res = await request.post(`${apiBaseURL}/ai/generate`, {
      data: { objective: 'objetivo sem chave' },
    });
    expect(res.status(), await res.text()).toBe(400);
  });

  test('rejeita objective vazio', async ({ request }) => {
    const res = await request.post(`${apiBaseURL}/ai/generate`, {
      data: { objective: '', apiKey: 'sk-placeholder' },
    });
    expect(res.status(), await res.text()).toBe(400);
  });

  test('com tokenAIApi no .env: POST retorna 201 e lista de tarefas persistidas', async ({
    request,
  }) => {
    test.skip(!tokenAIApi, 'Defina tokenAIApi no .env da raiz ou em e2e/.env para este teste.');

    const res = await request.post(`${apiBaseURL}/ai/generate`, {
      headers: { Accept: '*/*', 'Content-Type': 'application/json' },
      data: {
        objective: `[e2e-api-ai] ${Date.now()}`,
        apiKey: tokenAIApi,
      },
    });

    expect(res.status(), await res.text()).toBe(201);
    const body = (await res.json()) as TaskDto[];
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
    for (const t of body) {
      expect(t.id).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.isAiGenerated).toBe(true);
    }

    await Promise.all(
      body.map((t) => request.delete(`${apiBaseURL}/tasks/${t.id}`)),
    );
  });
});
