# Achados de acessibilidade (B3)

Documentação complementar ao teste automatizado `tests/accessibility.spec.ts` (`@axe-core/playwright`).  
Três ou mais pontos observados na **Smart To-Do** (revisão manual + axe).

---

## 1. Foco visível inconsistente em controles customizados

**Onde:** botões apenas com ícone (ex.: excluir tarefa) e alguns inputs do bloco de IA.  
**Problema:** o foco por teclado pode ser pouco perceptível se o outline padrão foi removido ou contrasta mal com o fundo.  
**Impacto:** utilizadores que navegam só por teclado perdem a noção do elemento ativo.  
**Sugestão:** `:focus-visible` com contorno de ≥ 2px e contraste AA em relação ao fundo.

---

## 2. Feedback de erro da geração por IA não anunciado a leitores de tela

**Onde:** `AiGenerator` — falhas de API ficam só em `console.error` (BUG-003).  
**Problema:** sem `aria-live` nem região de alerta, o utilizador de leitor de tela não é informado de que a ação falhou.  
**Impacto:** violação de princípios de feedback perceptível e robusto (WCAG 4.1.3 em espírito).  
**Sugestão:** região `role="status"` ou `aria-live="polite"` com mensagem de erro textual.

---

## 3. Lista vazia sem estado semântico ou orientação

**Onde:** `TaskList` quando não há tarefas (BUG-012).  
**Problema:** apenas `<ul>` vazio — sem texto explicativo, sem landmark ou mensagem para tecnologia assistiva.  
**Impacto:** utilizador pode não perceber que a lista carregou e está vazia vs. ainda a carregar.  
**Sugestão:** `empty state` com copy curto e, se aplicável, `aria-busy` durante o carregamento e remoção explícita após `fetch`.

---

## 4. Texto de carregamento genérico no botão de IA (BUG-014)

**Onde:** botão “Carregando...” durante geração.  
**Problema:** não distingue de outros carregamentos da página; pouco contexto para leitores de tela.  
**Sugestão:** copy específica (ex. “A gerar subtarefas…”) e `aria-busy="true"` no contentor enquanto `isLoading`.

---

> **Nota:** O `accessibility.spec.ts` falha o build se o `main` tiver violações axe nos tags configurados; este ficheiro regista achados adicionais de UX/a11y para revisão humana e backlog de produto.
