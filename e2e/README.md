# Suíte E2E — Smart To-Do

Testes Playwright (Chromium) com **Page Object Model**, fixture de limpeza e contratos HTTP com validação de **schema** de tarefas.

## Estrutura (alinhada ao desafio)

```text
e2e/
  pages/           TaskListPage.ts, TaskFormPage.ts, AiGeneratorPage.ts
  fixtures/        tasks.fixture.ts, config, tipos, fake-tasks, task-schema, tasks-post-scenarios.json
  tests/           cenários E2E + API (api-*.spec.ts) + acessibilidade
  playwright.config.ts
  package.json
  README.md
  ACCESSIBILITY-FINDINGS.md   ← B3: achados documentados (≥3)
```

## Pré-requisitos

- Backend `http://localhost:3001` e frontend `http://localhost:3000` no ar (ex.: `docker compose -f ../app/docker-compose.yml up --build`).
- Ou `PLAYWRIGHT_BASE_URL` / `API_BASE_URL` se usar outro host.

## Instalação

```bash
cd e2e
npm ci
npx playwright install chromium
```

## Execução

```bash
npm test
```

Grupos:

```bash
npm run test:web    # fluxos de UI
npm run test:api    # contratos HTTP (+ schema em POST/GET quando aplicável)
```

Modo UI:

```bash
npm run test:ui
```

Com navegador visível:

```bash
HEADED=1 npm run test:headed
```

## Observabilidade

- **Screenshots por passo:** testes que usam o fixture `tasks.fixture` têm o helper `passo()` — cada passo aparece na árvore do relatório HTML e anexa `NN-passo-*.png` (página inteira).
- **Screenshot global (Playwright):** `screenshot: 'only-on-failure'` em `playwright.config.ts` (captura extra em falhas).
- **Vídeo:** `video: 'on'` — gravação anexada ao relatório por teste.
- **Trace:** `on-first-retry` (útil com `retries` em CI).
- **Retries em CI:** `2` quando `CI=true`.
- **Evidência textual:** `data-execucao.txt` após cada teste com fixture de browser.

## RF-03 / persistência

O frontend chama `PATCH /tasks/:id` com `isCompleted` ao alternar o checkbox (`useTasks.toggleComplete`). O teste de persistência após reload em `task-completion.spec.ts` deve passar com backend e Docker ativos.

## API / B1

- `fixtures/tasks-post-scenarios.json` — cenários de `POST /tasks` (status + payload).
- `fixtures/task-schema.ts` — `expectTaskDtoShape` / `expectTaskDtoArrayShape` para `id`, `title`, `isCompleted`, `isAiGenerated` (e `createdAt` opcional).
