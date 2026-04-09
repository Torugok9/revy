# Revy — Assistente Mecânico I.A.
## Planejamento Completo da Funcionalidade

---

## 1. Visão Geral

O Assistente Mecânico é um chat integrado ao app Revy que permite ao usuário tirar dúvidas sobre seu veículo com uma I.A. especializada. O diferencial é o **contexto do veículo** — marca, modelo, ano, km e histórico de manutenções — injetado automaticamente, gerando respostas personalizadas que nenhum chatbot genérico consegue oferecer.

**Objetivo:** Transformar o Revy de um "caderninho digital" em um consultor automotivo de bolso.

---

## 2. Banco de Dados

### 2.1 Tabelas Criadas

| Tabela | Descrição |
|---|---|
| `chat_sessions` | Sessões de conversa entre usuário e assistente |
| `chat_messages` | Mensagens individuais dentro de cada sessão |

**`chat_sessions`**

| Coluna | Tipo | Detalhes |
|---|---|---|
| `id` | UUID (PK) | `gen_random_uuid()` |
| `user_id` | UUID (FK → auth.users) | ON DELETE CASCADE |
| `vehicle_id` | UUID (FK → vehicles) | ON DELETE CASCADE |
| `title` | text (nullable) | Gerado automaticamente pela I.A. na 1ª mensagem |
| `is_active` | boolean | Default `true`. Para arquivar sem deletar |
| `created_at` | timestamptz | `now()` |
| `updated_at` | timestamptz | `now()`, trigger automático |

**`chat_messages`**

| Coluna | Tipo | Detalhes |
|---|---|---|
| `id` | UUID (PK) | `gen_random_uuid()` |
| `session_id` | UUID (FK → chat_sessions) | ON DELETE CASCADE |
| `role` | text | CHECK: `'user'` ou `'assistant'` |
| `content` | text | Texto da mensagem |
| `tokens_used` | integer (nullable) | Preenchido pela Edge Function na resposta |
| `created_at` | timestamptz | `now()` |

### 2.2 Tabela Alterada

**`plans`** — Nova coluna:

| Coluna | Tipo | Valores |
|---|---|---|
| `max_chat_messages_month` | integer (nullable) | Free: 10, Premium: 200, Fleet: 500, null = ilimitado |

### 2.3 Indexes

| Index | Tabela | Colunas | Tipo |
|---|---|---|---|
| `idx_chat_sessions_user_id` | chat_sessions | `user_id` | Regular |
| `idx_chat_messages_session_created` | chat_messages | `session_id, created_at ASC` | Composto |
| `idx_chat_messages_user_monthly` | chat_messages | `created_at` WHERE role = 'user' | Parcial |

### 2.4 Trigger

| Trigger | Tabela | Function |
|---|---|---|
| `update_chat_sessions_updated_at` | chat_sessions | `update_updated_at()` (existente) |

### 2.5 RLS (Row Level Security)

**`chat_sessions`**

| Operação | Regra |
|---|---|
| SELECT | `user_id = auth.uid()` |
| INSERT | `user_id = auth.uid()` AND veículo pertence ao usuário |
| UPDATE | `user_id = auth.uid()` |
| DELETE | `user_id = auth.uid()` |

**`chat_messages`**

| Operação | Regra |
|---|---|
| SELECT | Sessão pertence ao usuário |
| INSERT | `role = 'user'` AND sessão pertence ao usuário. Respostas (`role = 'assistant'`) são inseridas via `service_role` pela Edge Function |
| DELETE | Sessão pertence ao usuário |

### 2.6 Realtime

Tabela `chat_messages` adicionada à publication `supabase_realtime` para entrega de mensagens via websocket.

### 2.7 Functions (RPC)

| Function | Input | Output | Uso |
|---|---|---|---|
| `get_chat_context(p_vehicle_id)` | UUID do veículo | JSONB com dados do veículo + últimas 10 manutenções | Edge Function monta o prompt com contexto |
| `count_user_messages_this_month(p_user_id)` | UUID do usuário | integer | Rate limiting por plano |
| `get_user_plan(p_user_id)` | UUID do usuário | Plano do usuário (já existente) | Buscar `max_chat_messages_month` |

---

## 3. Edge Function

### 3.1 Function: `chat`

**Endpoint:** `POST /functions/v1/chat`

**Payload de entrada:**
```json
{
  "session_id": "uuid | null",
  "vehicle_id": "uuid",
  "message": "string"
}
```

**Payload de saída (sucesso):**
```json
{
  "session_id": "uuid",
  "message": {
    "id": "uuid",
    "role": "assistant",
    "content": "string",
    "created_at": "timestamptz"
  }
}
```

**Payload de saída (limite atingido — 429):**
```json
{
  "error": "Limite de mensagens atingido",
  "code": "RATE_LIMIT",
  "limit": 10,
  "used": 10
}
```

### 3.2 Fluxo Interno

```
1. Autenticação (JWT)
2. Validação do body (vehicle_id + message obrigatórios)
3. Verificar propriedade do veículo
4. Rate limiting (count_user_messages_this_month vs max_chat_messages_month)
5. Criar sessão (se session_id = null) ou validar sessão existente
6. Salvar mensagem do usuário (service_role)
7. Buscar contexto do veículo (get_chat_context)
8. Buscar histórico da sessão (últimas 20 mensagens)
9. Montar system prompt + contexto dinâmico
10. Chamar provider de I.A. (via ai-provider.ts)
11. Salvar resposta do assistente (service_role + tokens_used)
12. Gerar título da sessão (fire-and-forget, só na 1ª mensagem)
13. Retornar resposta
```

### 3.3 Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.ts` | Fluxo principal: auth, rate limit, CRUD mensagens, orquestração |
| `ai-provider.ts` | Abstração do provider I.A. — adapters para OpenAI e Anthropic |

### 3.4 Variáveis de Ambiente (Secrets)

| Variável | Exemplo | Descrição |
|---|---|---|
| `AI_PROVIDER_TYPE` | `openai` | `"openai"` ou `"anthropic"` |
| `AI_PROVIDER_URL` | `https://api.openai.com/v1/chat/completions` | Endpoint da API |
| `AI_PROVIDER_KEY` | `sk-...` | API key do provider |
| `AI_MODEL` | `gpt-4o-mini` | Nome do modelo |

### 3.5 System Prompt — Resumo

**Persona:** Mecânico brasileiro, 20+ anos de experiência, nome "Revy".

**Regras principais:**
- Português brasileiro, linguagem acessível
- Máximo 3-4 parágrafos por resposta
- Nunca diagnóstico com certeza absoluta
- Sempre recomendar mecânico real para problemas sérios
- Não recomendar marcas de peças, não sugerir gambiarras
- Situação de risco → instrução para parar o carro + guincho

**Contexto injetado:** Marca, modelo, ano, km, cor, placa, observações, últimas 10 manutenções formatadas.

---

## 4. Telas e Navegação

### 4.1 Novas Rotas (Expo Router)

| Rota | Descrição |
|---|---|
| `src/app/chat/index.tsx` | Lista de sessões de conversa do veículo |
| `src/app/chat/[sessionId].tsx` | Tela de conversa (chat) |

### 4.2 Ponto de Entrada

Na tela `vehicle/[id].tsx` (detalhe do veículo), adicionar um **botão ou card** "Assistente Mecânico" que navega para `chat/index?vehicleId=UUID`. Alternativa: ícone de chat no header da tela de detalhe.

### 4.3 Fluxo do Usuário

```
vehicle/[id].tsx
  └── Toca em "Assistente Mecânico"
        └── chat/index.tsx (lista de conversas do veículo)
              ├── Toca em conversa existente → chat/[sessionId].tsx
              └── Toca em "Nova conversa" → chat/new.tsx (session_id=null)
                    └── 1ª mensagem cria a sessão via Edge Function
                          └── Redireciona silenciosamente para chat/[sessionId].tsx
```

---

## 5. Componentes

### 5.1 Telas

| Componente | Arquivo | Descrição |
|---|---|---|
| `ChatSessionsList` | `chat/index.tsx` | Lista de conversas. FlatList com `ChatSessionCard`. FAB para nova conversa. Empty state quando não há sessões. |
| `ChatConversation` | `chat/[sessionId].tsx` | Tela de chat. FlatList invertida com `ChatBubble`. `ChatInput` fixo na parte inferior. Header com título da sessão. |

### 5.2 Componentes Reutilizáveis

| Componente | Descrição |
|---|---|
| `ChatBubble` | Bolha de mensagem. Props: `role`, `content`, `createdAt`. Alinhamento e estilo varia por role. Renderiza markdown básico (negrito, itálico, listas) no conteúdo do assistente. |
| `ChatInput` | Barra inferior fixa. TextInput multilinha + botão de enviar. Desabilita durante carregamento. Desabilita quando limite atingido. |
| `ChatTypingIndicator` | Animação de "..." pulsante exibida enquanto aguarda resposta da I.A. Dentro de uma bolha do assistente. |
| `ChatSessionCard` | Card na lista de sessões. Exibe: título (ou "Nova conversa"), data formatada ("há 2 dias"), preview da última mensagem (truncada em ~80 chars). |
| `ChatLimitBanner` | Banner de limite de mensagens. Mostra uso atual vs limite. Botão "Fazer upgrade" → tela de planos. Aparece no topo do chat ou substitui o `ChatInput` quando limite é atingido. |
| `ChatEmptyState` | Exibido quando não há mensagens na sessão. Sugestões de perguntas clicáveis (ex: "O que significam as manutenções do meu carro?", "Quando devo trocar o óleo?", "Meu carro está fazendo um barulho estranho"). |
| `AssistantAvatar` | Avatar pequeno do Revy ao lado das bolhas do assistente. Ícone do app em miniatura ou ícone de robô/chave inglesa estilizado. |

---

## 6. Hooks

| Hook | Responsabilidade |
|---|---|
| `useChat(sessionId, vehicleId)` | Hook principal. Gerencia: estado das mensagens, envio (optimistic UI), chamada à Edge Function, subscription Realtime no `chat_messages`, deduplicação de mensagens (Realtime vs HTTP response), loading e error states. |
| `useChatSessions(vehicleId)` | Busca e retorna as sessões do veículo. Select em `chat_sessions` com ordering por `updated_at DESC`. Usado na tela de listagem. |
| `useChatLimit(userId)` | Chama `count_user_messages_this_month` via RPC, busca `max_chat_messages_month` do plano. Retorna `{ used, limit, remaining, isAtLimit }`. |

---

## 7. Estilo da UI

### 7.1 Design System (herdado do Revy)

| Token | Valor |
|---|---|
| Fundo principal | `#000000` (preto) |
| Accent primário | `#DC2626` (Guards Red) |
| Tipografia | DM Sans (SemiBold para títulos, Regular para body) |
| Tema | Dark mode como padrão |
| Estética | Premium automotiva (inspiração Porsche/Audi) |

### 7.2 Cores do Chat

| Elemento | Cor | Opacidade |
|---|---|---|
| Bolha do usuário | `#DC2626` (Guards Red) | 100% |
| Texto da bolha do usuário | `#FFFFFF` | 100% |
| Bolha do assistente | `#1C1C1E` | 100% |
| Texto da bolha do assistente | `#F5F5F5` | 100% |
| Fundo da tela | `#000000` | 100% |
| Timestamp das mensagens | `#6B7280` (gray-500) | 100% |
| Barra de input (fundo) | `#111111` | 100% |
| Borda do input | `#2A2A2A` | 100% |
| Placeholder do input | `#6B7280` | 100% |
| Botão enviar (ativo) | `#DC2626` | 100% |
| Botão enviar (inativo) | `#DC2626` | 30% |
| Typing indicator dots | `#6B7280` | Animação pulsante |
| Limit banner fundo | `#1C1C1E` | 100% |
| Limit banner accent | `#F59E0B` (amber) | Warning, não vermelho para não conflitar com accent |

### 7.3 Layout — Tela de Chat (`chat/[sessionId].tsx`)

```
┌──────────────────────────────────┐
│  ← Header: Título da sessão      │
├──────────────────────────────────┤
│                                  │
│  [Avatar] ┌──────────────────┐   │
│           │ Bolha assistente │   │
│           └──────────────────┘   │
│                     10:32        │
│                                  │
│        ┌──────────────────┐      │
│        │  Bolha usuário   │      │
│        └──────────────────┘      │
│                     10:33        │
│                                  │
│  [Avatar] ┌──────────────────┐   │
│           │ ●●● digitando... │   │
│           └──────────────────┘   │
│                                  │
├──────────────────────────────────┤
│  [  Digite sua mensagem...  ] 🔴 │
└──────────────────────────────────┘
```

**Detalhes:**
- FlatList invertida (`inverted={true}`) para scroll automático para baixo
- Bolhas com `borderRadius: 16`, `paddingHorizontal: 14`, `paddingVertical: 10`
- Bolha do usuário: sem borda, fundo Guards Red, `maxWidth: '80%'`, alinhada à direita
- Bolha do assistente: sem borda, fundo `#1C1C1E`, `maxWidth: '85%'`, alinhada à esquerda
- Avatar do assistente: 28x28, à esquerda da bolha, alinhado ao topo
- Timestamp: exibido abaixo da bolha, fonte 11px, cor `#6B7280`
- Input: altura mínima 44px, multilinha até 4 linhas, botão enviar circular 36x36

### 7.4 Layout — Lista de Sessões (`chat/index.tsx`)

```
┌──────────────────────────────────┐
│  ← Assistente Mecânico           │
├──────────────────────────────────┤
│                                  │
│  ┌──────────────────────────┐    │
│  │ 🔧 Barulho na roda       │    │
│  │ "Pode ser a pastilha..." │    │
│  │ há 2 dias                │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │ 🔧 Troca de óleo         │    │
│  │ "No seu Corolla com..."  │    │
│  │ há 1 semana              │    │
│  └──────────────────────────┘    │
│                                  │
│                          [＋ FAB] │
└──────────────────────────────────┘
```

**Detalhes:**
- Cards com fundo `#111111`, `borderRadius: 12`, `padding: 16`
- Título: DM Sans SemiBold 16px, branco
- Preview: Regular 14px, `#9CA3AF` (gray-400), `numberOfLines={1}`
- Data: Regular 12px, `#6B7280`
- FAB: circular 56x56, Guards Red, ícone `+` ou ícone de chat branco, posição absolute bottom-right
- Empty state: ícone de chat grande centralizado + texto "Tire dúvidas sobre seu carro" + botão "Iniciar conversa"

### 7.5 Layout — Empty State (primeira mensagem)

```
┌──────────────────────────────────┐
│  ← Nova conversa                 │
├──────────────────────────────────┤
│                                  │
│          [Ícone Revy]            │
│     Olá! Sou o Revy, seu        │
│     assistente mecânico.         │
│                                  │
│  ┌──────────────────────────┐    │
│  │ Quando devo trocar óleo? │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ Meu carro faz um barulho │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ O que são as manutenções │    │
│  │ do meu histórico?        │    │
│  └──────────────────────────┘    │
│                                  │
├──────────────────────────────────┤
│  [  Digite sua mensagem...  ] 🔴 │
└──────────────────────────────────┘
```

**Detalhes:**
- Sugestões são chips/cards clicáveis com borda `#2A2A2A`, `borderRadius: 12`
- Ao clicar, preenche o input e envia automaticamente
- Sugestões somem após a primeira mensagem

### 7.6 Chat Limit Banner

```
┌──────────────────────────────────┐
│ ⚠️ Você usou 8 de 10 mensagens  │
│    este mês.                     │
│                [Fazer upgrade →] │
└──────────────────────────────────┘
```

Quando atingiu o limite (substitui o input):

```
┌──────────────────────────────────┐
│  Limite de mensagens atingido    │
│  Faça upgrade para continuar     │
│         [Fazer upgrade]          │
└──────────────────────────────────┘
```

---

## 8. Feature Gate & Conversão

| Touchpoint | Trigger | Ação |
|---|---|---|
| Botão na tela do veículo | Sempre visível | Todos acessam, limite controla uso |
| `ChatLimitBanner` (warning) | `used >= limit * 0.8` | Banner amarelo no topo do chat |
| `ChatLimitBanner` (blocked) | `used >= limit` | Substitui o input, bloqueia envio |
| Resposta 429 da Edge Function | `used >= limit` | Exibe modal/banner de upgrade |

---

## 9. Dependências do App

| Pacote | Uso | Status |
|---|---|---|
| `@supabase/supabase-js` | Client Supabase + Realtime | Já instalado |
| `react-native-markdown-display` ou similar | Renderizar markdown nas bolhas do assistente | A instalar |

---

## 10. Checklist de Implementação

### Banco de Dados ✅
- [x] Migration `003_ai_chat_assistant` aplicada
- [x] Tabelas `chat_sessions` e `chat_messages` criadas
- [x] RLS configurado
- [x] Functions `get_chat_context` e `count_user_messages_this_month` criadas
- [x] Realtime habilitado em `chat_messages`
- [x] Coluna `max_chat_messages_month` adicionada em `plans`

### Edge Function ✅
- [x] `chat` deployada com `index.ts` e `ai-provider.ts`
- [ ] Configurar secrets no Supabase (AI_PROVIDER_TYPE, AI_PROVIDER_URL, AI_PROVIDER_KEY, AI_MODEL)
- [ ] Testar via curl ou Dashboard

### App — Hooks
- [ ] `useChat(sessionId, vehicleId)`
- [ ] `useChatSessions(vehicleId)`
- [ ] `useChatLimit(userId)`

### App — Telas
- [ ] `chat/index.tsx` — Lista de sessões
- [ ] `chat/[sessionId].tsx` — Tela de conversa

### App — Componentes
- [ ] `ChatBubble`
- [ ] `ChatInput`
- [ ] `ChatTypingIndicator`
- [ ] `ChatSessionCard`
- [ ] `ChatLimitBanner`
- [ ] `ChatEmptyState`
- [ ] `AssistantAvatar`

### App — Integração
- [ ] Botão de acesso na `vehicle/[id].tsx`
- [ ] Navegação configurada no Expo Router
- [ ] Feature gate / conversão

### Pós-MVP
- [ ] Retenção automática de mensagens (cleanup job)
- [ ] Resumo de sessão (compressão de histórico)
- [ ] Limite de sessões por veículo
- [ ] Disclaimer legal na UI
- [ ] Analytics de uso (perguntas mais frequentes)