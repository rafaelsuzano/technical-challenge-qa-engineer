import { test, expect } from '../fixtures/tasks.fixture';
import { apiBaseURL } from '../lib/config';
import { fakeTask } from '../lib/fake-tasks';
import { AiGeneratorPage } from '../pages/AiGeneratorPage';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('RF-05 / RF-06 — Geração por IA (API mockada)', () => {
  test('RF-05: com objetivo vazio, gerar não adiciona tarefas', async ({ page }) => {
    await page.goto('/');
    const list = new TaskListPage(page);
    await list.expectLoaded();
    const before = await page.getByTestId('task-item').count();

    const ai = new AiGeneratorPage(page);
    await ai.objectiveInput.fill('');
    await ai.generateButton.click();

    await expect.poll(async () => page.getByTestId('task-item').count()).toBe(before);
  });

  test('RF-05: indicador de carregamento durante POST /ai/generate', async ({ page }) => {
    await page.route(`${apiBaseURL}/ai/generate`, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await new Promise((r) => setTimeout(r, 900));
      const body = [
        fakeTask({ title: `[e2e] IA delay 1`, isAiGenerated: true }),
        fakeTask({ title: `[e2e] IA delay 2`, isAiGenerated: true }),
      ];
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });

    await page.goto('/');
    const ai = new AiGeneratorPage(page);
    await ai.expectVisible();
    await ai.fillObjective('Objetivo de teste com mock');
    await ai.fillApiKey('sk-mock-key');
    await ai.generateButton.click();

    await expect(ai.generateButton).toHaveText('Carregando...', { timeout: 5_000 });
    await expect
      .poll(async () => ai.generateButton.textContent())
      .toContain('Gerar tarefas');
  });

  test('RF-05: subtarefas mockadas aparecem na lista com badge IA', async ({ page }) => {
    const t1 = `[e2e] IA badge A ${Date.now()}`;
    const t2 = `[e2e] IA badge B ${Date.now()}`;

    await page.route(`${apiBaseURL}/ai/generate`, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([
          fakeTask({ title: t1, isAiGenerated: true }),
          fakeTask({ title: t2, isAiGenerated: true }),
        ]),
      });
    });

    await page.goto('/');
    const list = new TaskListPage(page);
    await list.expectLoaded();

    const ai = new AiGeneratorPage(page);
    await ai.fillObjective('Planejar lançamento');
    await ai.fillApiKey('sk-mock');
    await ai.generate();

    await list.expectTaskVisible(t1);
    await list.expectTaskVisible(t2);
    await expect(list.taskRowByTitle(t1).getByTestId('task-ai-badge')).toHaveText('IA');
    await expect(list.taskRowByTitle(t2).getByTestId('task-ai-badge')).toHaveText('IA');
  });

  test('RF-06: campo de API Key está acessível e aceita valor antes da geração mockada', async ({
    page,
  }) => {
    await page.route(`${apiBaseURL}/ai/generate`, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([fakeTask({ title: `[e2e] RF06 key`, isAiGenerated: true })]),
      });
    });

    await page.goto('/');
    const ai = new AiGeneratorPage(page);
    await expect(ai.apiKeyInput).toBeVisible();
    await ai.fillApiKey('sk-or-v1-test-key');
    await expect(ai.apiKeyInput).toHaveValue('sk-or-v1-test-key');
    await ai.fillObjective('Teste RF-06');
    await ai.generate();

    const list = new TaskListPage(page);
    await list.expectTaskVisible('[e2e] RF06 key');
  });
});
