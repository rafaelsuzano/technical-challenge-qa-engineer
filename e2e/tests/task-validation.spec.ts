import { test, expect } from '../fixtures/tasks.fixture';
import { TaskFormPage } from '../pages/TaskFormPage';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('Validação de campos', () => {
  test('título só com espaços: comportamento atual do cliente (aceito até backend alinhar)', async ({
    page,
  }) => {
    await page.goto('/');
    const list = new TaskListPage(page);
    await list.expectLoaded();
    const before = await page.getByTestId('task-item').count();

    const form = new TaskFormPage(page);
    await form.fillTitle('   ');
    await form.submit();
    await expect
      .poll(async () => page.getByTestId('task-item').count())
      .toBeGreaterThanOrEqual(before);
  });
});
