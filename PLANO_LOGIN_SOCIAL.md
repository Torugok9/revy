# Plano de Implementação — Login Social (Google + Facebook)

## Estado Atual

O app Revy já possui:

- Autenticação por e-mail/senha funcionando via Supabase Auth
- Botões visuais de Google e Facebook na tela `app/auth.tsx` (com `onPress={() => {}}`)
- `expo-web-browser` instalado (necessário para OAuth redirect)
- Deep linking scheme `"revy"` definido no `app.json`
- Supabase client configurado com `persistSession: true`

---

## Abordagem Recomendada

**Usar Supabase OAuth nativo** (não SDKs nativos do Google/Facebook). Motivos:

1. Supabase já gerencia tokens, refresh e sessão — sem duplicação de lógica
2. Funciona via browser redirect (WebBrowser do Expo), sem SDKs nativos pesados
3. Mesma tabela `auth.users` — sem necessidade de merge de contas
4. Menos configuração por plataforma (sem GoogleSignIn nativo, sem FBSDK)

---

## Etapas de Implementação

### 1. Configurar Providers no Supabase Dashboard

**Google:**
- Acessar [Google Cloud Console](https://console.cloud.google.com)
- Criar um projeto (ou usar existente)
- Ativar a API "Google Identity" (OAuth consent screen)
- Criar credenciais OAuth 2.0 (tipo "Web application")
- Adicionar redirect URI: `https://efolrcurbwpscwytaxgp.supabase.co/auth/v1/callback`
- Copiar Client ID e Client Secret
- No Supabase Dashboard → Authentication → Providers → Google: colar Client ID e Secret, ativar o provider

**Facebook:**
- Acessar [Meta for Developers](https://developers.facebook.com)
- Criar um app (tipo "Consumer")
- Em "Facebook Login" → Settings:
  - Adicionar redirect URI: `https://efolrcurbwpscwytaxgp.supabase.co/auth/v1/callback`
- Copiar App ID e App Secret
- No Supabase Dashboard → Authentication → Providers → Facebook: colar App ID e Secret, ativar o provider

**Em ambos:** adicionar o redirect URL do Supabase como origin/callback autorizado.

---

### 2. Configurar Deep Linking no App

**Arquivo: `app.json`**

Já existe `"scheme": "revy"`. Verificar que está correto para ambas as plataformas.

Para iOS, adicionar o `associatedDomains` se quiser Universal Links (opcional):
```json
"ios": {
  "bundleIdentifier": "com.beecodeit.revy",
  "infoPlist": {
    "CFBundleURLTypes": [{
      "CFBundleURLSchemes": ["revy"]
    }]
  }
}
```

Para Android, garantir o `intentFilters` (opcional, o scheme já cobre):
```json
"android": {
  "package": "com.beecodeit.revy",
  "intentFilters": [{
    "action": "VIEW",
    "autoVerify": true,
    "data": [{ "scheme": "revy" }],
    "category": ["BROWSABLE", "DEFAULT"]
  }]
}
```

---

### 3. Configurar Redirect URL no Supabase Dashboard

Em **Authentication → URL Configuration:**
- Adicionar `revy://` como Redirect URL permitida
- Ou mais específico: `revy://auth/callback`

---

### 4. Atualizar o Supabase Client

**Arquivo: `lib/supabase.ts`**

Mudar `detectSessionInUrl` para funcionar com o fluxo OAuth:

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // manter false — trataremos o redirect manualmente
  },
});
```

---

### 5. Criar Função de OAuth Login

**Arquivo: `contexts/AuthContext.tsx`** (ou novo helper `lib/oauth.ts`)

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

// Garante que o browser modal fecha após redirect
WebBrowser.maybeCompleteAuthSession();

type OAuthProvider = 'google' | 'facebook';

export async function signInWithOAuth(provider: OAuthProvider) {
  // 1. Gerar a URL de login via Supabase
  const redirectUrl = Linking.createURL('auth/callback');
  // Isso gera algo como: revy://auth/callback

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true, // Não redirecionar automaticamente — vamos abrir no WebBrowser
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('URL de autenticação não gerada');

  // 2. Abrir o browser para login
  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    redirectUrl,
  );

  // 3. Extrair tokens do redirect URL
  if (result.type === 'success') {
    const url = result.url;
    // O Supabase retorna os tokens como fragment: #access_token=...&refresh_token=...
    const params = new URLSearchParams(url.split('#')[1]);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      // 4. Setar a sessão manualmente no Supabase client
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) throw sessionError;
    }
  }
}
```

---

### 6. Atualizar o AuthContext

**Arquivo: `contexts/AuthContext.tsx`**

Adicionar ao tipo do contexto:
```typescript
interface AuthContextType {
  // ... campos existentes ...
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
}
```

Implementar as funções:
```typescript
const signInWithGoogle = async () => {
  try {
    setError(null);
    setLoading(true);
    await signInWithOAuth('google');
    // O onAuthStateChange já vai capturar a sessão e atualizar o estado
  } catch (err) {
    setError(err as AuthError);
  } finally {
    setLoading(false);
  }
};

const signInWithFacebook = async () => {
  try {
    setError(null);
    setLoading(true);
    await signInWithOAuth('facebook');
  } catch (err) {
    setError(err as AuthError);
  } finally {
    setLoading(false);
  }
};
```

Expor no Provider:
```typescript
<AuthContext.Provider value={{
  ...valoresExistentes,
  signInWithGoogle,
  signInWithFacebook,
}}>
```

---

### 7. Conectar os Botões na Tela de Auth

**Arquivo: `app/auth.tsx`**

Trocar os `onPress={() => {}}` pelos handlers reais:

```tsx
const { signInWithGoogle, signInWithFacebook } = useAuth();

// Botão Google
<TouchableOpacity onPress={signInWithGoogle}>
  {/* ... ícone Google existente ... */}
</TouchableOpacity>

// Botão Facebook
<TouchableOpacity onPress={signInWithFacebook}>
  {/* ... ícone Facebook existente ... */}
</TouchableOpacity>
```

---

### 8. Tratar Nome do Usuário (Social → Profile)

O login social não preenche o `user_name` no AsyncStorage como o signup por e-mail faz. Adicionar lógica:

```typescript
// No onAuthStateChange, quando detectar novo login social:
if (session?.user?.app_metadata?.provider !== 'email') {
  const name = session.user.user_metadata?.full_name
    || session.user.user_metadata?.name
    || '';
  if (name) {
    await AsyncStorage.setItem(`user_name_${session.user.id}`, name);
  }
}
```

---

### 9. Tratar Conta Duplicada (mesmo e-mail)

No Supabase Dashboard → Authentication → Settings:
- **"Enable automatic linking"** → Ativar para que login com Google usando o mesmo e-mail de uma conta existente vincule automaticamente (ao invés de criar duplicata ou dar erro)

---

## Dependências Necessárias

Já instaladas:
- `expo-web-browser` ✅
- `@supabase/supabase-js` ✅
- `@react-native-async-storage/async-storage` ✅

Pode ser necessário instalar:
- `expo-linking` (verificar se já vem com expo-router — provavelmente sim)

**Não é necessário instalar:**
- `@react-native-google-signin/google-signin` (desnecessário com Supabase OAuth)
- `react-native-fbsdk-next` (desnecessário com Supabase OAuth)

---

## Checklist de Implementação

- [ ] Criar projeto no Google Cloud Console + credenciais OAuth
- [ ] Criar app no Meta for Developers + configurar Facebook Login
- [ ] Ativar providers Google e Facebook no Supabase Dashboard
- [ ] Adicionar `revy://` como redirect URL no Supabase
- [ ] Criar função `signInWithOAuth()` em `lib/oauth.ts` ou no AuthContext
- [ ] Adicionar `signInWithGoogle` e `signInWithFacebook` ao AuthContext
- [ ] Conectar botões existentes em `app/auth.tsx`
- [ ] Tratar nome do usuário vindo do provider social
- [ ] Ativar "automatic account linking" no Supabase
- [ ] Testar fluxo completo em iOS (Simulator + device)
- [ ] Testar fluxo completo em Android (Emulator + device)
- [ ] Testar edge cases: cancelamento, conta duplicada, erro de rede

---

## Riscos e Observações

1. **Apple exige "Sign in with Apple"** — se o app oferecer login social no iOS, a App Store exige que Apple Sign-In também esteja disponível. Considerar adicionar como terceiro provider.

2. **Facebook Login exige revisão do app** — o app precisa passar por revisão da Meta para uso público. Em modo desenvolvimento, só funciona para administradores/testers do app.

3. **Expo Go vs Development Build** — deep linking com scheme customizado (`revy://`) não funciona no Expo Go. É necessário usar `npx expo run:ios` ou `npx expo run:android` (development build) para testar OAuth.

4. **WebBrowser vs AuthSession** — `expo-web-browser` com `openAuthSessionAsync` é a abordagem recomendada para Expo SDK 54+. O antigo `expo-auth-session` está sendo descontinuado.
