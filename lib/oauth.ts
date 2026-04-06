import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "./supabase";

type OAuthProvider = "google" | "apple";

/**
 * Inicia o fluxo de login OAuth via Supabase + WebBrowser.
 * 1. Gera a URL de autenticação no Supabase
 * 2. Abre o browser in-app para o usuário fazer login
 * 3. Captura os tokens do redirect e seta a sessão
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  // Gera a redirect URI com o scheme do app
  const redirectUrl = Linking.createURL("auth/callback");

  if (__DEV__) {
    console.log("[OAuth] Provider:", provider);
    console.log("[OAuth] Redirect URL:", redirectUrl);
  }

  // Gera a URL de login no provider via Supabase
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    if (__DEV__) console.error("[OAuth] Supabase error:", error);
    throw { message: error.message, code: error.code };
  }

  if (!data.url) {
    if (__DEV__) console.error("[OAuth] No URL returned from Supabase");
    throw { message: "Não foi possível gerar a URL de autenticação." };
  }

  if (__DEV__) console.log("[OAuth] Opening browser with URL:", data.url);

  // Abre o browser in-app para o usuário autenticar
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (__DEV__) console.log("[OAuth] Browser result type:", result.type);

  if (result.type !== "success") {
    // Usuário cancelou ou fechou o browser
    return;
  }

  // Extrai os tokens do fragment da URL de redirect
  const url = (result as WebBrowser.WebBrowserRedirectResult).url;
  if (__DEV__) console.log("[OAuth] Redirect URL received:", url);

  const fragment = url.split("#")[1];

  if (!fragment) {
    throw { message: "Resposta de autenticação inválida." };
  }

  const params = new URLSearchParams(fragment);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    if (__DEV__) console.error("[OAuth] Missing tokens in redirect");
    throw { message: "Tokens de autenticação não encontrados." };
  }

  // Seta a sessão manualmente no Supabase client
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    if (__DEV__) console.error("[OAuth] Session error:", sessionError);
    throw { message: sessionError.message, code: sessionError.code };
  }

  if (__DEV__) console.log("[OAuth] Session set successfully!");
}
