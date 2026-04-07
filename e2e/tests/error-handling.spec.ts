import { test, expect } from '../fixtures/tasks.fixture';
import { TaskFormPage } from '../pages/TaskFormPage';
import { TaskListPage } from '../pages/TaskListPage';
import { apiBaseURL } from '../lib/config';

test.describe('Erros de API (UI)', () => {
  test('falha no POST /tasks: lista não deve crescer de forma inconsistente sob intercept', async ({
    page,
  }) => {
    await page.route(`${apiBaseURL}/tasks`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.abort('failed');
        return;
      }
      await route.continue();
    });

    await page.goto('/');
    const list = new TaskListPage(page);
    await list.expectLoaded();
    const before = await page.getByTestId('task-item').count();

    const form = new TaskFormPage(page);
    await form.fillTitle(`[e2e] fail-post ${Date.now()}`);
    await form.submit();
    await expect
      .poll(async () => page.getByTestId('task-item').count())
      .toBe(before);
  });
});
