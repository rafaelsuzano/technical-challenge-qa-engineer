import { expect } from '@playwright/test';
import type { TaskDto } from './task-types';

/** Contrato mínimo B1: campos obrigatórios e tipos em respostas de tarefa. */
export function expectTaskDtoShape(body: unknown, opts?: { isAiGenerated?: boolean }): void {
  expect(body, 'corpo não nulo').not.toBeNull();
  expect(typeof body, 'corpo objeto').toBe('object');
  const o = body as Record<string, unknown>;
  expect(typeof o.id, 'id deve ser string não vazia').toBe('string');
  expect(String(o.id).length).toBeGreaterThan(0);
  expect(typeof o.title, 'title deve ser string').toBe('string');
  expect(typeof o.isCompleted, 'isCompleted deve ser boolean').toBe('boolean');
  expect(typeof o.isAiGenerated, 'isAiGenerated deve ser boolean').toBe('boolean');
  if (opts?.isAiGenerated !== undefined) {
    expect(o.isAiGenerated).toBe(opts.isAiGenerated);
  }
  if (o.createdAt !== undefined) {
    expect(typeof o.createdAt).toBe('string');
  }
}

export function expectTaskDtoArrayShape(data: unknown): void {
  expect(Array.isArray(data)).toBeTruthy();
  for (const item of data as unknown[]) {
    expectTaskDtoShape(item);
  }
}
