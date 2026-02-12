import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${authService.getToken()}`,
});

export const adminService = {
  async getRegions() {
    const res = await fetch(`${API_URL}/admin/regions`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch regions');
    return res.json();
  },

  async createRegion(name) {
    const res = await fetch(`${API_URL}/admin/regions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create region');
    return data;
  },

  async createRegionalAdmin({ email, password, name, regionId, regionName }) {
    const body = { email, password, name };
    if (regionId) body.regionId = regionId;
    else if (regionName) body.regionName = regionName;
    else throw new Error('Select a region or enter a new region name');

    const res = await fetch(`${API_URL}/admin/regional-admin`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create regional admin');
    return data;
  },
};
