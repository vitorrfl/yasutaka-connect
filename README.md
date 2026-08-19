# Yasutaka Connect

Controle de estoque e vendas. Next.js 16 (App Router) + Firestore.

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha com a config do Firebase
npm run dev                  # http://localhost:3000
```

As variáveis saem do Console do Firebase → **Configurações do projeto → Geral → Seus apps → Web → Configuração do SDK → Config**.

Não use a chave da **conta de serviço**: este projeto usa apenas o SDK cliente, e aquela chave ignora as regras do Firestore.

> **Segurança.** O `firestore.rules` hoje é `allow read, write: if true` — escolha consciente para ferramenta interna, documentada no próprio arquivo. Na prática, quem tiver a config tem leitura e escrita no banco inteiro. Se o app for exposto publicamente, adicione Firebase Auth antes.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run dev:mobile` | Build + serve na rede local — **use este para testar no celular** |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build |
| `npm run lint` | ESLint |

### Testando no celular

Use `npm run dev:mobile` e acesse `http://<ip-da-máquina>:3000`.

O bundle de `next dev` **não executa** no Safari 16.6 de um iPhone 8 — a página carrega, os links navegam, mas nenhum botão responde (o JavaScript não roda). Causa não identificada; note que 16.6 está **acima** do piso do Next, que é 16.4. Já investigados e descartados: versão de navegador, `Object.hasOwn` / `.at()` / `findLast` (todos existem desde o Safari 15.4) e `Promise.withResolvers` (o Next usa shim próprio). O build de produção funciona normalmente.

## Arquitetura

Camadas, de dentro pra fora:

```
src/domain/          entidades e interfaces de repositório (sem Firebase)
src/services/        regras de negócio
src/infrastructure/  implementações Firestore dos repositórios
src/lib/container.ts monta e injeta as dependências
src/app/             rotas (Server Components + Server Actions)
src/components/      UI compartilhada
```

O domínio não conhece o Firebase — troca-se a camada de infraestrutura sem tocar nas regras de negócio.

**Fontes únicas** que devem ser reusadas em vez de reimplementadas:

- `components/ui/icons.tsx` — todos os ícones, a partir de um `<Svg>` base
- `lib/navigation.ts` — o menu; `Sidebar` e `TabBar` leem daqui
- `components/ui/Button.tsx` — todo elemento clicável (`buttonClasses()` para `<Link>`)
- `lib/money.ts` — valores em centavos, nunca float

## Firestore

As regras vivem em `firestore.rules` e o projeto está fixado no `.firebaserc`:

```bash
firebase deploy --only firestore:rules
```

## Convenções de UI

Estão no [`AGENTS.md`](./AGENTS.md) e valem para qualquer alteração: animar entrada **e** saída, X que rotaciona 45°, lupa expansível, dupla confirmação em ação destrutiva, e a regra de cor dos botões (navy em repouso, azul na interação).
