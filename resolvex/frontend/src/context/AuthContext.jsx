import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('resolvex_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('resolvex_token');
      localStorage.removeItem('resolvex_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const persistSession = (data) => {
    localStorage.setItem('resolvex_token', data.token);
    localStorage.setItem('resolvex_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    persistSession(data);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    persistSession(data);
    return data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // ignore network errors on logout
    }
    localStorage.removeItem('resolvex_token');
    localStorage.removeItem('resolvex_user');
    setUser(null);
  };

  const updateLocalUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('resolvex_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateLocalUser, refresh: loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
