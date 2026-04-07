import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class TaskListPage {
  readonly page: Page;
  readonly list: Locator;
  readonly loading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.list = page.getByTestId('task-list');
    this.loading = page.getByTestId('tasks-loading');
  }

  taskRowByTitle(title: string): Locator {
    return this.page.getByTestId('task-item').filter({
      has: this.page.getByTestId('task-title').filter({ hasText: title }),
    });
  }

  checkboxForTitle(title: string): Locator {
    return this.taskRowByTitle(title).getByTestId('task-checkbox');
  }

  deleteButtonForTitle(title: string): Locator {
    return this.taskRowByTitle(title).getByTestId('task-delete-button');
  }

  async expectLoaded(): Promise<void> {
    await expect
      .poll(async () => !(await this.loading.isVisible().catch(() => false)))
      .toBeTruthy();
  }

  async expectTaskVisible(title: string): Promise<void> {
    await this.expectLoaded();
    await expect(this.taskRowByTitle(title)).toBeVisible();
  }

  async expectTaskCount(count: number): Promise<void> {
    await this.expectLoaded();
    await expect(this.page.getByTestId('task-item')).toHaveCount(count);
  }

  async expectEmptyList(): Promise<void> {
    await this.expectLoaded();
    await expect(this.page.getByTestId('task-item')).toHaveCount(0);
    await expect(this.list).toBeVisible();
  }
}
