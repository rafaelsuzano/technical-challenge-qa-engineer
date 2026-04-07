import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { apiBaseURL } from '../lib/config';
import type { TaskDto } from '../lib/task-types';

async function fetchAllTasks(request: APIRequestContext): Promise<TaskDto[]> {
  const res = await request.get(`${apiBaseURL}/tasks`);
  expect(res.ok(), `GET /tasks deve responder OK — obtido ${res.status()}`).toBeTruthy();
  return (await res.json()) as TaskDto[];
}

export async function deleteAllTasks(request: APIRequestContext): Promise<void> {
  const tasks = await fetchAllTasks(request);
  await Promise.all(tasks.map((t) => request.delete(`${apiBaseURL}/tasks/${t.id}`)));
}

export const test = base.extend<{ autoCleanup: void }>({
  autoCleanup: [
    async ({ request }, use) => {
      await deleteAllTasks(request);
      await use();
      await deleteAllTasks(request);
    },
    { auto: true },
  ],
});

export { expect };
