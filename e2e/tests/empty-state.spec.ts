import { test, expect } from '../fixtures/tasks.fixture';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('Estado vazio', () => {
  test('lista não exibe itens quando não há tarefas', async ({ page, passo }) => {
    await passo('Abrir página inicial', async () => {
      await page.goto('/');
    });
    await passo('Conferir lista vazia e contador em zero', async () => {
      const list = new TaskListPage(page);
      await list.expectEmptyList();
      await expect(page.getByTestId('task-count')).toHaveText('0 tarefas');
    });
  });
});
