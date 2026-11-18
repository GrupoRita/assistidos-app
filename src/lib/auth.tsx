import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authApi, setApiToken, setUnauthorizedHandler } from './api';

const TOKEN_KEY = 'rita-atende.token';
const EMAIL_KEY = 'rita-atende.email';

type AuthState = {
  ready: boolean;
  token: string | null;
  email: string | null;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const signOut = useCallback(async () => {
    setApiToken(null);
    setToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
  }, []);

  useEffect(() => {
    (async () => {
      const [t, e] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY).catch(() => null),
        SecureStore.getItemAsync(EMAIL_KEY).catch(() => null),
      ]);
      setApiToken(t);
      setToken(t);
      setEmail(e);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      token,
      email,
      sendCode: async (address) => {
        await authApi.sendCode(address.trim().toLowerCase());
      },
      verifyCode: async (address, code) => {
        const normalized = address.trim().toLowerCase();
        const res = await authApi.verifyCode(normalized, code.trim());
        await SecureStore.setItemAsync(TOKEN_KEY, res.token);
        await SecureStore.setItemAsync(EMAIL_KEY, normalized);
        setApiToken(res.token);
        setEmail(normalized);
        setToken(res.token);
      },
      signOut,
    }),
    [ready, token, email, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
