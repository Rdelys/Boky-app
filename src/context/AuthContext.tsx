import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AuthUser,
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  LoginPayload,
  register as apiRegister,
  RegisterPayload,
} from '../api/auth';
import { getStoredToken, setStoredToken, parseApiError } from '../api/client';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Au démarrage : si un token est stocké, on tente de récupérer le profil.
  useEffect(() => {
    (async () => {
      const token = await getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        await setStoredToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login: AuthContextValue['login'] = async (payload) => {
    const { user: loggedUser, token } = await apiLogin(payload);
    await setStoredToken(token);
    setUser(loggedUser);
  };

  const register: AuthContextValue['register'] = async (payload) => {
    const { user: newUser, token } = await apiRegister(payload);
    await setStoredToken(token);
    setUser(newUser);
  };

  const logout: AuthContextValue['logout'] = async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Le token est peut-être déjà invalide côté serveur : on nettoie
      // quand même localement.
      void parseApiError(error);
    }
    await setStoredToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
