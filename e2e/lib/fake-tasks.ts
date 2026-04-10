import { randomUUID } from 'node:crypto';
import type { TaskDto } from './task-types';

export function fakeTask(partial: Pick<TaskDto, 'title'> & Partial<TaskDto>): TaskDto {
  return {
    id: partial.id ?? randomUUID(),
    title: partial.title,
    isCompleted: partial.isCompleted ?? false,
    isAiGenerated: partial.isAiGenerated ?? false,
    createdAt: partial.createdAt ?? new Date().toISOString(),
  };
}
