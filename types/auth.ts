export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
}
