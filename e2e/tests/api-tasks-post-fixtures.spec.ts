import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { apiBaseURL } from '../fixtures/config';
import type { TaskDto } from '../fixtures/task-types';
import { expectTaskDtoShape } from '../fixtures/task-schema';

const SCENARIOS_PATH = path.join(__dirname, '../fixtures/tasks-post-scenarios.json');

type ScenarioNode = {
  description?: string;
  expectStatus: number;
  deleteAfter?: boolean;
  payload: Record<string, unknown>;
};

type ScenariosFile = Record<string, ScenarioNode>;

const scenarios: ScenariosFile = JSON.parse(fs.readFileSync(SCENARIOS_PATH, 'utf-8'));

/**
 * POST /tasks — cada chave de primeiro nível em `fixtures/tasks-post-scenarios.json` é um cenário.
 */
for (const [name, scenario] of Object.entries(scenarios)) {
  test(`POST /tasks — ${name} → HTTP ${scenario.expectStatus}`, async ({ request }) => {
    const res = await request.post(`${apiBaseURL}/tasks`, {
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
      data: scenario.payload,
    });

    const bodyText = await res.text();
    expect(res.status(), `${name}: ${bodyText.slice(0, 500)}`).toBe(scenario.expectStatus);

    if (scenario.deleteAfter && res.status() === 201) {
      const body = JSON.parse(bodyText) as unknown;
      expectTaskDtoShape(body);
      const task = body as TaskDto;
      const del = await request.delete(`${apiBaseURL}/tasks/${task.id}`);
      expect(del.status()).toBe(204);
    }
  });
}
