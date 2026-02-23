import { makeRedirectUri } from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "./supabase";

// Garante que o browser modal fecha corretamente após o redirect
WebBrowser.maybeCompleteAuthSession();

type OAuthProvider = "google" | "apple";

/**
 * Inicia o fluxo de login OAuth via Supabase + WebBrowser.
 * 1. Gera a URL de autenticação no Supabase
 * 2. Abre o browser in-app para o usuário fazer login
 * 3. Captura os tokens do redirect e seta a sessão
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  const redirectUrl = makeRedirectUri();

  // Gera a URL de login no provider via Supabase
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true, // Não redirecionar automaticamente — abrimos via WebBrowser
    },
  });

  if (error) {
    throw { message: error.message, code: error.code };
  }

  if (!data.url) {
    throw { message: "Não foi possível gerar a URL de autenticação." };
  }

  // Abre o browser in-app para o usuário autenticar
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type !== "success") {
    // Usuário cancelou ou fechou o browser
    return;
  }

  // Extrai os tokens do fragment da URL de redirect
  // Supabase retorna: revy://...#access_token=XXX&refresh_token=YYY&...
  const url = result.url;
  const fragment = url.split("#")[1];

  if (!fragment) {
    throw { message: "Resposta de autenticação inválida." };
  }

  const params = new URLSearchParams(fragment);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    throw { message: "Tokens de autenticação não encontrados." };
  }

  // Seta a sessão manualmente no Supabase client
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    throw { message: sessionError.message, code: sessionError.code };
  }
}
