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

  // Regional admin
  async getDepartments() {
    const res = await fetch(`${API_URL}/admin/departments`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },

  async createDepartment(name) {
    const res = await fetch(`${API_URL}/admin/departments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create department');
    return data;
  },

  async getPendingDepartmentIssues() {
    const res = await fetch(`${API_URL}/admin/pending-department-issues`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch pending issues');
    return res.json();
  },

  async createDepartmentAndAssign(departmentName) {
    const res = await fetch(`${API_URL}/admin/create-department-and-assign`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ departmentName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create and assign');
    return data;
  },

  async createDepartmentalAdmin({ email, password, name, departmentId, departmentName }) {
    const body = { email, password, name };
    if (departmentId) body.departmentId = departmentId;
    else if (departmentName) body.departmentName = departmentName;
    else throw new Error('Select a department or enter a new department name');

    const res = await fetch(`${API_URL}/admin/departmental-admin`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create departmental admin');
    return data;
  },
};

// Public endpoints (no auth)
export const publicService = {
  async getRegions() {
    const res = await fetch(`${API_URL}/admin/regions/public`);
    if (!res.ok) throw new Error('Failed to fetch regions');
    return res.json();
  },
  async getDepartments() {
    const res = await fetch(`${API_URL}/admin/departments/public`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },
};
