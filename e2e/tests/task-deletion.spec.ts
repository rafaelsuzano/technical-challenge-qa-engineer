import { test, expect } from '../fixtures/tasks.fixture';
import { TaskFormPage } from '../pages/TaskFormPage';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('Exclusão (RF-04)', () => {
  test('remove tarefa da listagem', async ({ page, passo }) => {
    const title = `[e2e] delete ${Date.now()}`;
    await passo('Abrir app e criar tarefa para exclusão', async () => {
      await page.goto('/');
      const form = new TaskFormPage(page);
      const list = new TaskListPage(page);
      await form.createTask(title);
      await list.expectTaskVisible(title);
    });
    await passo('Excluir pela lixeira e validar remoção', async () => {
      const list = new TaskListPage(page);
      await list.deleteButtonForTitle(title).click();
      await expect(list.taskRowByTitle(title)).toHaveCount(0);
    });
  });
});
