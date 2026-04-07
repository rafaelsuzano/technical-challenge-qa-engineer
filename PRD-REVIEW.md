# PRD-REVIEW — Smart To-Do List com IA

Revisão do documento `PRD.md` (v1.2) com foco em clareza, cobertura e riscos antes da validação em código.

---

[PRD-001] Limites e validação do título da tarefa não estão definidos

Requisito afetado: RF-02  
Categoria: Requisito ausente

Problema identificado  
O PRD exige um “título” no formulário manual, mas não define comprimento máximo, mínimo, se espaços em branco devem ser normalizados com `trim()`, nem se caracteres especiais ou HTML são permitidos.

Por que isso é um risco  
Backend e frontend podem divergir (ex.: aceitar apenas espaços, ou títulos enormes), gerando bugs de UX, armazenamento e possível vetor de abuso.

Sugestão de melhoria  
Especificar: título obrigatório após `trim()`, comprimento máximo (ex.: 500), rejeição de string vazia e comportamento de mensagem de erro.

---

[PRD-002] Critério de persistência de “concluída” é incompleto para cenários reais

Requisito afetado: RF-03  
Categoria: Critério de aceitação incompleto

Problema identificado  
“A mudança de estado deve persistir” aparece na narrativa de RF-03, mas nos critérios de aceitação só há persistência implícita no clique, sem referência a recarregar a página, reabrir o navegador ou falha de rede durante atualização.

Por que isso é um risco  
Implementações podem persistir só em memória no cliente, atendendo literalmente o checklist mas violando a expectativa do usuário (persona Marina).

Sugestão de melhoria  
Incluir critérios: após marcar concluída e recarregar a aplicação, o estado permanece; definir comportamento se o PATCH falhar (mensagem, rollback otimista).

---

[PRD-003] Geração por IA sem requisitos de falha, timeout e vazio

Requisito afetado: RF-05  
Categoria: Requisito ausente | Risco técnico

Problema identificado  
Não há definição do que ocorre se o provedor estiver indisponível, se a chave for inválida, se a resposta não for JSON válido, se vier lista vazia, ou se o tempo de resposta exceder um limite razoável.

Por que isso é um risco  
UX silenciosa, abandono (persona Marina) e inconsistência entre ambientes.

Sugestão de melhoria  
Documentar estados: erro exibido na UI, mensagens mínimas, retry opcional, limite de timeout e decisão sobre “salvar 0 tarefas” vs. erro.

---

[PRD-004] RF-06 não cobre armazenamento nem ciclo de vida da API Key

Requisito afetado: RF-06  
Categoria: Segurança | Requisito ausente

Problema identificado  
Exige campo para chave e que a funcionalidade “fique disponível”, mas não define se a chave fica só em memória, sessionStorage, localStorage, ou se é reenviada a cada requisição; nem política de mascaramento ou logout.

Por que isso é um risco  
Exposição accidental (XSS, backups de browser) e ambiguidade para auditoria.

Sugestão de melhoria  
Especificar modelo de armazenamento (ideal: não persistir em disco; apenas sessão), UX de mascaramento e revalidação quando a primeira chamada retornar 401.

---

[PRD-005] Provedor e modelo padrão em aberto vs. critérios testáveis

Requisito afetado: RF-05 / Q3 na seção 9  
Categoria: Ambiguidade | Risco técnico

Problema identificado  
Q3 permanece “em definição” enquanto RF-05 define comportamento de produto; testes e SLAs de latência dependem do modelo e do provedor.

Por que isso é um risco  
“IA response inconsistency” não tem baseline para aceite; métricas de adoção ficam difíceis de comparar entre releases.

Sugestão de melhoria  
Congelar provedor e modelo padrão no PRD (ou variável de ambiente documentada) e uma tolerância mínima de formato de saída (array de strings).

---

[PRD-006] Exclusão sem confirmação nem desfazer

Requisito afetado: RF-04  
Categoria: UX | Edge cases

Problema identificado  
Não menciona confirmação para exclusão acidental nem padrão para teclado ou leitor de tela.

Por que isso é um risco  
Perda de dados percebida sem recuperação; aumento de suporte.

Sugestão de melhoria  
Para v1, ao menos definir se exclusão é irreversível e se há confirmação; se não, documentar como decisão consciente de “baixa fricção”.

---

[PRD-007] Listagem sem ordenação explícita

Requisito afetado: RF-01  
Categoria: Ambiguidade

Problema identificado  
“Lista unificada” não define ordem (criação DESC, manual vs. IA, estável entre reloads).

Por que isso é um risco  
Ordem não determinística confunde testes e usuários ao comparar listas entre dispositivos.

Sugestão de melhoria  
Declarar ordenação padrão (ex.: `createdAt` decrescente) como requisito funcional ou derivado de persistência.

---

[PRD-008] RFNs não mencionam acessibilidade nem erros de API

Requisito afetado: RNF (compatibilidade/responsividade)  
Categoria: Acessibilidade | Requisito ausente

Problema identificado  
Há compatibilidade Chrome/Firefox e largura mínima, mas não há alvo WCAG, foco visível, contraste mínimo, nem tratamento de indisponibilidade da API para leitores de tela.

Por que isso é um risco  
Inconsistência com necessidades de acessibilidade em contextos corporativos e regressões não detectadas.

Sugestão de melhoria  
Adicionar RNF de acessibilidade (ex.: WCAG 2.1 AA alvo) e requisito de anúncio de erros via `aria-live` ou equivalente.

---

[PRD-009] Estados vazios e “primeiro uso”

Requisito afetado: RF-01 / RF-02  
Categoria: Requisito ausente | UX

Problema identificado  
Não descreve o que o usuário vê com zero tarefas (mensagem orientativa, CTA para IA ou criação manual).

Por que isso é um risco  
Primeira sessão fraca e métrica “tempo até primeira tarefa” prejudicada por falta de guia.

Sugestão de melhoria  
Definir empty state obrigatório com copy e opcional link/foco para o formulário.

---

[PRD-010] Tratamento de erros da API no cliente

Requisito afetado: RF-02, RF-04 (implicitamente)  
Categoria: Critério de aceitação incompleto

Problema identificado  
Critérios de aceitação cobrem fluxo feliz; não exibem mensagem se POST /tasks ou DELETE falhar.

Por que isso é um risco  
Falso “sucesso” local ou lista dessincronizada com o servidor.

Sugestão de melhoria  
Acrescentar critérios: falha de rede exibe feedback e opção de repetir ou recarregar lista.

---

[PRD-011] Persistência de dados e instalação local

Requisito afetado: RNF disponibilidade  
Categoria: Risco técnico

Problema identificado  
Não esclarece se dados são locais por instância (SQLite em container), backup, ou perda ao recriar volumes Docker.

Por que isso é um risco  
Expectativa errada em demos e testes E2E em CI.

Sugestão de melhoria  
Nota técnica no PRD: modelo de dados efêmero vs. persistente por volume; impacto em “reload” e ambientes compartilhados.

---

[PRD-012] Métricas de sucesso sem baseline

Requisito afetado: Seção 2  
Categoria: Ambiguidade

Problema identificado  
Metas percentuais (20%, +30%, 40%) não possuem baseline ou janela de medição definida.

Por que isso é um risco  
Impossível validar sucesso do release sem instrumentação acordada.

Sugestão de melhoria  
Referenciar fonte de dados, período e segmento de usuários para cada métrica.

---
