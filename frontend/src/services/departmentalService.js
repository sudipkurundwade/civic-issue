import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const headers = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

export const departmentalService = {
  async getIssues() {
    const res = await fetch(`${API_URL}/departmental/issues`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch issues');
    return res.json();
  },

  async updateStatus(issueId, status) {
    const res = await fetch(`${API_URL}/departmental/issues/${issueId}/status`, {
      method: 'PATCH',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status');
    return data;
  },

  async completeIssue(issueId, formData) {
    const token = authService.getToken();
    const isMultipart = formData instanceof FormData;
    const opts = {
      method: 'PATCH',
      headers: isMultipart ? { Authorization: `Bearer ${token}` } : { ...headers(), 'Content-Type': 'application/json' },
      body: isMultipart ? formData : JSON.stringify(formData),
    };
    const res = await fetch(`${API_URL}/departmental/issues/${issueId}/complete`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to complete issue');
    return data;
  },
};
