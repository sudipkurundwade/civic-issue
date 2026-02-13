import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const headers = () => ({
  Authorization: `Bearer ${authService.getToken()}`,
});

export const issueService = {
  async getAllIssues() {
    const res = await fetch(`${API_URL}/issues`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch issues');
    return res.json();
  },

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

  async toggleLike(issueId) {
    const res = await fetch(`${API_URL}/issues/${issueId}/like`, {
      method: 'POST',
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to like issue');
    return data;
  },

  async getComments(issueId) {
    const res = await fetch(`${API_URL}/issues/${issueId}/comments`, {
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch comments');
    return data;
  },

  async addComment(issueId, text) {
    const res = await fetch(`${API_URL}/issues/${issueId}/comments`, {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add comment');
    return data;
  },

  async analyzeImage(base64Image, mimeType = 'image/jpeg') {
    const res = await fetch(`${API_URL}/issues/analyze-image`, {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, mimeType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to analyze image');
    return data;
  },
};
