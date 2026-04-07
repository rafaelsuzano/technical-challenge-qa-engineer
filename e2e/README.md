# Suíte E2E — Smart To-Do

Testes Playwright (Chromium) com Page Object Model, dados isolados por teste e suíte extra de contrato HTTP.

## Pré-requisitos

- Backend `http://localhost:3001` e frontend `http://localhost:3000` no ar (ex.: `docker compose -f ../app/docker-compose.yml up --build`).
- Ou exportar `PLAYWRIGHT_BASE_URL` / `API_BASE_URL` se usar outro host.

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

Modo UI:

```bash
npm run test:ui
```

Com navegador visível:

```bash
HEADED=1 npm run test:headed
```

## Estrutura

- `pages/` — Page Objects (`TaskListPage`, `TaskFormPage`, `AiGeneratorPage`).
- `fixtures/tasks.fixture.ts` — limpeza automática via API (`DELETE` em massa antes/depois de cada teste que usa o fixture).
- `tests/` — cenários E2E; `api-contract.spec.ts` usa apenas `APIRequestContext`.
- `tests/accessibility.spec.ts` — `@axe-core/playwright` + fluxo mínimo de teclado.

## Observabilidade

- Screenshots: apenas em falha (`playwright.config.ts`).
- Trace: em primeira retry (`trace: on-first-retry`).
- Retries em CI: `2` (via variável `CI`).

## Nota sobre RF-03

O teste `task-completion.spec.ts` contém um caso marcado com `test.fail` devido ao BUG-001 (toggle sem PATCH). Remova o `test.fail` quando o backend/front persistirem `isCompleted`.
