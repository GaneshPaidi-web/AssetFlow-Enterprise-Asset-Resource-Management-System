import axios from 'axios';
import type { Asset, Allocation, TransferRequest, MaintenanceRequest, Booking, Notification, AuditCycle } from '../types';

export const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Client Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export const AuthAPI = {
  login: async (credentials: any) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  signup: async (data: any) => {
    const res = await apiClient.post('/auth/signup', data);
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  }
};

export const AssetAPI = {
  getAll: async (): Promise<Asset[]> => {
    const res = await apiClient.get('/assets');
    return res.data;
  },
  getById: async (id: string): Promise<Asset> => {
    const res = await apiClient.get(`/assets/${id}`);
    return res.data;
  },
  create: async (asset: Omit<Asset, 'id' | 'status'>): Promise<Asset> => {
    const res = await apiClient.post('/assets', asset);
    return res.data;
  },
  updateStatus: async (id: string, status: Asset['status']): Promise<Asset> => {
    const res = await apiClient.patch(`/assets/${id}/status`, { status });
    return res.data;
  },
};

export const AllocationAPI = {
  getAll: async (): Promise<Allocation[]> => {
    const res = await apiClient.get('/allocations');
    return res.data;
  },
  allocate: async (assetId: string, employee: string, department: string): Promise<Allocation> => {
    const res = await apiClient.post('/allocations', { assetId, allocatedTo: employee, department });
    return res.data;
  },
  return: async (id: string): Promise<Allocation> => {
    const res = await apiClient.post(`/allocations/${id}/return`);
    return res.data;
  },
  getTransfers: async (): Promise<TransferRequest[]> => {
    const res = await apiClient.get('/transfers');
    return res.data;
  },
  createTransfer: async (assetId: string, toEmployee: string, toDepartment: string): Promise<TransferRequest> => {
    const res = await apiClient.post('/transfers', { assetId, toEmployee, toDepartment });
    return res.data;
  },
  approveTransfer: async (id: string): Promise<TransferRequest> => {
    const res = await apiClient.post(`/transfers/${id}/approve`);
    return res.data;
  },
  rejectTransfer: async (id: string): Promise<TransferRequest> => {
    const res = await apiClient.post(`/transfers/${id}/reject`);
    return res.data;
  },
};

export const MaintenanceAPI = {
  getAll: async (): Promise<MaintenanceRequest[]> => {
    const res = await apiClient.get('/maintenance');
    return res.data;
  },
  createRequest: async (req: { assetId: string; description: string; priority: 'Low' | 'Medium' | 'High' }): Promise<MaintenanceRequest> => {
    const res = await apiClient.post('/maintenance', req);
    return res.data;
  },
};

export const BookingAPI = {
  getAll: async (): Promise<Booking[]> => {
    const res = await apiClient.get('/bookings');
    return res.data;
  },
  create: async (booking: Omit<Booking, 'id' | 'status'>): Promise<Booking> => {
    const res = await apiClient.post('/bookings', booking);
    return res.data;
  },
};

export const AuditAPI = {
  getAll: async (): Promise<AuditCycle[]> => {
    const res = await apiClient.get('/audits');
    return res.data;
  },
};

export const NotificationAPI = {
  getAll: async (): Promise<Notification[]> => {
    const res = await apiClient.get('/notifications');
    return res.data;
  },
  markAllRead: async (): Promise<{ success: boolean }> => {
    const res = await apiClient.post('/notifications/mark-all-read');
    return res.data;
  },
};
