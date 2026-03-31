# Lista de Tarefas

Aplicação de lista de tarefas (To-Do List) desenvolvida com **Angular 17**, utilizando componentes standalone, gerenciamento de estado com a Signals API e persistência de dados via `localStorage`.

---

## Funcionalidades

- Adicionar novas tarefas
- Marcar tarefas como concluídas
- Editar o texto de uma tarefa
- Excluir uma tarefa (com confirmação)
- Excluir todas as tarefas (com confirmação)
- Separação visual entre tarefas pendentes e concluídas
- Dados persistidos no `localStorage`

---

## Tecnologias e Libs Utilizadas

| Lib                                           | Versão | Descrição                                         |
| --------------------------------------------- | ------ | ------------------------------------------------- |
| [Angular](https://angular.io/)                | 17     | Framework principal                               |
| [TypeScript](https://www.typescriptlang.org/) | 5.2    | Linguagem de desenvolvimento                      |
| [SweetAlert2](https://sweetalert2.github.io/) | latest | Diálogos de confirmação para exclusões            |
| [RxJS](https://rxjs.dev/)                     | 7.8    | Incluído pelo Angular (não utilizado diretamente) |

---

## Instalação

### Pré-requisitos

- Node.js 18+
- Angular CLI 17+

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/lista-tarefas-final.git
cd lista-tarefas-final

# 2. Instale as dependências do projeto
npm install

# 3. Instale o SweetAlert2 (necessário — não incluído automaticamente)
npm install sweetalert2

# 4. Inicie o servidor de desenvolvimento
ng serve
```

Acesse em `http://localhost:4200`.

---

## Scripts Disponíveis

```bash
ng serve       # Inicia o servidor de desenvolvimento
ng build       # Gera o build de produção
ng test        # Executa os testes unitários
```

---

## Documentação

A pasta [`documentacao/`](documentacao/) contém a documentação técnica do projeto.

| Arquivo                                         | Conteúdo                                                                                           |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`arquitetura.md`](documentacao/arquitetura.md) | Estrutura de pastas, componentes, comunicação, modelo de dados, rotas, estado e padrões utilizados |
| [`arquivos.md`](documentacao/arquivos.md)       | Explicação detalhada de cada arquivo `.html`, `.ts` e `.scss` do projeto                           |
| [`typescript.md`](documentacao/typescript.md)   | Detalhamento de cada método, função, interface, enum e decorator dos arquivos `.ts`                |

---

## Estrutura do Projeto

```
├── 📁 .angular
├── 📁 documentacao
│   └── 📝 arquitetura.md
├── 📁 src
│   ├── 📁 app
│   │   ├── 📁 modules
│   │   │   └── 📁 to-do-list
│   │   │       ├── 📁 components
│   │   │       │   ├── 📁 input-add-item
│   │   │       │   │   ├── 🌐 input-add-item.component.html
│   │   │       │   │   ├── 🎨 input-add-item.component.scss
│   │   │       │   │   ├── 📄 input-add-item.component.spec.ts
│   │   │       │   │   └── 📄 input-add-item.component.ts
│   │   │       │   └── 📁 input-list-item
│   │   │       │       ├── 🌐 input-list-item.component.html
│   │   │       │       ├── 🎨 input-list-item.component.scss
│   │   │       │       ├── 📄 input-list-item.component.spec.ts
│   │   │       │       └── 📄 input-list-item.component.ts
│   │   │       ├── 📁 enum
│   │   │       │   └── 📄 ELocalStorage.enum.ts
│   │   │       ├── 📁 interface
│   │   │       │   └── 📄 IListItems.interface.ts
│   │   │       └── 📁 pages
│   │   │           └── 📁 list
│   │   │               ├── 🌐 list.component.html
│   │   │               ├── 🎨 list.component.scss
│   │   │               ├── 📄 list.component.spec.ts
│   │   │               └── 📄 list.component.ts
│   │   ├── 📄 app.component.ts
│   │   ├── 📄 app.config.ts
│   │   └── 📄 app.routes.ts
│   ├── 📁 assets
│   │   ├── 📁 icons
│   │   │   ├── 🖼️ add.svg
│   │   │   └── 🖼️ delete.svg
│   │   ├── 📁 img
│   │   │   └── 🖼️ task-list-null.png
│   │   └── ⚙️ .gitkeep
│   ├── 📁 scss
│   │   ├── 📁 base
│   │   │   ├── 🎨 _index.scss
│   │   │   └── 🎨 _reset.scss
│   │   ├── 📁 component
│   │   │   ├── 🎨 _button.scss
│   │   │   ├── 🎨 _index.scss
│   │   │   └── 🎨 _input-label-text.scss
│   │   ├── 📁 layout
│   │   │   ├── 🎨 _container.scss
│   │   │   └── 🎨 _index.scss
│   │   ├── 📁 theme
│   │   │   ├── 🎨 _index.scss
│   │   │   └── 🎨 _variables.scss
│   │   └── 🎨 _index.scss
│   ├── 📄 favicon.ico
│   ├── 🌐 index.html
│   ├── 📄 main.ts
│   └── 🎨 styles.scss
├── ⚙️ .editorconfig
├── ⚙️ .gitignore
├── 📝 README.md
├── ⚙️ angular.json
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── ⚙️ tsconfig.app.json
├── ⚙️ tsconfig.json
└── ⚙️ tsconfig.spec.json
```
