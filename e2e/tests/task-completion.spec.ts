import { test, expect } from '../fixtures/tasks.fixture';
import { TaskFormPage } from '../pages/TaskFormPage';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('Conclusão de tarefa (RF-03)', () => {
  test('toggle marca como concluída na UI', async ({ page, passo }) => {
    const title = `[e2e] toggle ${Date.now()}`;
    await passo('Abrir app e criar tarefa', async () => {
      await page.goto('/');
      const form = new TaskFormPage(page);
      const list = new TaskListPage(page);
      await form.createTask(title);
    });
    await passo('Marcar como concluída e validar estilo', async () => {
      const list = new TaskListPage(page);
      const cb = list.checkboxForTitle(title);
      await expect(cb).not.toBeChecked();
      await cb.check();
      await expect(cb).toBeChecked();
      await expect(list.taskRowByTitle(title).getByTestId('task-title')).toHaveCSS(
        'text-decoration',
        /line-through/,
      );
    });
  });

  test('persistência do estado concluído após reload (PATCH no backend)', async ({ page, passo }) => {
    const title = `[e2e] persist-toggle ${Date.now()}`;
    await passo('Criar tarefa e marcar concluída', async () => {
      await page.goto('/');
      const form = new TaskFormPage(page);
      const list = new TaskListPage(page);
      await form.createTask(title);
      await list.checkboxForTitle(title).check();
      await expect(list.checkboxForTitle(title)).toBeChecked();
    });
    await passo('Recarregar e conferir checkbox', async () => {
      const list = new TaskListPage(page);
      await page.reload();
      await list.expectLoaded();
      await expect(list.checkboxForTitle(title)).toBeChecked();
    });
  });
});
