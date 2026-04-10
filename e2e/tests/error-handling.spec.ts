import { test, expect } from '../fixtures/tasks.fixture';
import { TaskFormPage } from '../pages/TaskFormPage';
import { TaskListPage } from '../pages/TaskListPage';
import { apiBaseURL } from '../lib/config';

test.describe('Erros de API (UI)', () => {
  test('falha no POST /tasks: lista não deve crescer de forma inconsistente sob intercept', async ({
    page,
    passo,
  }) => {
    await passo('Interceptar POST /tasks com falha de rede', async () => {
      await page.route(`${apiBaseURL}/tasks`, async (route) => {
        if (route.request().method() === 'POST') {
          await route.abort('failed');
          return;
        }
        await route.continue();
      });
    });
    await passo('Abrir página e obter contagem inicial de itens', async () => {
      await page.goto('/');
      const list = new TaskListPage(page);
      await list.expectLoaded();
    });
    await passo('Submeter nova tarefa e validar que lista não cresce', async () => {
      const list = new TaskListPage(page);
      const before = await page.getByTestId('task-item').count();
      const form = new TaskFormPage(page);
      await form.fillTitle(`[e2e] fail-post ${Date.now()}`);
      await form.submit();
      await expect.poll(async () => page.getByTestId('task-item').count()).toBe(before);
    });
  });
});
