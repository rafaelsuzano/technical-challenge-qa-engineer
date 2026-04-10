# BUG-REPORT — Smart To-Do List com IA

Auditoria baseada na implementação em `app/frontend` e `app/backend` (NestJS + Next.js), no Swagger (`/api/docs`), integração OpenRouter e fluxos de persistência.

---

[BUG-001] Alternar “concluída” não persiste no backend

Severidade: Crítica  
Prioridade: P1  
Componente: Frontend

Descrição  
`toggleComplete` em `useTasks.ts` apenas altera o estado React; não chama `PATCH /tasks/:id`. Ao recarregar a página, o checkbox volta ao valor armazenado no SQLite.

Passos para Reproduzir  
1. Subir stack (Docker Compose) e abrir `http://localhost:3000`.  
2. Criar uma tarefa manualmente.  
3. Marcar o checkbox como concluída.  
4. Recarregar o navegador (F5).

Resultado Esperado  
Conforme RF-03 / persistência, a tarefa continua marcada como concluída após reload.

Resultado Obtido  
A tarefa volta ao estado não concluído.

Evidência  
`app/frontend/src/hooks/useTasks.ts` — `toggleComplete` só executa `setTasks` sem `api.patch`.

Sugestão de Correção  
Chamar `PATCH /tasks/:id` com `{ isCompleted }` (ou equivalente no DTO) e, em caso de falha, reverter estado otimista e exibir erro.

---

[BUG-002] Títulos só com espaços em branco são aceitos

Severidade: Média  
Prioridade: P2  
Componente: Frontend | Backend | API

Descrição  
No frontend, `if (!title)` permite strings não vazias compostas apenas de espaços. No backend, `CreateTaskDto` usa apenas `@IsString()` sem `@IsNotEmpty()` nem `Transform` com trim.

Passos para Reproduzir  
1. No formulário manual, inserir três espaços e clicar em Adicionar.  
2. Opcional: `POST /tasks` com body `{ "title": "   " }`.

Resultado Esperado  
Validação rejeita ou normaliza para vazio e não cria tarefa sem título visível útil.

Resultado Obtido  
Tarefa criada com título “invisível” ou sem significado.

Evidência  
`TaskForm.tsx` (validação sem `trim`); `create-task.dto.ts` sem `IsNotEmpty`.

Sugestão de Correção  
`trim()` no cliente + `@Transform(({ value }) => typeof value === 'string' ? value.trim() : value)` e `@IsNotEmpty()` no DTO; mensagem 400 consistente.

---

[BUG-003] Falha na geração por IA não mostra feedback na UI

Severidade: Alta  
Prioridade: P1  
Componente: Frontend | UX

Descrição  
`AiGenerator` captura erros no `catch` e apenas faz `console.error`, sem estado de erro nem `aria-live`.

Passos para Reproduzir  
1. Informar API Key inválida ou bloquear rede para `openrouter.ai`.  
2. Preencher objetivo e clicar em Gerar tarefas.

Resultado Esperado  
Mensagem clara de erro e possibilidade de nova tentativa.

Resultado Obtido  
Spinner encerra; nenhuma mudança visível na interface.

Evidência  
`app/frontend/src/components/AiGenerator.tsx` — `catch` sem atualização de UI.

Sugestão de Correção  
Estado `error`, exibição textual, limpeza ao novo envio, e anúncio para leitores de tela.

---

[BUG-004] DELETE retorna 204 mesmo quando a tarefa não existe

Severidade: Média  
Prioridade: P2  
Componente: Backend | API

Descrição  
`TasksService.remove` executa `delete` sem verificar linhas afetadas; cliente não distingue sucesso real de no-op.

Passos para Reproduzir  
1. `DELETE http://localhost:3001/tasks/00000000-0000-0000-0000-000000000000` (UUID inexistente).

Resultado Esperado  
404 ou 400 coerente com REST e documentação Swagger honesta.

Resultado Obtido  
HTTP 204 No Content.

Evidência  
`tasks.service.ts` método `remove`; `tasks.controller.ts` documenta apenas 204.

Sugestão de Correção  
Checar `delete` result e lançar `NotFoundException` se zero linhas; atualizar Swagger.

---

[BUG-005] Comentário incorreto no `HomePage` (falso bug documentado no código)

Severidade: Baixa  
Prioridade: P4  
Componente: Frontend

Descrição  
`page.tsx` sugere que `Header` não reage a mudanças em `tasks.length`. Em React, props são atualizadas a cada render; o contador acompanha a lista.

Resultado Esperado  
Código-fonte alinhado ao comportamento real.

Resultado Obtido  
Comentário enganoso para manutenção e QA.

Evidência  
`app/frontend/src/app/page.tsx` e fluxo padrão de re-render.

Sugestão de Correção  
Remover ou corrigir o comentário; manter teste de regressão simples no contador se desejado.

---

[BUG-006] `createTask` e fluxos sem tratamento de erro de rede

Severidade: Média  
Prioridade: P2  
Componente: Frontend | UX

Descrição  
`createTask` assume sucesso do `POST`; falhas axios não atualizam UI nem revertem spinners além do `finally` do formulário.

Passos para Reproduzir  
1. Interceptar `POST /tasks` com falha (ex. 500) via DevTools ou `page.route`.  
2. Tentar criar tarefa.

Resultado Esperado  
Mensagem de erro e lista consistente com servidor.

Resultado Obtido  
Possível estado incoerente ou falta de feedback (dependendo do fluxo).

Evidência  
`useTasks.ts` — `createTask` sem try/catch.

Sugestão de Correção  
Tratar erros, toast ou banner, e opcionalmente refetch da lista.

---

[BUG-007] Modelo OpenRouter no código difere do PRD (mistral vs gemma)

Severidade: Média  
Prioridade: P3  
Componente: Backend | Documentação

Descrição  
O desafio/PRD menciona `mistralai/mistral-7b-instruct:free`; `AiService` usa `google/gemma-3-4b-it:free`.

Passos para Reproduzir  
1. Inspecionar `app/backend/src/ai/ai.service.ts`.

Resultado Esperado  
Alinhamento entre documentação de produto e implementação ou nota de configuração.

Resultado Obtido  
Divergência silenciosa; testes de qualidade de resposta não batem com expectativa de stakeholders.

Evidência  
Constante `model` no payload axios.

Sugestão de Correção  
Modelo via variável de ambiente com default documentado ou atualizar PRD.

---

[BUG-008] Listagem de tarefas sem ordenação definida

Severidade: Média  
Prioridade: P3  
Componente: Backend | UX

Descrição  
`findAll` usa `find()` sem `order`. Ordem pode variar entre consultas e ambientes.

Passos para Reproduzir  
1. Criar várias tarefas e recarregar repetidamente comparando ordem.

Resultado Esperado  
Ordem estável e documentada (ex.: mais recentes primeiro).

Resultado Obtido  
Ordem não garantida.

Evidência  
`tasks.service.ts` — `findAll`.

Sugestão de Correção  
`order: { createdAt: 'DESC' }` (campo existente na entidade) ou equivalente.

---

[BUG-009] Formato de erro inconsistente entre endpoints

Severidade: Baixa  
Prioridade: P3  
Componente: API

Descrição  
`NotFoundException` customizado com `{ error: 'Task not found' }` pode diferir do envelope padrão do `ValidationPipe` (`message`, `statusCode`).

Passos para Reproduzir  
1. Comparar corpo de 404 em `GET /tasks/:id` com 400 em payload inválido.

Resultado Esperado  
Contrato único documentado no Swagger para cliente.

Resultado Obtido  
Clientes precisam tratar múltiplos formatos.

Evidência  
`tasks.service.ts` `findOne` vs respostas de validação globais.

Sugestão de Correção  
Filtro de exceção global ou mensagens alinhadas ao padrão Nest.

---

[BUG-010] Botão “Gerar tarefas” não desabilita durante loading

Severidade: Média  
Prioridade: P2  
Componente: Frontend | UX

Descrição  
Cliques repetidos podem disparar múltiplas requisições concorrentes à IA.

Passos para Reproduzir  
1. Clicar rapidamente em “Gerar tarefas” durante “Carregando...”.

Resultado Esperado  
Botão desabilitado ou debounce até conclusão.

Resultado Obtido  
Novas chamadas podem ser enfileiradas (race).

Evidência  
`AiGenerator.tsx` — botão sem `disabled={isLoading}`.

Sugestão de Correção  
Desabilitar botão e inputs ou ignorar cliques enquanto `isLoading`.

---

[BUG-011] Ausência de limite de tamanho do título no backend

Severidade: Baixa  
Prioridade: P3  
Componente: Backend | API | Segurança

Descrição  
Sem `@MaxLength`, títulos arbitrariamente grandes podem ser persistidos.

Passos para Reproduzir  
1. `POST /tasks` com título de dezenas de KB.

Resultado Esperado  
400 com limite claro.

Resultado Obtido  
Aceita e armazena.

Evidência  
`create-task.dto.ts`.

Sugestão de Correção  
`@MaxLength(500)` (ou valor de produto) e espelhar no frontend.

---

[BUG-012] Lista vazia sem `empty state`

Severidade: Média  
Prioridade: P2  
Componente: Frontend | UX

Descrição  
Com zero tarefas, apenas `<ul>` vazio — sem orientação ao usuário.

Passos para Reproduzir  
1. Banco sem tarefas; abrir app.

Resultado Esperado  
Mensagem e CTA alinhados ao PRD de onboarding.

Resultado Obtido  
Área em branco.

Evidência  
`TaskList.tsx`.

Sugestão de Correção  
Bloco condicional com texto e opcionalmente `data-testid="tasks-empty-state"`.

---

[BUG-013] Botão de excluir sem rótulo acessível

Severidade: Média  
Prioridade: P2  
Componente: Acessibilidade

Descrição  
Botão só com ícone SVG, sem `aria-label` (até correção), leitor de tela anuncia “botão” genérico.

Passos para Reproduzir  
1. Navegar com leitor de tela até o botão de lixeira.

Resultado Esperado  
Nome acessível, ex.: “Excluir tarefa”.

Resultado Obtido  
Nome não descritivo (depende do AT).

Evidência  
`TaskItem.tsx` — mitigação aplicada: `aria-label` dinâmico no checkbox, `aria-label` no botão excluir e rótulos ARIA nos formulários/IA (`TaskForm`, `AiGenerator`).

Sugestão de Correção  
Revisar contraste/foco visível globalmente e validar com leitores de tela reais além do axe.

---

[BUG-014] Texto de loading genérico na IA

Severidade: Baixa  
Prioridade: P4  
Componente: UX | Acessibilidade

Descrição  
“Carregando...” não comunica que a IA está gerando subtarefas nem tempo esperado.

Passos para Reproduzir  
1. Acionar geração e observar o botão.

Resultado Esperado  
Copy específica (“Gerando subtarefas…”) e, se possível, indeterminado acessível.

Resultado Obtido  
Texto genérico.

Evidência  
`AiGenerator.tsx`.

Sugestão de Correção  
Atualizar string e considerar `aria-busy` no container.

---

[BUG-015] Swagger healthcheck vs documentação de “tasks”

Severidade: Baixa  
Prioridade: P4  
Componente: API

Descrição  
Healthcheck do Docker usa `GET /tasks`; válido, mas não documenta semântica de “pronto para gravar” (migrations, lock SQLite).

Passos para Reproduzir  
1. Inspecionar `docker-compose.yml` healthcheck.

Resultado Esperado  
Endpoint de health dedicado ou critério explícito na documentação de deploy.

Resultado Obtido  
Uso de listagem como probe (aceitável porém acoplado).

Evidência  
`docker-compose.yml`.

Sugestão de Correção  
`GET /health` mínimo ou README de operação.

---

[BUG-016] Permitir várias tarefas com o mesmo título (duplicidade sem aviso)

Severidade: Média  
Prioridade: P2  
Componente: Produto | Backend | UX

Descrição  
Não há validação de unicidade de `title` no `CreateTaskDto` nem índice único na entidade. É possível criar duas ou mais tarefas com texto idêntico, o que confunde listagem, exclusão por “nome” e relatórios.

Passos para Reproduzir  
1. Criar tarefa manual com título `Comprar leite`.  
2. Criar outra tarefa manual com o mesmo título `Comprar leite`.

Resultado Esperado  
Definir regra de produto: bloquear duplicata (com mensagem), sugerir sufixo, ou permitir com aviso explícito.

Resultado Obtido  
Duas linhas distintas com o mesmo rótulo (IDs diferentes).

Evidência  
`tasks.service.ts` — `create` sem checagem de duplicidade; entidade `Task` sem constraint única em `title`.

Sugestão de Correção  
Índice composto ou validação aplicacional; mensagem na UI se duplicata for rejeitada.

---

[BUG-017] Campos de API Key e objetivo da IA vs. criação de tarefa manual

Severidade: Média  
Prioridade: P2  
Componente: Frontend | UX

Descrição  
Relato de uso: ao incluir uma nova tarefa pelo formulário manual, os campos “API Key” e objetivo (“lançar novo produto” / placeholder do bloco de IA) apagariam a cada inclusão. Na implementação atual, `AiGenerator` usa `useState` local e não é desmontado quando `createTask` atualiza a lista — em condições normais esses campos **não** deveriam ser limpos só por adicionar tarefa manual. Se o comportamento ocorrer no browser (ex.: hot reload, erro de layout), tratar como defeito; caso contrário, falta **persistência** entre recargas (chave/objetivo somem ao dar F5).

Passos para Reproduzir  
1. Preencher API Key e objetivo no bloco “Gerar tarefas com IA”.  
2. Criar uma tarefa pelo formulário “Adicionar nova tarefa”.  
3. Observar se API Key e objetivo permanecem.

Resultado Esperado  
Comportamento previsível: manter valores enquanto a sessão estiver aberta; opcionalmente persistir chave em `sessionStorage` (com cuidado de segurança).

Resultado Obtido  
Possível perda aparente dos valores ou apenas limpeza do campo de título do formulário manual (comportamento esperado para o título).

Evidência  
`AiGenerator.tsx` — estado independente de `TaskForm`; `page.tsx` — ambos irmãos sob o mesmo `HomePage`.

Sugestão de Correção  
Testes E2E cobrindo sequência “preencher IA → criar tarefa manual → campos IA intactos”; se necessário, `sessionStorage` para API key ou mensagem de ajuda esclarecendo o que é limpo.

---

[BUG-018] Exclusão de tarefa sem mensagem de feedback na interface

Severidade: Média  
Prioridade: P2  
Componente: Frontend | UX

Descrição  
Ao clicar em excluir, a tarefa some da lista imediatamente, sem toast, banner, “desfazer” ou diálogo de confirmação. O usuário não recebe confirmação explícita de que a ação foi concluída (além da remoção visual), o que aumenta risco de exclusão acidental.

Passos para Reproduzir  
1. Criar uma tarefa.  
2. Clicar no ícone de lixeira.

Resultado Esperado  
Feedback claro (ex.: toast “Tarefa excluída” com desfazer em 5 s, ou confirmação antes de apagar).

Resultado Obtido  
Apenas remoção imediata da linha; sem mensagem dedicada.

Evidência  
`TaskItem.tsx` — `onDelete` direto; sem estado de notificação no `HomePage`/`useTasks`.

Nota  
[BUG-013] cobre acessibilidade do botão; este item cobre **feedback pós-ação** para usuários videntes.

Sugestão de Correção  
Toast, `aria-live` para leitores de tela, ou modal de confirmação conforme grau de risco aceito pelo produto.

---

[BUG-019] “Gerar tarefas” com objetivo vazio não exibe mensagem

Severidade: Média  
Prioridade: P2  
Componente: Frontend | UX | Acessibilidade

Descrição  
`handleGenerate` retorna imediatamente se `!objective.trim()`, sem atualizar estado de erro nem mensagem visível. O usuário pode clicar repetidamente em “Gerar tarefas” sem entender por que nada acontece. API Key vazia pode ser aceita pelo backend conforme configuração, mas **objetivo vazio** permanece silencioso na UI.

Passos para Reproduzir  
1. Deixar o campo de objetivo em branco (e opcionalmente API Key vazia).  
2. Clicar em “Gerar tarefas”.

Resultado Esperado  
Mensagem inline ou `aria-live` informando que o objetivo é obrigatório; opcionalmente desabilitar o botão até haver texto válido.

Resultado Obtido  
Nenhum feedback visual ou por leitor de tela além da ausência de chamada.

Evidência  
`AiGenerator.tsx` — `if (!objective.trim()) return;` sem UI associada.

Nota  
Falhas de rede/IA já estão em [BUG-003]; este item é específico para **validação de campos vazios**.

Sugestão de Correção  
Estado `fieldError`, texto abaixo do campo de objetivo, `aria-invalid`, e `disabled` no botão quando `!objective.trim()`.

---
