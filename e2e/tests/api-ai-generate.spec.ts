import { test, expect } from '@playwright/test';
import { apiBaseURL, tokenAIApi } from '../fixtures/config';
import type { TaskDto } from '../fixtures/task-types';
import { expectTaskDtoShape } from '../fixtures/task-schema';

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
    // Em CI o backend chama OpenRouter; falhas de rede/quota/chave geram 500 e quebram o pipeline.
    // Opt-in: no workflow, env RUN_OPENROUTER_INTEGRATION=1 + secret com a mesma variável tokenAIApi.
    test.skip(
      process.env.CI === 'true' && process.env.RUN_OPENROUTER_INTEGRATION !== '1',
      'CI: omitido por padrão. Para integração real com OpenRouter, defina RUN_OPENROUTER_INTEGRATION=1 e tokenAIApi válido nos secrets.',
    );

    const res = await request.post(`${apiBaseURL}/ai/generate`, {
      headers: { Accept: '*/*', 'Content-Type': 'application/json' },
      data: {
        objective: `[e2e-api-ai] ${Date.now()}`,
        apiKey: tokenAIApi,
      },
    });

    expect(res.status(), await res.text()).toBe(201);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect((body as unknown[]).length).toBeGreaterThan(0);
    for (const item of body as unknown[]) {
      expectTaskDtoShape(item, { isAiGenerated: true });
    }

    await Promise.all(
      (body as TaskDto[]).map((t) => request.delete(`${apiBaseURL}/tasks/${t.id}`)),
    );
  });
});
