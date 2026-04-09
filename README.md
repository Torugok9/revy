# Revvy

App mobile para gerenciamento completo de veiculos pessoais: manutencoes, abastecimentos, quilometragem e custos. Construido com React Native e Expo.

<!-- screenshot: tela de dashboard mostrando health card do veiculo, stats de km e combustivel -->

## O problema

Manter o historico de manutencoes, gastos com combustivel e quilometragem de um carro e algo que a maioria das pessoas faz em planilhas, anotacoes soltas ou simplesmente nao faz. Quando chega a hora de vender o veiculo ou entender por que os custos aumentaram, a informacao nao existe ou esta espalhada.

Revvy centraliza tudo isso em um app com dashboard visual, alertas de manutencao e um assistente mecanico por chat.

## O que faz

- **Dashboard por veiculo** com indicador de saude, stats de manutencao, quilometragem e combustivel
- **Garagem** para cadastro e gerenciamento de multiplos veiculos (marca, modelo, ano, placa, km, foto)
- **Registro de manutencoes** (revisao, troca de peca, reparo) com custo, oficina, foto de nota fiscal e proxima manutencao
- **Registro de abastecimentos** com tipo de combustivel, litros, preco, km e calculo de consumo (km/l)
- **Comparacao de combustivel** (gasolina vs etanol) com recomendacao de qual compensa mais
- **Controle de quilometragem** com historico e graficos
- **Tela de analises** com graficos de custos e consumo
- **Assistente Mecanico** via chat (IA) com sessoes por veiculo e limites de uso por plano
- **Sistema de planos** (Free / Premium) com controle de features via RevenueCat
- **Autenticacao** via Supabase (OAuth)
- **Onboarding** para novos usuarios

## Quick start

### Pre-requisitos

- Node.js >= 18
- Expo CLI (`npm install -g expo-cli` ou use via `npx`)
- Conta no [Supabase](https://supabase.com) com projeto configurado (auth, tabelas, funcoes RPC)
- Conta no [RevenueCat](https://www.revenuecat.com) para gerenciamento de assinaturas
- Para rodar no dispositivo: Expo Go ou build de desenvolvimento
- Para iOS Simulator: Xcode
- Para Android Emulator: Android Studio

### Instalacao

```bash
# Clone
git clone <repo-url>
cd revy

# Dependencias
npm install

# Configuracao
# Crie um arquivo .env na raiz com as variaveis:
# EXPO_PUBLIC_SUPABASE_URL=<sua-url-do-supabase>
# EXPO_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
# EXPO_PUBLIC_RC_KEY_IOS_PROD=<chave-revenuecat-ios>
# EXPO_PUBLIC_RC_KEY_ANDROID_PROD=<chave-revenuecat-android>

# Rodar
npx expo start
```

### Verificacao

Escaneie o QR code com Expo Go no celular, ou pressione `i` para iOS Simulator / `a` para Android Emulator. Voce deve ver a tela de onboarding ou login.

## Estrutura do projeto

```
app/
├── (tabs)/           # Telas principais (Dashboard, Analises, Garagem, Config)
├── auth.tsx          # Tela de autenticacao
├── onboarding.tsx    # Onboarding de novos usuarios
├── plans.tsx         # Tela de planos e assinatura
├── chat/             # Assistente Mecanico (sessoes, mensagens)
├── fuel/             # Registro e historico de abastecimentos
├── maintenance/      # Registro de manutencoes
├── odometer/         # Registro de quilometragem
├── vehicle/          # Cadastro e detalhes de veiculos
└── profile/          # Perfil e plano do usuario
components/
├── dashboard/        # Cards, stats, health, selecao de veiculo
├── chat/             # UI do assistente mecanico
├── navigation/       # FloatingTabBar
├── ui/               # Componentes base reutilizaveis
├── analytics/        # Componentes de graficos e analises
└── vehicles/         # Componentes de listagem de veiculos
contexts/             # AuthContext, FeaturesContext, RevenueCatContext
hooks/                # Hooks de dominio (useChat, useFuel, useVehicles, etc.)
lib/                  # Clientes externos (Supabase, OAuth)
types/                # Tipagens de dominio (vehicle, fuel, chat, plans)
constants/            # Theme, features catalog, purchase errors
utils/                # Formatadores e validacoes
```

## Stack

| Tecnologia | Uso |
| --- | --- |
| Expo SDK 54 | Framework e build |
| React Native 0.81 | UI nativa |
| Expo Router | Navegacao file-based |
| Supabase | Auth, banco de dados, RPC |
| RevenueCat | Assinaturas in-app |
| React Native Reanimated | Animacoes |
| DM Sans | Tipografia |

## Scripts uteis

```bash
npx expo start        # Dev server (QR code para Expo Go)
npx expo start --web  # Versao web
npx expo run:ios      # Build e roda no iOS Simulator
npx expo run:android  # Build e roda no Android Emulator
npm run lint          # ESLint
```

## Licenca

<!-- PREENCHER: definir licenca -->
