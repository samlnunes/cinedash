# Como rodar o CineDash

Este arquivo explica o que é o projeto, o que você precisa ter instalado e o passo a passo para rodar a aplicação no seu ambiente.

---

## O que é o CineDash

O **CineDash** é um dashboard de curadoria e descoberta de filmes feito para o desafio técnico de Frontend React. A ideia é simular um produto interno em que curadores de cinema exploram o catálogo da [API do TMDB](https://developer.themoviedb.org/docs), aplicam filtros, mantêm uma lista de filmes (watchlist) e acessam detalhes de cada filme.

**Funcionalidades principais:**

- **Login (simulado)** — Tela de login com validação (e-mail e senha). Não há backend; o “token” é gerado no front e a sessão é persistida no navegador. Ao recarregar a página, o usuário continua logado.
- **Dashboard de descoberta** — Listagem de filmes (trending / popular) com busca, filtros (gênero, ano, nota mínima) e paginação. A busca usa debounce para não sobrecarregar a API.
- **Minha lista (watchlist)** — Adicionar e remover filmes da lista, com tabela ordenável (título, gênero, rating). A lista persiste no navegador após reload.
- **Detalhes do filme** — Página por filme (`/movie/:id`) com sinopse, elenco, nota e opção de adicionar/remover da watchlist.
- **Tema dark/light** — Alternância de tema com preferência salva no navegador.

O projeto foi desenvolvido com **Feature-Sliced Design (FSD)**, React 19, TypeScript, Vite, TanStack Query, Zustand, TanStack Router e Shadcn/ui. Detalhes técnicos estão no [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **pnpm** (gerenciador de pacotes usado no projeto)

Se você não tiver o pnpm instalado:

```bash
npm install -g pnpm
```

---

## Chave de API do TMDB

A aplicação consome a API do TMDB. Você precisa de um **token de acesso (API Read Access Token)**.

1. Acesse [The Movie Database](https://www.themoviedb.org/) e crie uma conta (ou faça login).
2. Vá em **Configurações** → **API** (no menu da sua conta).
3. Solicite uma API Key (tipo “Developer”). Após aprovação, na página da API você verá a opção **API Read Access Token**.
4. Copie o **API Read Access Token** (não use a “API Key” antiga). Esse valor será usado na variável `VITE_TMDB_API_TOKEN`.

Documentação oficial: [TMDB – Getting Started](https://developer.themoviedb.org/docs/getting-started).

---

## Configuração do ambiente

Na raiz da pasta do projeto **cinedash** existe um arquivo `.env.example`. Copie-o para `.env` e preencha o token:

```bash
cd cinedash
cp .env.example .env
```

Edite o `.env` e preencha pelo menos o token:

```env
VITE_TMDB_API_TOKEN=seu_token_aqui
VITE_TMDB_API_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
```

Em geral não é necessário alterar `VITE_TMDB_API_URL` e `VITE_TMDB_IMAGE_BASE`; os valores acima já funcionam. O **obrigatório** é definir `VITE_TMDB_API_TOKEN` com o API Read Access Token do TMDB.

---

## Instalação

Na pasta **cinedash**:

```bash
pnpm install
```

Isso instala todas as dependências listadas no `package.json`.

---

## Como rodar o projeto

### Ambiente de desenvolvimento

```bash
pnpm dev
```

Isso sobe o servidor de desenvolvimento (Vite), em geral na porta **3000**. Abra o navegador em:

**http://localhost:3000**

- A primeira vez você será redirecionado para a tela de **login**. Use qualquer e-mail válido e uma senha com mais de 6 caracteres (não há validação no “servidor”, só no front).
- Depois do login você pode acessar o **dashboard**, a **watchlist** e os **detalhes** dos filmes.

### Build para produção

```bash
pnpm build
```

O build de produção é gerado na pasta `dist/`. Para visualizar o build localmente:

```bash
pnpm preview
```

### Testes

```bash
pnpm test
```

Os testes são executados com Vitest (modo run, sem watch). Eles cobrem validação de formulários, stores (auth, discovery, watchlist, theme) e o hook de debounce.

---

## Resumo dos comandos

| Comando       | Descrição                          |
|---------------|------------------------------------|
| `pnpm install`| Instala as dependências            |
| `pnpm dev`    | Sobe o app em modo desenvolvimento |
| `pnpm build`  | Gera o build de produção           |
| `pnpm preview`| Serve o build de produção localmente |
| `pnpm test`   | Roda os testes automatizados      |

---

## Problemas comuns

- **Página em branco ou erros de API:** confira se o `.env` existe, se `VITE_TMDB_API_TOKEN` está preenchido e se o token é o **API Read Access Token** (não a API Key antiga). Reinicie o `pnpm dev` após alterar o `.env`.
- **Rotas protegidas redirecionando para login:** o login é simulado e a sessão fica no `localStorage`. Se você limpar os dados do site ou usar aba anônima, precisará fazer login de novo.
- **Imagens dos filmes não aparecem:** a URL base das imagens vem de `VITE_TMDB_IMAGE_BASE`. Com o valor padrão `https://image.tmdb.org/t/p` e um token válido, as imagens devem carregar. Verifique se não há bloqueio de rede ou extensão no navegador.

Para mais detalhes sobre a estrutura do código e as decisões técnicas, veja o [ARCHITECTURE.md](./ARCHITECTURE.md).
