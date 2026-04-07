import { test, expect } from '../fixtures/tasks.fixture';
import AxeBuilder from '@axe-core/playwright';

test.describe('Acessibilidade (axe + teclado)', () => {
  test('página inicial: axe sem violações (WCAG 2.0/2.1 A/AA + boas práticas) no main', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('main').waitFor({ state: 'visible' });

    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('navegação por teclado alcança formulário e checkbox da primeira tarefa', async ({
    page,
  }) => {
    await page.goto('/');
    const input = page.getByTestId('task-title-input');
    await input.click();
    await expect(input).toBeFocused();
    const label = `[e2e-a11y] ${Date.now()}`;
    await input.fill(label);

    await page.keyboard.press('Tab');
    const submit = page.getByTestId('task-submit-button');
    await expect(submit).toBeFocused();
    await submit.click();

    const cb = page.getByTestId('task-checkbox').first();
    await cb.focus();
    await expect(cb).toBeFocused();
    await page.keyboard.press('Space');
    await expect(cb).toBeChecked();
  });
});
