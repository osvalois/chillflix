// src/types/auth.ts
export interface AuthProviderConfig {
    id: string;
    name: string;
    icon: string;
    backgroundColor: string;
    textColor: string;
  }
  
  export interface AuthState {
    isLoading: boolean;
    user: any | null;
    error: string | null;
  }