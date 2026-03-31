# Arquitetura do Projeto — Lista de Tarefas

## Visão Geral

Aplicação Angular 17 de lista de tarefas (To-Do List) com componentes standalone, gerenciamento de estado via Signals API e persistência em `localStorage`.

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── app.component.ts         (Componente raiz)
│   ├── app.config.ts            (Configuração da aplicação)
│   ├── app.routes.ts            (Rotas)
│   └── modules/
│       └── to-do-list/
│           ├── components/
│           │   ├── input-add-item/      (Componente de adicionar tarefa)
│           │   └── input-list-item/     (Componente de exibir tarefas)
│           ├── pages/
│           │   └── list/                (Página principal)
│           ├── interface/
│           │   └── IListItems.interface.ts
│           └── enum/
│               └── ELocalStorage.enum.ts
├── index.html
├── main.ts
└── styles.scss
```

---

## Componentes

### `ListComponent` — Página principal
**Caminho:** `src/app/modules/to-do-list/pages/list/list.component.ts`

Componente container. Centraliza todo o estado da aplicação e as regras de negócio.

| Método | Responsabilidade |
|---|---|
| `getInputAndAddItem(value)` | Adiciona novo item à lista e ao `localStorage` |
| `listItemsStage(value)` | Filtra itens por status (`'pending'` ou `'completed'`) |
| `updateItemCheckbox(newItem)` | Atualiza o status de conclusão de um item |
| `updateItemText(newItem)` | Atualiza o texto de um item |
| `deleteItem(id)` | Remove um item com confirmação (SweetAlert2) |
| `deleteAllItems()` | Remove todos os itens com confirmação (SweetAlert2) |

---

### `InputAddItemComponent` — Adicionar tarefa
**Caminho:** `src/app/modules/to-do-list/components/input-add-item/`

Componente de apresentação. Renderiza o campo de texto para criar novas tarefas.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `@Input() inputListItems` | `IListItems[]` | Lista atual (usada para exibir/ocultar cabeçalho) |
| `@Output() outputAddListItem` | `EventEmitter` | Emite o novo item criado para o pai |

---

### `InputListItemComponent` — Exibir tarefas
**Caminho:** `src/app/modules/to-do-list/components/input-list-item/`

Componente de apresentação. Renderiza cada item da lista com checkbox, campo de edição e botão de exclusão.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `@Input() inputListItems` | `IListItems[]` | Array de itens a exibir |
| `@Output() outputUpdateItemCheckbox` | `EventEmitter` | Emite `{ id, checked }` ao marcar/desmarcar |
| `@Output() outputUpdateItemText` | `EventEmitter` | Emite `{ id, value }` ao editar texto |
| `@Output() outputDeleteItem` | `EventEmitter` | Emite o `id` do item a ser deletado |

---

## Comunicação entre Componentes

```
ListComponent (container / pai)
│
├── [inputListItems] ──────────► InputAddItemComponent
│   ◄── (outputAddListItem) ────── getInputAndAddItem()
│
├── [inputListItems] ──────────► InputListItemComponent (pendentes)
│   ◄── (outputUpdateItemCheckbox) updateItemCheckbox()
│   ◄── (outputUpdateItemText) ─── updateItemText()
│   ◄── (outputDeleteItem) ──────── deleteItem()
│
└── [inputListItems] ──────────► InputListItemComponent (concluídas)
    ◄── (outputUpdateItemCheckbox) updateItemCheckbox()
    ◄── (outputUpdateItemText) ─── updateItemText()
    ◄── (outputDeleteItem) ──────── deleteItem()
```

**Padrão:** fluxo unidirecional — dados descem via `@Input`, eventos sobem via `@Output`.

---

## Modelo de Dados

### `IListItems`
**Caminho:** `src/app/modules/to-do-list/interface/IListItems.interface.ts`

```typescript
interface IListItems {
  id: string;       // Gerado com "ID " + new Date().getTime()
  checked: boolean; // Status de conclusão
  value: string;    // Texto da tarefa
}
```

---

## Enum

### `ELocalStorage`
**Caminho:** `src/app/modules/to-do-list/enum/ELocalStorage.enum.ts`

```typescript
enum ELocalStorage {
  MY_LIST = '@my-list'
}
```

Centraliza a chave usada no `localStorage`, evitando strings soltas no código.

---

## Rotas

**Arquivo:** `src/app/app.routes.ts`

```typescript
{ path: '', component: ListComponent }
```

Aplicação de rota única. Sem lazy loading.

---

## Gerenciamento de Estado

Baseado na **Signals API do Angular 17**, centralizado no `ListComponent`.

| Signal | Visibilidade | Descrição |
|---|---|---|
| `#setListItems` | Privado | Fonte única de verdade da lista |
| `getListItems` | Público (readonly) | Referência somente leitura para os filhos |
| `addItem` | Público | Controla a visibilidade do campo de adição |

**Fluxo de atualização:**
```
Ação do usuário → Método do ListComponent → Signal.update/set() → localStorage.setItem()
                                           ↓
                              Componentes filhos recebem os dados atualizados
```

Não utiliza serviços, RxJS ou gerenciamento de estado externo (ex: NgRx).

---

## Persistência

Todos os dados são salvos em `localStorage` sob a chave `@my-list`.

- **Leitura:** na inicialização do `ListComponent` via `#parseItems()`
- **Escrita:** após cada operação (adicionar, editar, deletar) via `#updateLocalStorage()`

---

## Dependências Principais

| Pacote | Versão | Uso |
|---|---|---|
| `@angular/core` | 17 | Framework, Signals API |
| `@angular/router` | 17 | Roteamento |
| `sweetalert2` | — | Diálogos de confirmação nas exclusões |
| `typescript` | 5.2 | Linguagem |

> **Atenção:** o `sweetalert2` é usado no código mas **não está declarado no `package.json`**. É necessário executar `npm install sweetalert2` para corrigir o erro de build.

---

## Padrões Utilizados

- **Standalone Components** — sem NgModules (padrão moderno do Angular 17)
- **Container / Presentational** — `ListComponent` gerencia estado; filhos apenas exibem
- **Signals** — estado reativo sem RxJS
- **Event Emitter** — comunicação filho → pai
- **Fluxo unidirecional de dados** — dados descem, eventos sobem
