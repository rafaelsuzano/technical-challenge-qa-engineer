import { test, expect } from '../fixtures/tasks.fixture';
import { TaskFormPage } from '../pages/TaskFormPage';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('Conclusão de tarefa (RF-03)', () => {
  test('toggle marca como concluída na UI', async ({ page }) => {
    const title = `[e2e] toggle ${Date.now()}`;
    await page.goto('/');
    const form = new TaskFormPage(page);
    const list = new TaskListPage(page);
    await form.createTask(title);

    const cb = list.checkboxForTitle(title);
    await expect(cb).not.toBeChecked();
    await cb.check();
    await expect(cb).toBeChecked();
    await expect(list.taskRowByTitle(title).getByTestId('task-title')).toHaveCSS(
      'text-decoration',
      /line-through/,
    );
  });

  test('persistência do estado concluído após reload (PATCH no backend)', async ({ page }) => {
    test.fail(true, 'BUG-001: toggle não persiste — remover test.fail após corrigir useTasks.toggleComplete');
    const title = `[e2e] persist-toggle ${Date.now()}`;
    await page.goto('/');
    const form = new TaskFormPage(page);
    const list = new TaskListPage(page);
    await form.createTask(title);
    await list.checkboxForTitle(title).check();
    await expect(list.checkboxForTitle(title)).toBeChecked();

    await page.reload();
    await list.expectLoaded();
    await expect(list.checkboxForTitle(title)).toBeChecked();
  });
});
