import { test, expect } from '../fixtures/tasks.fixture';
import { TaskFormPage } from '../pages/TaskFormPage';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('RF-02 — Criação manual (detalhes de UX)', () => {
  test('após criar tarefa com sucesso o campo de título é limpo', async ({ page }) => {
    const title = `[e2e] RF02 limpar ${Date.now()}`;
    await page.goto('/');
    const form = new TaskFormPage(page);
    const list = new TaskListPage(page);
    await form.fillTitle(title);
    await form.submit();
    await list.expectTaskVisible(title);
    await expect(form.titleInput).toHaveValue('');
  });

  test('RF-02: confirmar criação com Enter no campo de título', async ({ page }) => {
    const title = `[e2e] RF02 enter ${Date.now()}`;
    await page.goto('/');
    const list = new TaskListPage(page);
    await list.expectLoaded();
    await page.getByTestId('task-title-input').fill(title);
    await page.getByTestId('task-title-input').press('Enter');
    await list.expectTaskVisible(title);
  });

  test('várias tarefas manuais aparecem na lista', async ({ page }) => {
    await page.goto('/');
    const form = new TaskFormPage(page);
    const list = new TaskListPage(page);
    const t1 = `[e2e] RF02 multi a ${Date.now()}`;
    const t2 = `[e2e] RF02 multi b ${Date.now()}`;
    const t3 = `[e2e] RF02 multi c ${Date.now()}`;
    await form.createTask(t1);
    await form.createTask(t2);
    await form.createTask(t3);
    await list.expectLoaded();
    await expect(page.getByTestId('task-item')).toHaveCount(3);
    await list.expectTaskVisible(t1);
    await list.expectTaskVisible(t2);
    await list.expectTaskVisible(t3);
  });
});
