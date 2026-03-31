# Explicação dos Arquivos do Projeto

Documentação detalhada de cada arquivo `.html`, `.ts` e `.scss` do projeto.

---

## Sumário

- [App (raiz)](#app-raiz)
- [Página — List](#página--list)
- [Componente — InputAddItem](#componente--inputadditem)
- [Componente — InputListItem](#componente--inputlistitem)
- [Estilos Globais](#estilos-globais)

---

## App (raiz)

### `src/app/app.component.ts`

Componente raiz da aplicação. É o ponto de entrada que o Angular renderiza no `index.html` através do seletor `<app-root>`.

Não possui lógica de negócio — sua única responsabilidade é renderizar o `<router-outlet>`, que é o espaço onde as páginas definidas nas rotas são inseridas dinamicamente.

```typescript
template: `<router-outlet></router-outlet>`
```

---

### `src/app/app.config.ts`

Arquivo de configuração da aplicação no padrão standalone do Angular 17 (substitui o antigo `AppModule`).

Registra os providers globais da aplicação. Atualmente registra apenas o `provideRouter(routes)`, que inicializa o sistema de rotas com as rotas definidas em `app.routes.ts`.

---

### `src/app/app.routes.ts`

Define as rotas da aplicação. Atualmente possui uma única rota:

| Path | Componente | Descrição |
| --- | --- | --- |
| `''` (raiz) | `ListComponent` | Exibe a página principal da lista de tarefas |

Não há lazy loading — o `ListComponent` é carregado diretamente.

---

## Página — List

### `src/app/modules/to-do-list/pages/list/list.component.ts`

Componente container e principal da aplicação. Centraliza todo o estado e as regras de negócio.

**Estado (Signals):**

| Signal | Acesso | Descrição |
| --- | --- | --- |
| `addItem` | público | Controla se o campo de adicionar está visível (`true` = oculto, aguardando clique) |
| `#setListItems` | privado | Fonte única de verdade — armazena todos os itens da lista |
| `getListItems` | público (readonly) | Versão somente leitura de `#setListItems`, repassada aos filhos |

**Métodos:**

| Método | O que faz |
| --- | --- |
| `#parseItems()` | Lê e faz o parse do JSON salvo no `localStorage` |
| `#updateLocalStorage()` | Serializa o estado atual e salva no `localStorage` |
| `getInputAndAddItem(value)` | Recebe o novo item vindo do filho, salva no `localStorage` e atualiza o signal |
| `listItemsStage(value)` | Filtra os itens por status: `'pending'` (não marcados) ou `'completed'` (marcados) |
| `updateItemCheckbox(newItem)` | Percorre a lista e atualiza o `checked` do item com o `id` correspondente |
| `updateItemText(newItem)` | Percorre a lista e atualiza o `value` do item com o `id` correspondente |
| `deleteItem(id)` | Abre um diálogo de confirmação (SweetAlert2) e remove o item se confirmado |
| `deleteAllItems()` | Abre um diálogo de confirmação (SweetAlert2) e limpa toda a lista se confirmado |

---

### `src/app/modules/to-do-list/pages/list/list.component.html`

Template da página principal. Possui dois estados visuais distintos controlados pelo bloco `@if / @else`:

**Estado 1 — Lista vazia** (`getListItems().length === 0`):

Exibe uma imagem ilustrativa e, dependendo do signal `addItem()`:
- Se `addItem()` for `true`: mostra o botão "Crie uma lista de tarefas". Ao clicar, seta `addItem` para `false`.
- Se `addItem()` for `false`: exibe o componente `<app-input-add-item>` para que o usuário possa adicionar o primeiro item.

**Estado 2 — Lista com itens** (`getListItems().length > 0`):

Exibe sempre o `<app-input-add-item>` no topo. Abaixo, dentro de um `<main>`, renderiza dois blocos condicionais:
- **Pendências**: lista filtrada por `listItemsStage('pending')`, renderizada pelo `<app-input-list-item>`.
- **Concluídas**: lista filtrada por `listItemsStage('completed')`, renderizada por outro `<app-input-list-item>`.

No rodapé (`<footer>`), exibe o botão "Deletar todos os Items" que chama `deleteAllItems()`.

---

### `src/app/modules/to-do-list/pages/list/list.component.scss`

Estiliza o layout da página principal usando `:host` (aplica estilos no próprio elemento do componente).

| Regra | Efeito |
| --- | --- |
| `height: 100vh / 100dvh` | Ocupa toda a altura da tela. O `dvh` é o fallback moderno que desconsidera barras de navegação móvel |
| `flex-direction: column` | Empilha header, main e footer verticalmente |
| `main.container` | Altura calculada descontando o header (~130px) e o footer (90px), com `overflow-y: auto` para scroll interno |
| `::-webkit-scrollbar` | Customiza a barra de scroll: largura de 4px, trilha escura e thumb na cor primária (`--primary`) |
| `footer` | Altura fixa de 90px, centralizado, com borda superior separando o conteúdo |

---

## Componente — InputAddItem

### `src/app/modules/to-do-list/components/input-add-item/input-add-item.component.ts`

Componente de apresentação responsável por capturar e emitir novos itens.

**Dependências injetadas:**
- `ChangeDetectorRef` — usado para forçar a detecção de mudanças antes de limpar o campo de texto, garantindo que o Angular atualize a view no momento certo.

**Propriedades:**

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| `@ViewChild('inputText')` | `ElementRef` | Referência direta ao elemento `<input>` do template |
| `@Input() inputListItems` | `IListItems[]` | Recebe a lista atual para controlar a exibição condicional do cabeçalho |
| `@Output() outputAddListItem` | `EventEmitter<IListItems>` | Emite o novo item para o componente pai |

**Método `focusAndAddItem(value)`:**

1. Valida se o valor não está vazio.
2. Chama `detectChanges()` para sincronizar a view.
3. Limpa o campo de texto via `nativeElement.value = ''`.
4. Gera um ID único com `"ID " + new Date().getTime()`.
5. Emite o objeto `{ id, checked: false, value }` para o pai.
6. Recoloca o foco no input para que o usuário possa digitar o próximo item sem clicar novamente.

---

### `src/app/modules/to-do-list/components/input-add-item/input-add-item.component.html`

Renderiza o cabeçalho da aplicação com o campo de adição de itens.

**Comportamento condicional via `[ngClass]`:**
- A classe `has-items` é aplicada no `<header>` quando há itens na lista, adicionando borda inferior e layout centralizado.
- O `<h1>Minha lista</h1>` só é exibido quando há itens (`@if (inputListItems.length)`).
- A classe `remove-margin-bottom` remove a margem inferior do label quando a lista está vazia.

**Campo de texto:**
- Dispara `focusAndAddItem()` tanto no evento `(keyup.enter)` quanto no clique do botão.
- Usa `#inputText` como referência de template para acessar o valor diretamente.
- O botão usa a classe `btn-primary-circle`, que exibe um ícone de "+" via pseudo-elemento `::after` no CSS global.

---

### `src/app/modules/to-do-list/components/input-add-item/input-add-item.component.scss`

Estiliza o cabeçalho do componente de adição.

| Regra | Efeito |
| --- | --- |
| `:host { width: 100% }` | Garante que o componente ocupe toda a largura disponível |
| `h1` | Fonte 18px, centralizado, cor branca (`--white`), com margem vertical de 18px |
| `.has-items` | Ativa quando há itens: layout flex em coluna centralizado, com borda inferior separando o header do conteúdo |
| `.remove-margin-bottom` | Remove a margem inferior do label quando a lista está vazia |

---

## Componente — InputListItem

### `src/app/modules/to-do-list/components/input-list-item/input-list-item.component.ts`

Componente de apresentação puro — não possui lógica de negócio. Apenas recebe dados e emite eventos para o pai.

**Inputs e Outputs:**

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| `@Input() inputListItems` | `IListItems[]` | Array de itens a serem renderizados |
| `@Output() outputUpdateItemCheckbox` | `EventEmitter<{ id, checked }>` | Emite quando o checkbox de um item é alterado |
| `@Output() outputUpdateItemText` | `EventEmitter<{ id, value }>` | Emite quando o texto de um item é editado |
| `@Output() outputDeleteItem` | `EventEmitter<string>` | Emite o `id` do item a ser deletado |

Cada método (`updateItemCheckbox`, `updateItemText`, `deleteItem`) apenas chama `.emit()` no Output correspondente, delegando toda a lógica ao `ListComponent`.

---

### `src/app/modules/to-do-list/components/input-list-item/input-list-item.component.html`

Itera sobre os itens recebidos com o bloco `@for`, renderizando para cada um:

| Elemento | Função |
| --- | --- |
| `input[type="checkbox"]` | Exibe o status de conclusão. O evento `(input)` chama `updateItemCheckbox()` passando `id` e o estado atual do checkbox via `#inputCheckbox` |
| `input[type="text"]` | Exibe o texto editável da tarefa. O evento `(input)` chama `updateItemText()` com o `id` e o valor atual via `#inputValue` |
| `button.btn-danger-circle` | Botão de exclusão que chama `deleteItem(item.id)`. Exibe ícone de lixeira via CSS global |

O `[for]` do `<label>` aponta para o `[id]` do `input[type="text"]`, vinculando o label ao campo de texto correto.

---

### `src/app/modules/to-do-list/components/input-list-item/input-list-item.component.scss`

Arquivo vazio — todo o estilo visual dos itens vem das classes globais `.input-label-text`, `.btn` e `.btn-danger-circle` definidas em `src/scss/`.

---

## Estilos Globais

### `src/styles.scss`

Ponto de entrada dos estilos globais. Importa o arquivo `src/scss/_index.scss`, que por sua vez importa todas as partials organizadas por categoria.

---

### `src/scss/_index.scss`

Arquivo de barril (barrel) dos estilos. Importa as quatro categorias de estilos na seguinte ordem:

```text
base/index  →  component/index  →  layout/index  →  theme/index
```

---

### `src/scss/base/_reset.scss`

Reset de estilos padrão do navegador e definição da tipografia base da aplicação.

| Regra | Efeito |
| --- | --- |
| `* { box-sizing: border-box }` | Faz com que padding e border sejam incluídos nas dimensões dos elementos |
| `html, body { height: 100% }` | Permite que filhos usem `height: 100vh` corretamente |
| `body` | Remove margens, define fundo preto (`--black`) e fonte Roboto |
| `h1` | Tamanho 22px |
| `h2, h3` | Tamanho 16px |
| `h1, h2, h3, a` | Cor branca (`--white`) e sem sublinhado em links |
| `p` | Cor cinza (`--grey`), tamanho 14px |
| `ul` | Remove bullet points, padding e margin padrão |

---

### `src/scss/theme/_variables.scss`

Define as variáveis CSS globais (custom properties) que formam o sistema de cores da aplicação.

| Variável | Valor | Uso |
| --- | --- | --- |
| `--primary` | `#2fbf71` | Verde — botão de adicionar, checkbox marcado |
| `--primary-010` | `#21804d` | Verde escuro — hover do botão primário |
| `--white` | `#fff` | Textos, ícones |
| `--grey` | `#9b9ba0` | Textos secundários (parágrafos) |
| `--black` | `#10101a` | Fundo da aplicação |
| `--black-010` | `#2a2a30` | Fundo dos inputs e cards |
| `--red` | `#c90025` | Botão de deletar |
| `--red-010` | `#a3001e` | Vermelho escuro — hover do botão de deletar |

---

### `src/scss/component/_button.scss`

Define os estilos de todos os botões da aplicação através da classe base `.btn` e suas variações.

| Classe | Aparência | Uso |
| --- | --- | --- |
| `.btn-primary` | Verde, pill (border-radius 50px), padding | Botão "Crie uma lista de tarefas" |
| `.btn-primary-circle` | Verde, circular (30x30px), ícone `add.svg` via `::after` | Botão de adicionar novo item |
| `.btn-danger` | Vermelho, pill, padding | Botão "Deletar todos os Items" |
| `.btn-danger-circle` | Vermelho, circular (30x30px), ícone `delete.svg` via `::after` | Botão de deletar item individual |

Todos têm `transition: 0.5s` para animação suave no hover e `cursor: pointer`.

---

### `src/scss/component/_input-label-text.scss`

Estiliza a classe `.input-label-text`, usada tanto no campo de adição quanto em cada item da lista.

| Regra | Efeito |
| --- | --- |
| `height: 40px`, `border-radius: 50px` | Formato pill arredondado |
| `background: var(--black-010)` | Fundo escuro que contrasta com o fundo da página |
| `input[type="text"]` | Sem borda, fundo transparente, cor branca, sem outline — aparência limpa e integrada |
| `input[type="checkbox"]` | Aparência customizada: circular, branco quando desmarcado, verde (`--primary`) quando marcado (`&:checked`) |
| `input[type="checkbox"] + input[type="text"]` | Remove a margem esquerda do texto quando há checkbox ao lado |

---

### `src/scss/layout/_container.scss`

Define a classe `.container` que limita a largura do conteúdo e centraliza o layout.

| Regra | Efeito |
| --- | --- |
| `width: 350px` | Largura fixa em telas maiores |
| `padding: 0 20px` | Espaçamento interno lateral |
| `@media (max-width: 750px)` | Em telas menores que 750px, o container ocupa `100%` da largura |
