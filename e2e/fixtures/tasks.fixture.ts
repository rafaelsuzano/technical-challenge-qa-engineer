import {
  test as base,
  expect,
  type APIRequestContext,
  type TestInfo,
} from '@playwright/test';
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

/** Executa um passo nomeado no relatório e anexa screenshot full-page ao final do passo. */
export type PassoFn = (titulo: string, acao: () => Promise<void | unknown>) => Promise<void>;

function slugPasso(titulo: string): string {
  const s = titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return s || 'passo';
}

export const test = base.extend<{ autoCleanup: void; passo: PassoFn }>({
  autoCleanup: [
    async ({ request }, use) => {
      await deleteAllTasks(request);
      await use();
      await deleteAllTasks(request);
    },
    { auto: true },
  ],
  passo: async ({ page }, use, testInfo: TestInfo) => {
    let n = 0;
    const passo: PassoFn = async (titulo, acao) => {
      n += 1;
      const ordem = String(n).padStart(2, '0');
      await test.step(`${ordem} — ${titulo}`, async () => {
        await acao();
        await testInfo.attach(`${ordem}-passo-${slugPasso(titulo)}.png`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });
      });
    };
    await use(passo);
  },
});

test.afterEach(async ({ page }, testInfo) => {
  const when = new Date();
  const ptBr = when.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'full',
    timeStyle: 'long',
  });
  await testInfo.attach('data-execucao.txt', {
    body: Buffer.from(
      [
        'Evidência — data e hora da execução do teste',
        ptBr,
        `ISO 8601: ${when.toISOString()}`,
        '',
        'Screenshots por passo: veja a árvore "Steps" e os anexos nomeados NN-passo-*.png em cada passo.',
        'Vídeo: o relatório HTML inclui gravação da execução (abaixo do teste, seção de attachments).',
      ].join('\n'),
      'utf-8',
    ),
    contentType: 'text/plain; charset=utf-8',
  });
});

export { expect };
