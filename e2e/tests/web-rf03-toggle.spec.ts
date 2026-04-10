import { test, expect } from '../fixtures/tasks.fixture';
import { TaskFormPage } from '../pages/TaskFormPage';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('RF-03 — Checkbox e feedback visual', () => {
  test('desmarcar tarefa remove o estado concluído na UI', async ({ page }) => {
    const title = `[e2e] RF03 uncheck ${Date.now()}`;
    await page.goto('/');
    const form = new TaskFormPage(page);
    const list = new TaskListPage(page);
    await form.createTask(title);

    const cb = list.checkboxForTitle(title);
    const titleEl = list.taskRowByTitle(title).getByTestId('task-title');
    await cb.check();
    await expect(cb).toBeChecked();
    await expect(titleEl).toHaveCSS('text-decoration', /line-through/);

    await cb.uncheck();
    await expect(cb).not.toBeChecked();
    await expect(titleEl).not.toHaveCSS('text-decoration', /line-through/);
  });
});
