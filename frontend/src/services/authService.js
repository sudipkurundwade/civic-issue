const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('civic_token');
const setToken = (token) => token ? localStorage.setItem('civic_token', token) : localStorage.removeItem('civic_token');
const getUser = () => {
  try {
    const u = localStorage.getItem('civic_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};
const setUser = (user) => {
  if (user) localStorage.setItem('civic_user', JSON.stringify(user));
  else localStorage.removeItem('civic_user');
};

export const authService = {
  getToken,
  getUser,
  isAuthenticated: () => !!getToken(),

  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    const user = { ...data.user, id: data.user.id || data.user._id };
    setToken(data.token);
    setUser(user);
    return { user, token: data.token };
  },

  async register(email, password, name, phone) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    const user = { ...data.user, id: data.user.id || data.user._id };
    setToken(data.token);
    setUser(user);
    return { user, token: data.token };
  },

  async fetchMe() {
    const token = getToken();
    if (!token) return null;
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setToken(null);
      setUser(null);
      return null;
    }
    const data = await res.json();
    const user = { ...data, id: data.id || data._id };
    setUser(user);
    return user;
  },

  logout() {
    setToken(null);
    setUser(null);
  },
};

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});
