# TEST-STRATEGY — Smart To-Do List com IA

Estratégia de qualidade para o produto Smart To-Do (Next.js 14 + NestJS + SQLite + OpenRouter), alinhada ao PRD e aos riscos de integração.

---

## 1. Análise de Risco

| Área | Risco | Mitigação de teste |
|------|--------|---------------------|
| **IA generation** | Latência, timeout, formato não parseável, chave inválida, modelo trocado | Contrato de API mockado + testes manuais smoke; E2E com `route.fulfill` para respostas sintéticas; monitor 401/400; validar mensagens |
| **Persistência SQLite** | Volume Docker, ordem não definida, DELETE idempotente enganoso | Testes de API para CRUD; E2E de reload após create/delete; contrato de status HTTP |
| **Estado da lista** | Otimismo sem PATCH (toggle), dessincronia cliente/servidor | E2E explícito: toggle + reload falha até correção; refetch após mutações críticas |
| **API failures** | POST/GET falham silenciosamente no cliente | E2E com `page.route` abort/fail; assert feedback UI quando implementado |
| **Race conditions** | Duplo clique em gerar IA, submits rápidos | E2E de desabilitar botões; testes de carga leve opcional |
| **UX feedback** | Empty state, erros IA invisíveis, loading genérico | Testes visuais manuais; checks de `aria-busy`/`aria-live`; critérios de aceite revisados no PRD |

---

## 2. Pirâmide de Testes

- **Unit (backend):** Services e parsing (ex.: normalização de DTO com `trim`; futuro: parser resiliente de JSON da IA).  
- **Unit (frontend):** Hooks puros (com MSW ou mocks) quando lógica crescer; hoje priorizar integração.  
- **Integration (backend):** TypeORM em SQLite in-memory ou container efêmero para CRUD + validação class-validator.  
- **API Contract:** Playwright `request` ou Supertest — POST/GET/DELETE, payloads inválidos, 404 em GET por id.  
- **E2E (Playwright):** Fluxos RF-01 a RF-04 com Page Objects, `data-testid` + roles; reload e limpeza de dados.  
- **Visual (opcional):** Baseline de screenshot por viewport (375px, 1280px) após estabilizar UI.  
- **Accessibility:** `@axe-core/playwright` em rotas principais + verificação de foco/tab em elementos interativos.

Ordem sugerida em CI: lint/typecheck → API contract (serviço up) → E2E smoke → relatório e artefatos.

---

## 3. Processo

### Shift left testing

- QA participa da Definition of Ready: cada US traz critérios mensuráveis (incluindo erro e reload).  
- Revisão de PRD e contratos de API antes de codar DTOs finais.

### Definition of Ready com QA

- IDs de requisito (RF-xx) nos tickets.  
- Dados de teste e cleanup definidos (API ou reset de volume).  
- Cenários negativos (rede/chave IA inválida) não são “fora de escopo” sem decisão explícita.

### Contract testing

- Swagger como referência; testes automatizados validam status + formato mínimo dos JSONs.  
- Erros: padronizar envelope (ver BUG-009) e travar com testes.

### CI quality gates

- Falha bloqueante: regressão em RF críticos (criar, listar, excluir, persistência pós-reload onde aplicável).  
- Artefatos: trace zip em retry, screenshot on failure, HTML report.  
- Opcional: limite de flakes (retry máximo 2 em CI).

### Test data strategy

- Prefixo de título em E2E (`[e2e] …`) para rastreio.  
- `beforeEach`/`afterEach`: limpar via API (`GET tasks` + `DELETE`) para independência.  
- Não depender de ordem da lista; localizar por título ou por id retornado no `POST`.

---

## 4. Cobertura alvo (MVP)

| RF | Automação sugerida |
|----|--------------------|
| RF-01 | E2E: lista visível; badge IA quando `isAiGenerated` |
| RF-02 | E2E: criar + input limpo; API: validação |
| RF-03 | E2E: toggle UI; E2E: persistência pós-reload (gate até BUG-001 corrigido) |
| RF-04 | E2E: delete desaparece; API: delete comportamento |
| RF-05 | API/E2E mockada; smoke manual com chave real fora de CI |
| RF-06 | E2E enxuto: campo presente (sem guardar chave em log) |

---

## 5. Métricas e relatórios

- Playwright HTML report + traces em falhas.  
- Lista de bugs documentada em `BUG-REPORT.md` vinculada a casos de teste.  
- Revisão periódica de flakiness (ordem da lista, timing de rede).

---
