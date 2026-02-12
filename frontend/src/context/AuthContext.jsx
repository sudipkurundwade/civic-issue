import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      authService.fetchMe().then((u) => setUser(u)).finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { user: u } = await authService.login(email, password);
    setUser(u);
    return u;
  };

  const register = async (email, password, name, phone) => {
    const { user: u } = await authService.register(email, password, name, phone);
    setUser(u);
    return u;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const u = await authService.fetchMe();
    if (u) setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
