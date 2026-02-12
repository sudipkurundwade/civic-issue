import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const headers = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

export const issueService = {
  async getMyIssues() {
    const res = await fetch(`${API_URL}/issues/my`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch issues');
    return res.json();
  },

  async submitIssue(formData) {
    const token = authService.getToken();
    const isMultipart = formData instanceof FormData;
    const opts = {
      method: 'POST',
      headers: isMultipart ? { Authorization: `Bearer ${token}` } : { ...headers(), 'Content-Type': 'application/json' },
      body: isMultipart ? formData : JSON.stringify(formData),
    };
    const res = await fetch(`${API_URL}/issues`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit issue');
    return data;
  },
};
