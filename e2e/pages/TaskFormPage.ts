import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class TaskFormPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get form() {
    return this.page.getByTestId('task-form');
  }

  get titleInput() {
    return this.page.getByTestId('task-title-input');
  }

  get submitButton() {
    return this.page.getByTestId('task-submit-button');
  }

  async fillTitle(text: string): Promise<void> {
    await this.titleInput.fill(text);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async createTask(title: string): Promise<void> {
    await this.fillTitle(title);
    await this.submit();
    await expect
      .poll(async () => (await this.titleInput.inputValue()).length === 0)
      .toBeTruthy();
  }

  async expectSubmitEnabled(enabled: boolean): Promise<void> {
    if (enabled) await expect(this.submitButton).toBeEnabled();
    else await expect(this.submitButton).toBeDisabled();
  }
}
