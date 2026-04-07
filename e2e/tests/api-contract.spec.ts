import { test, expect } from '@playwright/test';
import { apiBaseURL } from '../lib/config';
import type { TaskDto } from '../lib/task-types';

test.describe.configure({ mode: 'serial' });

test.describe('Contrato API /tasks', () => {
  let createdId: string | undefined;

  test.afterEach(async ({ request }) => {
    if (createdId) {
      await request.delete(`${apiBaseURL}/tasks/${createdId}`);
      createdId = undefined;
    }
  });

  test('POST cria tarefa', async ({ request }) => {
    const title = `[e2e-api] ${Date.now()}`;
    const res = await request.post(`${apiBaseURL}/tasks`, {
      data: { title },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as TaskDto;
    expect(body.title).toBe(title);
    expect(body.id).toBeTruthy();
    createdId = body.id;
  });

  test('GET lista tarefas', async ({ request }) => {
    const res = await request.get(`${apiBaseURL}/tasks`);
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as TaskDto[];
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('DELETE remove tarefa criada', async ({ request }) => {
    const title = `[e2e-api-del] ${Date.now()}`;
    const create = await request.post(`${apiBaseURL}/tasks`, { data: { title } });
    const task = (await create.json()) as TaskDto;
    const del = await request.delete(`${apiBaseURL}/tasks/${task.id}`);
    expect(del.status()).toBe(204);
    const getOne = await request.get(`${apiBaseURL}/tasks/${task.id}`);
    expect(getOne.status()).toBe(404);
  });

  test('POST payload inválido (JSON quebrado)', async ({ request }) => {
    const res = await request.post(`${apiBaseURL}/tasks`, {
      headers: { 'Content-Type': 'application/json' },
      data: '{ "title": "incompleto"',
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST sem campo title', async ({ request }) => {
    const res = await request.post(`${apiBaseURL}/tasks`, {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('GET id inválido retorna 404', async ({ request }) => {
    const res = await request.get(
      `${apiBaseURL}/tasks/00000000-0000-0000-0000-000000000001`,
    );
    expect(res.status()).toBe(404);
  });
});
