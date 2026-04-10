import { test, expect } from '../fixtures/tasks.fixture';
import { TaskFormPage } from '../pages/TaskFormPage';
import { TaskListPage } from '../pages/TaskListPage';

test.describe('App web — shell e RF-01 (listagem)', () => {
  test('cabeçalho, título do produto e contador inicial com lista vazia', async ({ page, passo }) => {
    await passo('Abrir página inicial', async () => {
      await page.goto('/');
    });
    await passo('Validar shell: main, header, título, contador, blocos IA e formulário', async () => {
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByTestId('app-header')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Smart To-Do' })).toBeVisible();
      await expect(page.getByTestId('task-count')).toHaveText('0 tarefas');
      await expect(page.getByTestId('ai-generator')).toBeVisible();
      await expect(page.getByTestId('task-form')).toBeVisible();
      const list = new TaskListPage(page);
      await list.expectLoaded();
      await expect(page.getByTestId('task-item')).toHaveCount(0);
      await expect(list.list).toBeAttached();
    });
  });

  test('RF-01: tarefa manual exibe título, checkbox e sem badge de IA', async ({ page, passo }) => {
    const title = `[e2e] RF01 manual ${Date.now()}`;
    await passo('Criar tarefa manual', async () => {
      await page.goto('/');
      const form = new TaskFormPage(page);
      const list = new TaskListPage(page);
      await form.createTask(title);
    });
    await passo('Validar linha: título, checkbox, sem badge IA', async () => {
      const list = new TaskListPage(page);
      const row = list.taskRowByTitle(title);
      await expect(row).toBeVisible();
      await expect(row.getByTestId('task-title')).toHaveText(title);
      await expect(row.getByTestId('task-checkbox')).toBeVisible();
      await expect(row.getByTestId('task-ai-badge')).toHaveCount(0);
    });
  });

  test('RF-01: tarefa concluída diferencia visualmente (texto riscado)', async ({ page, passo }) => {
    const title = `[e2e] RF01 visual ${Date.now()}`;
    await passo('Criar tarefa', async () => {
      await page.goto('/');
      const form = new TaskFormPage(page);
      const list = new TaskListPage(page);
      await form.createTask(title);
    });
    await passo('Marcar concluída e conferir line-through', async () => {
      const list = new TaskListPage(page);
      const titleEl = list.taskRowByTitle(title).getByTestId('task-title');
      await expect(titleEl).not.toHaveCSS('text-decoration', /line-through/);
      await list.checkboxForTitle(title).check();
      await expect(titleEl).toHaveCSS('text-decoration', /line-through/);
    });
  });
});
