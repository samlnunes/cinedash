# Arquitetura do CineDash

Este documento explica as decisões técnicas do projeto e como a aplicação está organizada para crescer de forma sustentável.

---

## O que é o CineDash

O CineDash é um dashboard de curadoria e descoberta de filmes. Curadores usam a aplicação para explorar o catálogo da API do TMDB, filtrar por gênero e nota, manter uma lista de filmes (watchlist) e ver detalhes de cada filme. Como não há backend próprio, a autenticação é simulada no front-end e a persistência de sessão e da lista é feita no navegador (localStorage + Zustand persist).

---

## Stack tecnológica

A stack foi escolhida em alinhamento ao desafio e à manutenção a longo prazo:

- **React 19 + TypeScript (strict) + Vite** — base da aplicação, com tipagem forte e build rápido.
- **TanStack Query** — todo dado que vem do servidor (TMDB) é tratado como "server state": cache, refetch e invalidação ficam centralizados.
- **Zustand** — estado de interação do usuário (sessão, filtros, aba atual, watchlist, tema) com middleware `persist` para sobreviver ao reload.
- **TanStack Router** — roteamento com file-based routing: cada arquivo em `src/pages` vira rota, o que facilita ver a árvore de rotas e usar guards (ex.: rotas protegidas).
- **Shadcn/ui + TailwindCSS** — componentes acessíveis e customizáveis, com design tokens e tema dark/light.
- **React Hook Form + Zod** — formulários (login) com validação declarativa e boa performance.
- **Vitest + React Testing Library** — testes focados em regras de negócio e comportamento, não em detalhes de implementação.

---

## Estrutura de pastas (Feature-Sliced Design)

O projeto segue **Feature-Sliced Design (FSD)**. A ideia é separar o código em camadas que só dependem de camadas "mais baixas", evitando acoplamento e permitindo que cada parte do produto evolua de forma isolada.

A estrutura principal é:

- **`app/`** — Bootstrap da aplicação: providers (QueryClient, Router), estilos globais e design tokens. Não contém lógica de negócio.
- **`pages/`** — Rotas. Cada arquivo aqui vira uma rota graças ao TanStack Router (file-based). Ex.: `login.tsx` → `/login`, `_protected/dashboard.tsx` → `/dashboard`. O prefixo `_protected` agrupa rotas que exigem autenticação.
- **`widgets/`** — Blocos de UI que combinam várias features e entities. Ex.: o header autenticado (logo, nav, tema) e o dashboard de descoberta (filtros + grid + paginação).
- **`features/`** — Casos de uso e interações: login, descoberta (filtros, abas, paginação), watchlist (adicionar/remover, ordenação), tema (dark/light). Aqui ficam stores (Zustand), schemas (Zod), hooks de query e componentes de formulário/ação.
- **`entities/`** — Domínio "puro": tipos (Movie, Genre), chamadas à API TMDB e componentes de apresentação (ex.: card de filme, skeleton). Sem regras de fluxo de tela.
- **`shared/`** — Infraestrutura e utilitários sem regra de negócio: cliente HTTP do TMDB, componentes base (Button, Input, Card), hooks reutilizáveis (ex.: debounce), `cn()` para classes CSS.

A regra de dependência é: **app → pages → widgets → features → entities → shared**. Nenhuma camada importa de uma camada "acima". Dentro da mesma camada, um slice não importa outro (ex.: `features/auth` não importa `features/watchlist`). Assim evitamos dependências circulares e mantemos cada feature desacoplada.

---

## Public API (barrels)

Cada módulo (slice) expõe um `index.ts` com o que é público. Quem usa de fora deve importar só desse barrel.

**Exemplo permitido:**

```ts
import { useAuthStore, LoginForm } from '@/features/auth'
import { MovieCard, MovieCardSkeleton } from '@/entities/movie'
import { DiscoveryDashboard } from '@/widgets/discovery-dashboard'
```

**Evitado:** importar arquivos internos de outro slice (ex.: `@/features/auth/model/auth.store`). Isso quebra o encapsulamento e dificulta refatorar a estrutura interna de uma feature.

Dentro do próprio slice, os arquivos podem se importar por caminhos relativos normalmente.

---

## Decisões técnicas em detalhe

### Autenticação simulada

Como não há backend, o login não chama nenhum servidor. O formulário é validado com Zod (e-mail válido, senha com mais de 6 caracteres). Ao "logar", geramos um token fictício com `crypto.randomUUID()` e guardamos a sessão no Zustand com o middleware `persist` (chave no `localStorage`). Assim, ao recarregar a página, o usuário continua logado.

O acesso às rotas protegidas é bloqueado no **router**: no `beforeLoad` das rotas under `_protected`, verificamos `useAuthStore.getState().isAuthenticated`. Se não estiver autenticado, redirecionamos para `/login`. Isso acontece antes do render, então o usuário não chega a ver conteúdo restrito.

### Server state vs client state

- **TanStack Query** cuida de tudo que vem da API TMDB: listagens (trending, popular, busca), gêneros, detalhes do filme. Configuramos um `staleTime` global (ex.: 5 minutos) e usamos `placeholderData` onde faz sentido para transições suaves (ex.: ao trocar de página na paginação).
- **Zustand** cuida do estado de interação: sessão, aba ativa (trending/popular), filtros (gênero, ano, nota), número da página, itens da watchlist e tema (dark/light). Tudo que precisa persistir entre reloads usa o middleware `persist`.

Essa divisão evita misturar "dados do servidor" com "estado da UI" e deixa claro onde mexer ao mudar cache ou comportamento de tela.

### Estratégia de cache (TanStack Query)

As **query keys** são definidas em um único lugar (`entities/movie/api/movie.queries.ts`), via factories como `movieKeys` e `movieQueries`. Todas as queries e prefetches usam essas factories, o que mantém o cache consistente e facilita invalidação.

Exemplos de keys:

- `movieKeys.genres()` → lista de gêneros
- `movieKeys.discovery(params)` → lista de filmes (tab, page, query, filtros)

**Prefetch:** assim que temos os dados da página atual, prefetchamos a próxima página (`usePrefetchNextPage`), para que ao clicar em "próxima" a resposta já esteja em cache quando possível.


### Debounce na busca

O campo de busca chama a API ao digitar. Para não disparar uma requisição a cada tecla, usamos o hook `useDebouncedValue` (em `shared/hooks`) com atraso de 400 ms. Só o valor já "estabilizado" é usado na query, reduzindo chamadas e carga no TMDB.

### Shadcn/ui

Os componentes de UI base (Button, Input, Label, Card, etc.) ficam em `shared/ui`. O `components.json` do Shadcn está configurado para que novos componentes adicionados com `npx shadcn add` sejam instalados nessa pasta, mantendo o padrão do projeto.

### Tema dark/light

O tema é um slice em `features/theme`: store Zustand com `persist` (preferência no `localStorage`), leitura de `prefers-color-scheme` para valor inicial e aplicação da classe no `document.documentElement`. O toggle fica no header (widget `protected-header`).

---

## Testes

Os testes focam em **regras de negócio e lógica**, não em snapshots de UI:

- **login.schema.test.ts** — validação Zod do formulário de login
- **auth.store.test.ts** — login, logout e geração do token
- **discovery.store.test.ts** — filtros, paginação e reset
- **watchlist.store** — adicionar/remover e ordenação
- **theme.store** — alternar tema e persistência
- **use-debounced-value.test.ts** — atraso e atualização do valor

Para rodar: `pnpm test` na pasta `cinedash`.

---

## Resumo

A arquitetura do CineDash usa FSD para separar responsabilidades, TanStack Query para server state e Zustand para client state e persistência. Autenticação e watchlist são simuladas no front com persist no localStorage, e o roteamento com guards garante que apenas usuários autenticados acessem o dashboard, a watchlist e os detalhes do filme.
