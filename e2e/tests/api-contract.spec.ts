import { test, expect } from '@playwright/test';
import { apiBaseURL } from '../fixtures/config';
import type { TaskDto } from '../fixtures/task-types';
import { expectTaskDtoShape } from '../fixtures/task-schema';

test.describe.configure({ mode: 'serial' });

test.describe('Contrato API /tasks', () => {
  test('GET lista tarefas', async ({ request }) => {
    const res = await request.get(`${apiBaseURL}/tasks`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBeTruthy();
    for (const item of data as unknown[]) {
      expectTaskDtoShape(item);
    }
  });

  test('DELETE remove tarefa criada', async ({ request }) => {
    const title = `[e2e-api-del] ${Date.now()}`;
    const create = await request.post(`${apiBaseURL}/tasks`, { data: { title } });
    expect(create.status()).toBe(201);
    const task = await create.json();
    expectTaskDtoShape(task, { isAiGenerated: false });
    const taskDto = task as TaskDto;
    const del = await request.delete(`${apiBaseURL}/tasks/${taskDto.id}`);
    expect(del.status()).toBe(204);
    const getOne = await request.get(`${apiBaseURL}/tasks/${taskDto.id}`);
    expect(getOne.status()).toBe(404);
  });

  test('POST payload inválido (JSON quebrado)', async ({ request }) => {
    const res = await request.post(`${apiBaseURL}/tasks`, {
      headers: { 'Content-Type': 'application/json' },
      data: '{ "title": "incompleto"',
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('GET id inválido retorna 404', async ({ request }) => {
    const res = await request.get(
      `${apiBaseURL}/tasks/00000000-0000-0000-0000-000000000001`,
    );
    expect(res.status()).toBe(404);
  });
});
