import { test, expect } from '../fixtures/tasks.fixture';
import AxeBuilder from '@axe-core/playwright';

test.describe('Acessibilidade (axe + teclado)', () => {
  test('página inicial: axe sem violações (WCAG 2.0/2.1 A/AA + boas práticas) no main', async ({
    page,
    passo,
  }) => {
    await passo('Carregar página e focar no main', async () => {
      await page.goto('/');
      await page.getByRole('main').waitFor({ state: 'visible' });
    });
    await passo('Executar análise axe no main', async () => {
      const results = await new AxeBuilder({ page })
        .include('main')
        .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
        .analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  });

  test('navegação por teclado alcança formulário e checkbox da primeira tarefa', async ({
    page,
    passo,
  }) => {
    await passo('Abrir página e preencher título via teclado', async () => {
      await page.goto('/');
      const input = page.getByTestId('task-title-input');
      await input.click();
      await expect(input).toBeFocused();
      const label = `[e2e-a11y] ${Date.now()}`;
      await input.fill(label);
    });
    await passo('Tab até enviar e criar tarefa', async () => {
      await page.keyboard.press('Tab');
      const submit = page.getByTestId('task-submit-button');
      await expect(submit).toBeFocused();
      await submit.click();
    });
    await passo('Focar checkbox e marcar com Space', async () => {
      const cb = page.getByTestId('task-checkbox').first();
      await cb.focus();
      await expect(cb).toBeFocused();
      await page.keyboard.press('Space');
      await expect(cb).toBeChecked();
    });
  });
});
