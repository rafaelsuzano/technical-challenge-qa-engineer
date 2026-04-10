import { test, expect } from '../fixtures/tasks.fixture';
import { AiGeneratorPage } from '../pages/AiGeneratorPage';
import { tokenAIApi } from '../fixtures/config';

test.describe('Campo API Key (IA)', () => {
  test('ai-api-key-input aceita e mantém o valor de tokenAIApi do .env', async ({ page, passo }) => {
    test.skip(
      !tokenAIApi,
      'Defina tokenAIApi em `.env` na raiz do repositório ou em `e2e/.env`.',
    );

    await passo('Abrir home e localizar bloco de IA', async () => {
      await page.goto('/');
      const ai = new AiGeneratorPage(page);
      await ai.expectVisible();
    });
    await passo('Preencher campo com tokenAIApi do .env', async () => {
      const ai = new AiGeneratorPage(page);
      await ai.fillApiKey(tokenAIApi);
      await expect(ai.apiKeyInput).toHaveValue(tokenAIApi);
    });
  });
});
