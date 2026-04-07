import { test, expect } from '../fixtures/tasks.fixture';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('Estado vazio', () => {
  test('lista não exibe itens quando não há tarefas', async ({ page }) => {
    await page.goto('/');
    const list = new TaskListPage(page);
    await list.expectEmptyList();
    await expect(page.getByTestId('task-count')).toHaveText('0 tarefas');
  });
});
