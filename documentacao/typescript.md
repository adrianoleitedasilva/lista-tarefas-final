# Documentação TypeScript — Detalhamento Completo

Explicação detalhada de cada método, função, interface, enum e decorator presentes nos arquivos `.ts` do projeto.

---

## Sumário

- [Interfaces](#interfaces)
- [Enums](#enums)
- [App — Raiz](#app--raiz)
- [ListComponent](#listcomponent)
- [InputAddItemComponent](#inputadditemcomponent)
- [InputListItemComponent](#inputlistitemcomponent)

---

## Interfaces

### `IListItems`

**Arquivo:** `src/app/modules/to-do-list/interface/IListItems.interface.ts`

```typescript
export interface IListItems {
  id: string;
  checked: boolean;
  value: string;
}
```

Interface que define o contrato de um item da lista de tarefas. Todo objeto que representa uma tarefa na aplicação deve obrigatoriamente ter as três propriedades abaixo:

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| `id` | `string` | Identificador único do item. Gerado com o padrão `"ID " + timestamp` (ex: `"ID 1711900000000"`) |
| `checked` | `boolean` | Status de conclusão. `false` = pendente, `true` = concluída |
| `value` | `string` | Texto descritivo da tarefa digitado pelo usuário |

**Por que usar interface aqui?**
Interfaces em TypeScript são contratos em tempo de compilação — elas não geram nenhum código JavaScript no build final. São usadas para garantir que todos os objetos de tarefa na aplicação tenham a mesma estrutura, evitando erros de propriedade inexistente ou tipo incorreto.

---

## Enums

### `ELocalStorage`

**Arquivo:** `src/app/modules/to-do-list/enum/ELocalStorage.enum.ts`

```typescript
export enum ELocalStorage {
  MY_LIST = '@my-list',
}
```

Enum que centraliza as chaves utilizadas no `localStorage` da aplicação.

| Membro | Valor | Uso |
| --- | --- | --- |
| `MY_LIST` | `'@my-list'` | Chave usada para salvar e recuperar a lista de tarefas no `localStorage` |

**Por que usar enum aqui?**
Sem o enum, a string `'@my-list'` seria repetida em vários lugares do código (no `getItem`, `setItem`, `removeItem`). Se precisasse mudar o nome da chave, seria necessário encontrar e alterar cada ocorrência manualmente. Com o enum, a mudança é feita em um único lugar. Além disso, o TypeScript passa a checar o uso em tempo de compilação, eliminando erros de digitação.

O prefixo `@` na string é uma convenção para distinguir visualmente as chaves da aplicação de outras chaves que possam existir no `localStorage` do navegador.

---

## App — Raiz

### `app.component.ts`

**Arquivo:** `src/app/app.component.ts`

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  title = 'lista-tarefas';
}
```

#### Decorator `@Component`

O decorator `@Component` é uma função do Angular que transforma uma classe TypeScript comum em um componente Angular. Ele recebe um objeto de metadados com as seguintes propriedades:

| Propriedade | Valor | Descrição |
| --- | --- | --- |
| `selector` | `'app-root'` | Nome da tag HTML que representa este componente. Usado no `index.html` como `<app-root>` |
| `standalone` | `true` | Indica que o componente não pertence a nenhum `NgModule`. Padrão do Angular 17 |
| `imports` | `[RouterOutlet]` | Declara as dependências usadas no template. `RouterOutlet` é necessário para renderizar as rotas |
| `template` | `<router-outlet>` | Template inline (sem arquivo `.html` separado). Apenas injeta o sistema de rotas |

#### Propriedade `title`

```typescript
title = 'lista-tarefas';
```

Propriedade de instância da classe. Não é utilizada no template e não tem impacto funcional — é gerada automaticamente pelo Angular CLI ao criar um novo projeto.

---

### `app.config.ts`

**Arquivo:** `src/app/app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
```

#### `appConfig`

Constante do tipo `ApplicationConfig` (interface do Angular) que define os providers globais da aplicação. Substitui o papel que o `AppModule` cumpria nas versões anteriores do Angular.

É passada para a função `bootstrapApplication()` no `main.ts`, que inicializa a aplicação com essas configurações.

#### `provideRouter(routes)`

Função do Angular Router que registra o sistema de rotas como um provider global. Recebe o array `routes` exportado de `app.routes.ts` e disponibiliza o roteamento para toda a aplicação, incluindo as diretivas `RouterOutlet`, `RouterLink` e o serviço `Router`.

---

### `app.routes.ts`

**Arquivo:** `src/app/app.routes.ts`

```typescript
export const routes: Routes = [
  {
    path: '',
    component: ListComponent,
  },
];
```

#### `routes`

Array do tipo `Routes` (tipo do Angular Router) que define o mapeamento entre URLs e componentes da aplicação.

Cada objeto dentro do array é uma rota com as seguintes propriedades:

| Propriedade | Valor | Descrição |
| --- | --- | --- |
| `path` | `''` | Caminho da URL. String vazia significa a rota raiz (`http://localhost:4200/`) |
| `component` | `ListComponent` | Componente que será renderizado quando essa rota for acessada |

Atualmente há apenas uma rota, o que torna a aplicação de página única (SPA) sem navegação entre páginas.

---

## ListComponent

**Arquivo:** `src/app/modules/to-do-list/pages/list/list.component.ts`

Componente container principal da aplicação. Responsável por todo o estado e regras de negócio.

---

### Signals de estado

#### `addItem`

```typescript
public addItem = signal(true);
```

Signal booleano que controla se o campo de adição está visível ou oculto na tela de lista vazia.

- `true` (valor inicial) → exibe o botão "Crie uma lista de tarefas"
- `false` → exibe o componente `<app-input-add-item>`

Quando o usuário clica no botão, o template executa `addItem.set(false)` diretamente, tornando o campo visível.

**O que é um Signal?**
Signal é uma primitiva reativa introduzida no Angular 17. Diferente de variáveis comuns, quando o valor de um signal muda, o Angular atualiza automaticamente apenas as partes do template que dependem daquele signal — sem precisar de `ChangeDetectionRef` ou RxJS.

#### `#setListItems`

```typescript
#setListItems = signal<IListItems[]>(this.#parseItems());
```

Signal privado (o `#` é a sintaxe JavaScript de campo privado de classe) que armazena o array de tarefas. É a **fonte única de verdade** da aplicação.

- É inicializado chamando `#parseItems()`, que lê os dados já salvos no `localStorage`
- O tipo genérico `<IListItems[]>` garante que apenas arrays de `IListItems` podem ser atribuídos
- Por ser privado, só pode ser modificado dentro do próprio `ListComponent`, protegendo o estado de alterações externas

#### `getListItems`

```typescript
public getListItems = this.#setListItems.asReadonly();
```

Versão somente leitura do signal `#setListItems`. É exposta como propriedade pública para que os componentes filhos possam ler a lista, mas sem conseguir modificá-la diretamente.

O método `.asReadonly()` retorna um `Signal<IListItems[]>` que não possui os métodos `.set()` e `.update()`, bloqueando qualquer tentativa de escrita externa.

---

### Métodos privados

#### `#parseItems()`

```typescript
#parseItems() {
  return JSON.parse(localStorage.getItem(ELocalStorage.MY_LIST) || '[]');
}
```

Método privado responsável por ler e desserializar os dados do `localStorage`.

**Passo a passo:**
1. `localStorage.getItem(ELocalStorage.MY_LIST)` — tenta recuperar o JSON salvo na chave `'@my-list'`
2. O operador `|| '[]'` garante um fallback: se a chave não existir (retorna `null`), usa a string `'[]'` (array vazio em JSON)
3. `JSON.parse(...)` converte a string JSON de volta para um array de objetos JavaScript

**Retorno:** `IListItems[]` — array de tarefas (vazio na primeira vez que o app é aberto)

#### `#updateLocalStorage()`

```typescript
#updateLocalStorage() {
  return localStorage.setItem(
    ELocalStorage.MY_LIST,
    JSON.stringify(this.#setListItems()),
  );
}
```

Método privado responsável por persistir o estado atual no `localStorage`.

**Passo a passo:**
1. `this.#setListItems()` — lê o valor atual do signal (os `()` são necessários para ler o valor de um signal)
2. `JSON.stringify(...)` — serializa o array de objetos para uma string JSON
3. `localStorage.setItem(...)` — salva a string na chave `'@my-list'`

É chamado sempre após qualquer operação que modifique a lista (atualizar checkbox, atualizar texto, deletar).

---

### Métodos públicos

#### `getInputAndAddItem(value: IListItems)`

```typescript
public getInputAndAddItem(value: IListItems) {
  localStorage.setItem(
    ELocalStorage.MY_LIST,
    JSON.stringify([...this.#setListItems(), value]),
  );

  return this.#setListItems.set(this.#parseItems());
}
```

Recebe o novo item emitido pelo `InputAddItemComponent` e o adiciona à lista.

**Passo a passo:**
1. Cria um novo array com o spread `[...this.#setListItems(), value]`, que copia todos os itens existentes e acrescenta o novo ao final
2. Salva esse novo array serializado no `localStorage`
3. Chama `this.#setListItems.set(this.#parseItems())` para atualizar o signal lendo do `localStorage` — garantindo que o estado em memória e o `localStorage` estejam sempre sincronizados

**Por que salvar no `localStorage` antes de atualizar o signal?**
O método escolhe salvar primeiro no `localStorage` e depois reler, em vez de atualizar o signal diretamente com `.update()`. Isso garante que o estado sempre reflete exatamente o que está persistido.

#### `listItemsStage(value: 'pending' | 'completed')`

```typescript
public listItemsStage(value: 'pending' | 'completed') {
  return this.getListItems().filter((res: IListItems) => {
    if (value === 'pending') return !res.checked;
    if (value === 'completed') return res.checked;
    return res;
  });
}
```

Filtra e retorna os itens da lista de acordo com o status solicitado.

**Parâmetro:** `value` aceita apenas as strings `'pending'` ou `'completed'` (union type literal do TypeScript — qualquer outro valor seria erro de compilação).

**Lógica de filtro:**
- `'pending'` → retorna itens onde `checked` é `false` (`!res.checked`)
- `'completed'` → retorna itens onde `checked` é `true` (`res.checked`)

É chamado diretamente no template para alimentar cada seção da lista:
```html
[inputListItems]="listItemsStage('pending')"
[inputListItems]="listItemsStage('completed')"
```

#### `updateItemCheckbox(newItem: { id: string; checked: boolean })`

```typescript
public updateItemCheckbox(newItem: { id: string; checked: boolean }) {
  this.#setListItems.update((oldValue: IListItems[]) => {
    oldValue.filter((res) => {
      if (res.id === newItem.id) {
        res.checked = newItem.checked;
        return res;
      }
      return res;
    });

    return oldValue;
  });

  return this.#updateLocalStorage();
}
```

Recebe o evento de troca de checkbox de um item e atualiza seu status de conclusão.

**Parâmetro:** objeto com `id` (para identificar qual item) e `checked` (novo valor do checkbox).

**Passo a passo:**
1. `.update()` recebe o array atual como `oldValue`
2. `.filter()` percorre o array procurando o item com `res.id === newItem.id`
3. Quando encontrado, muda `res.checked` para o novo valor
4. Retorna `oldValue` com a propriedade mutada
5. Chama `#updateLocalStorage()` para persistir a mudança

#### `updateItemText(newItem: { id: string; value: string })`

```typescript
public updateItemText(newItem: { id: string; value: string }) {
  this.#setListItems.update((oldValue: IListItems[]) => {
    oldValue.filter((res) => {
      if (res.id === newItem.id) {
        res.value = newItem.value;
        return res;
      }
      return res;
    });

    return oldValue;
  });

  return this.#updateLocalStorage();
}
```

Recebe o evento de edição de texto de um item e atualiza seu conteúdo.

**Parâmetro:** objeto com `id` (para identificar qual item) e `value` (novo texto digitado).

Segue a mesma lógica de `updateItemCheckbox`, mas muta a propriedade `value` em vez de `checked`.

#### `deleteItem(id: string)`

```typescript
public deleteItem(id: string) {
  Swal.fire({
    title: 'Tem certeza?',
    text: 'Você não poderá reverter isso!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, delete o item',
  }).then((result) => {
    if (result.isConfirmed) {
      this.#setListItems.update((oldValue: IListItems[]) => {
        return oldValue.filter((res) => res.id !== id);
      });

      return this.#updateLocalStorage();
    }
  });
}
```

Exibe um diálogo de confirmação e, se confirmado, remove o item da lista.

**Parâmetro:** `id` — identificador do item a ser deletado.

**Passo a passo:**
1. `Swal.fire({...})` abre o modal de confirmação do SweetAlert2 de forma assíncrona
2. `.then((result) => {...})` é executado após o usuário interagir com o modal
3. `result.isConfirmed` é `true` apenas se o usuário clicou no botão de confirmação (não no cancelar nem fechou o modal)
4. `.update()` com `.filter((res) => res.id !== id)` cria um novo array excluindo o item com o `id` correspondente
5. `#updateLocalStorage()` persiste o array atualizado

**Diferença em relação a `updateItemCheckbox`:** aqui o `.filter()` é usado para excluir (retorna todos exceto o deletado), enquanto nos métodos de update ele é usado para encontrar e mutar.

#### `deleteAllItems()`

```typescript
public deleteAllItems() {
  Swal.fire({
    title: 'Tem certeza?',
    text: 'Você não poderá reverter isso!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, delete tudo',
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem(ELocalStorage.MY_LIST);
      return this.#setListItems.set(this.#parseItems());
    }
  });
}
```

Exibe um diálogo de confirmação e, se confirmado, remove todos os itens da lista.

**Passo a passo:**
1. `Swal.fire({...})` abre o modal de confirmação
2. Se confirmado, `localStorage.removeItem(ELocalStorage.MY_LIST)` remove completamente a chave do `localStorage`
3. `this.#setListItems.set(this.#parseItems())` atualiza o signal: como a chave foi removida, `#parseItems()` retorna `[]` (array vazio pelo fallback `|| '[]'`), zerando a lista na tela

**Por que `removeItem` em vez de `setItem` com array vazio?**
Remove a chave completamente, deixando o `localStorage` limpo, em vez de manter uma entrada com valor `'[]'`.

---

## InputAddItemComponent

**Arquivo:** `src/app/modules/to-do-list/components/input-add-item/input-add-item.component.ts`

Componente de apresentação responsável por capturar a entrada do usuário e emitir novos itens ao pai.

---

### Injeção de dependência

#### `#cdr`

```typescript
#cdr = inject(ChangeDetectorRef);
```

Injeta o serviço `ChangeDetectorRef` usando a função `inject()` — forma moderna de injeção de dependência do Angular 17, usada fora do construtor.

`ChangeDetectorRef` dá acesso manual ao ciclo de detecção de mudanças do Angular. É necessário aqui para garantir que o Angular processe as atualizações do DOM antes de manipular o campo de texto diretamente via `nativeElement`.

---

### Decorators de propriedade

#### `@ViewChild('inputText')`

```typescript
@ViewChild('inputText') public inputText!: ElementRef;
```

Decorator que cria uma referência ao elemento DOM marcado com `#inputText` no template. Dá acesso direto ao elemento HTML real, permitindo:
- Limpar o campo: `inputText.nativeElement.value = ''`
- Recolocar o foco: `inputText.nativeElement.focus()`

O `!` (non-null assertion) informa ao TypeScript que essa propriedade sempre terá um valor quando for usada — o Angular garante isso após a inicialização do componente.

#### `@Input({ required: true })`

```typescript
@Input({ required: true }) public inputListItems: IListItems[] = [];
```

Decorator que declara uma propriedade de entrada (dado que vem do componente pai). O objeto `{ required: true }` instrui o Angular a emitir um erro de compilação se o pai não passar esse input — evitando uso acidental do componente sem os dados necessários.

O valor padrão `= []` é necessário para satisfazer o TypeScript (mesmo com `required: true`, a propriedade precisa de um valor inicial para tipagem estática).

#### `@Output()`

```typescript
@Output() public outputAddListItem = new EventEmitter<IListItems>();
```

Decorator que declara um evento de saída (dado que vai do filho para o pai). `EventEmitter<IListItems>` define o tipo do dado emitido — quando `.emit()` for chamado, o pai receberá um objeto do tipo `IListItems`.

O nome `outputAddListItem` segue a convenção `output` + nome descritivo para diferenciar visualmente outputs de inputs no código.

---

### Métodos

#### `focusAndAddItem(value: string)`

```typescript
public focusAndAddItem(value: string) {
  if (value) {
    this.#cdr.detectChanges();
    this.inputText.nativeElement.value = '';

    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const id = `ID ${timestamp}`;

    this.outputAddListItem.emit({
      id,
      checked: false,
      value,
    });

    return this.inputText.nativeElement.focus();
  }
}
```

Valida a entrada, cria um novo item e o emite para o componente pai.

**Parâmetro:** `value` — texto digitado pelo usuário, lido diretamente do `nativeElement` via template reference.

**Passo a passo:**
1. `if (value)` — guarda: não executa nada se o campo estiver vazio (string vazia é falsy em JavaScript)
2. `this.#cdr.detectChanges()` — força o Angular a processar mudanças pendentes antes da manipulação direta do DOM
3. `this.inputText.nativeElement.value = ''` — limpa o campo de texto manipulando o DOM diretamente
4. `new Date().getTime()` — gera um timestamp em milissegundos (ex: `1711900000000`) usado como ID único
5. `this.outputAddListItem.emit({...})` — emite o novo item completo para o `ListComponent`, que irá adicioná-lo à lista
6. `this.inputText.nativeElement.focus()` — recoloca o foco no campo para que o usuário possa adicionar o próximo item sem precisar clicar novamente

**Por que timestamp como ID?**
Timestamps em milissegundos são praticamente únicos para uma aplicação local simples — a chance de dois itens serem adicionados no mesmo milissegundo é ínfima. Evita a necessidade de uma biblioteca de geração de UUID.

---

## InputListItemComponent

**Arquivo:** `src/app/modules/to-do-list/components/input-list-item/input-list-item.component.ts`

Componente de apresentação puro. Não possui lógica de negócio — apenas recebe dados e delega eventos ao pai.

---

### Decorator de propriedade

#### `@Input({ required: true })`

```typescript
@Input({ required: true }) public inputListItems: IListItems[] = [];
```

Recebe o array de itens que este componente deve renderizar. O Angular renderizará o componente duas vezes na tela principal — uma para os itens pendentes e outra para os concluídos — cada instância recebendo um array diferente via este input.

---

### Outputs e seus métodos

Cada `@Output` é acompanhado de um método que apenas chama `.emit()`, servindo de intermediário entre o evento do template e o componente pai.

#### `outputUpdateItemCheckbox` / `updateItemCheckbox`

```typescript
@Output() public outputUpdateItemCheckbox = new EventEmitter<{
  id: string;
  checked: boolean;
}>();

public updateItemCheckbox(id: string, checked: boolean) {
  return this.outputUpdateItemCheckbox.emit({ id, checked });
}
```

Chamado quando o usuário marca ou desmarca o checkbox de um item. Recebe `id` e `checked` separadamente (vindo de dois template references diferentes no HTML) e os agrupa em um único objeto para emitir ao pai.

#### `outputUpdateItemText` / `updateItemText`

```typescript
@Output() public outputUpdateItemText = new EventEmitter<{
  id: string;
  value: string;
}>();

public updateItemText(id: string, value: string) {
  return this.outputUpdateItemText.emit({ id, value });
}
```

Chamado a cada tecla digitada no campo de texto de um item (evento `(input)`). Emite o `id` do item e o novo `value` para que o `ListComponent` possa atualizar o estado.

#### `outputDeleteItem` / `deleteItem`

```typescript
@Output() public outputDeleteItem = new EventEmitter<string>();

public deleteItem(id: string) {
  return this.outputDeleteItem.emit(id);
}
```

Chamado quando o usuário clica no botão de deletar de um item. Emite apenas o `id` como `string` simples (sem objeto), pois é a única informação necessária para identificar e remover o item no pai.

---

## Padrões TypeScript utilizados no projeto

| Padrão | Onde é usado | Benefício |
| --- | --- | --- |
| **Campos privados** (`#`) | `#setListItems`, `#cdr`, `#parseItems`, `#updateLocalStorage` | Encapsulamento real — impossível de acessar fora da classe |
| **Generics** | `signal<IListItems[]>`, `EventEmitter<IListItems>` | Tipagem precisa do conteúdo de signals e eventos |
| **Union types literais** | `'pending' \| 'completed'` | Restringe o parâmetro a valores específicos em tempo de compilação |
| **Non-null assertion** (`!`) | `inputText!: ElementRef` | Informa ao TypeScript que o valor nunca será nulo |
| **Injeção funcional** (`inject()`) | `inject(ChangeDetectorRef)` | Alternativa moderna ao construtor para injeção de dependência |
| **Readonly signal** | `.asReadonly()` | Expõe estado sem permitir mutação externa |
| **Required inputs** | `@Input({ required: true })` | Garante em compilação que o pai sempre passe o dado |
