import { test, expect } from '../fixtures/tasks.fixture';
import { TaskFormPage } from '../pages/TaskFormPage';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('Exclusão (RF-04)', () => {
  test('remove tarefa da listagem', async ({ page }) => {
    const title = `[e2e] delete ${Date.now()}`;
    await page.goto('/');
    const form = new TaskFormPage(page);
    const list = new TaskListPage(page);
    await form.createTask(title);
    await list.expectTaskVisible(title);

    await list.deleteButtonForTitle(title).click();
    await expect(list.taskRowByTitle(title)).toHaveCount(0);
  });
});
