import { test, expect } from '../fixtures/tasks.fixture';
import { TaskFormPage } from '../pages/TaskFormPage';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('Criação de tarefa (RF-02)', () => {
  test('cria tarefa manual e exibe na lista', async ({ page, passo }) => {
    const form = new TaskFormPage(page);
    const list = new TaskListPage(page);
    const title = `[e2e] criar ${Date.now()}`;

    await passo('Abrir página e criar tarefa manual', async () => {
      await page.goto('/');
      await form.createTask(title);
    });
    await passo('Validar tarefa na lista e contador', async () => {
      await list.expectTaskVisible(title);
      await expect(page.getByTestId('task-count')).toContainText('tarefa');
    });
  });

  test('persistência: tarefa criada permanece após reload', async ({ page, passo }) => {
    const title = `[e2e] reload ${Date.now()}`;
    await passo('Criar tarefa e confirmar na lista', async () => {
      await page.goto('/');
      const form = new TaskFormPage(page);
      const list = new TaskListPage(page);
      await form.createTask(title);
      await list.expectTaskVisible(title);
    });
    await passo('Recarregar página e validar persistência', async () => {
      const list = new TaskListPage(page);
      await page.reload();
      await list.expectTaskVisible(title);
    });
  });

  test('campo vazio não deve adicionar nova tarefa', async ({ page, passo }) => {
    await passo('Abrir página e ler quantidade de itens', async () => {
      await page.goto('/');
      const list = new TaskListPage(page);
      await list.expectLoaded();
    });
    await passo('Submeter formulário vazio e validar contagem', async () => {
      const list = new TaskListPage(page);
      const before = await page.getByTestId('task-item').count();
      const form = new TaskFormPage(page);
      await form.titleInput.fill('');
      await form.submitButton.click();
      await expect.poll(async () => page.getByTestId('task-item').count()).toBe(before);
    });
  });
});
