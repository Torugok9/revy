import { signInWithOAuth } from "@/lib/oauth";
import { supabase } from "@/lib/supabase";
import { AuthContextType, AuthError, User } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

      if (authError) {
        throw {
          message: authError.message,
          code: authError.code,
        };
      }

      if (data.user) {
        const storedName = await AsyncStorage.getItem(
          `user_name_${data.user.id}`,
        );

        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name: storedName || "",
          createdAt: data.user.created_at || new Date().toISOString(),
        });
      }
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || "Erro ao fazer login. Tente novamente.",
        code: err.code,
      };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          throw {
            message: authError.message,
            code: authError.code,
          };
        }

        if (data.user) {
          await AsyncStorage.setItem(`user_name_${data.user.id}`, name);

          setUser({
            id: data.user.id,
            email: data.user.email || "",
            name: name,
            createdAt: data.user.created_at || new Date().toISOString(),
          });
        }
      } catch (err: any) {
        const authError: AuthError = {
          message: err.message || "Erro ao criar conta. Tente novamente.",
          code: err.code,
        };
        setError(authError);
        throw authError;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateUserName = useCallback(
    async (name: string) => {
      if (!user) return;

      await AsyncStorage.setItem(`user_name_${user.id}`, name);
      setUser((prev) => (prev ? { ...prev, name } : null));
    },
    [user],
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signOut();

      if (authError) {
        throw {
          message: authError.message,
          code: authError.code,
        };
      }

      setUser(null);
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || "Erro ao fazer logout. Tente novamente.",
        code: err.code,
      };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithOAuth("google");
      // O onAuthStateChange captura a sessão automaticamente
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || "Erro ao entrar com Google. Tente novamente.",
        code: err.code,
      };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithOAuth("apple");
      // O onAuthStateChange captura a sessão automaticamente
    } catch (err: any) {
      const authError: AuthError = {
        message: err.message || "Erro ao entrar com Apple. Tente novamente.",
        code: err.code,
      };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function initializeAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const storedName = await AsyncStorage.getItem(
            `user_name_${session.user.id}`,
          );

          let userName = storedName || "";
          if (!userName) {
            const metadata = session.user.user_metadata;
            const providerName =
              metadata?.full_name || metadata?.name || "";
            if (providerName) {
              await AsyncStorage.setItem(
                `user_name_${session.user.id}`,
                providerName,
              );
              userName = providerName;
            }
          }

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: userName,
            createdAt: session.user.created_at || new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Erro ao inicializar autenticação:", err);
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const storedName = await AsyncStorage.getItem(
          `user_name_${session.user.id}`,
        );

        // Se não há nome salvo localmente, tenta extrair do provider (Google, Apple, etc.)
        let userName = storedName || "";
        if (!userName) {
          const metadata = session.user.user_metadata;
          const providerName =
            metadata?.full_name || metadata?.name || "";
          if (providerName) {
            await AsyncStorage.setItem(
              `user_name_${session.user.id}`,
              providerName,
            );
            userName = providerName;
          }
        }

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: userName,
          createdAt: session.user.created_at || new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signUp, signInWithGoogle, signInWithApple, signOut, updateUserName, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuthContext   deve ser usado dentro de um AuthProvider",
    );
  }
  return context;
}
