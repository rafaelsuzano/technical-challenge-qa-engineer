import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AiGeneratorPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get root() {
    return this.page.getByTestId('ai-generator');
  }

  get apiKeyInput() {
    return this.page.getByTestId('ai-api-key-input');
  }

  get objectiveInput() {
    return this.page.getByTestId('ai-objective-input');
  }

  get generateButton() {
    return this.page.getByTestId('ai-generate-button');
  }

  async fillApiKey(key: string): Promise<void> {
    await this.apiKeyInput.fill(key);
  }

  async fillObjective(text: string): Promise<void> {
    await this.objectiveInput.fill(text);
  }

  async generate(): Promise<void> {
    await this.generateButton.click();
  }

  async expectVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
  }
}
