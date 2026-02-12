import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${authService.getToken()}`,
});

export const notificationService = {
  async getMyNotifications() {
    const res = await fetch(`${API_URL}/notifications`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markRead(id) {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update notification');
    return data;
  },

  async markAllRead() {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update notifications');
    return data;
  },
};

