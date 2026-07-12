import axios from 'axios';
import * as mockDb from '../api/mockData';
import type { Asset, Allocation, TransferRequest, MaintenanceRequest, Booking, Notification } from '../types';

// Create a simulated Axios instance with custom interceptors
export const apiClient = axios.create({
  baseURL: 'https://api.assetflow.enterprise/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || 'mock-jwt-token';
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Simulated API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

// Service modules referencing the local mock db (making it trivial to swap to real api endpoints later)
export const AuthAPI = {
  login: async (credentials: any) => {
    return { data: { token: 'mock-jwt-token', user: { name: 'Kristin Watson', role: 'System Administrator' } } };
  },
  signup: async (data: any) => {
    return { data: { success: true } };
  },
  forgotPassword: async (email: string) => {
    return { data: { success: true } };
  }
};

export const AssetAPI = {
  getAll: async () => mockDb.getAssets(),
  getById: async (id: string) => mockDb.getAssets().find(a => a.id === id),
  create: async (asset: Omit<Asset, 'id' | 'status'>) => mockDb.addAsset(asset),
  updateStatus: async (id: string, status: Asset['status']) => mockDb.updateAssetStatus(id, status),
};

export const AllocationAPI = {
  getAll: async () => mockDb.getAllocations(),
  allocate: async (assetId: string, employee: string, department: string) => {
    const asset = mockDb.getAssets().find(a => a.id === assetId);
    if (!asset) throw new Error('Asset not found');
    mockDb.updateAssetStatus(assetId, 'Allocated');
    return mockDb.addAllocation({
      assetId,
      assetName: asset.name,
      serialNumber: asset.serialNumber,
      allocatedTo: employee,
      allocatedToEmail: `${employee.toLowerCase().replace(' ', '.')}@assetflow.com`,
      department,
      allocatedDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
  },
  return: async (id: string) => {
    const alc = mockDb.getAllocations().find(a => a.id === id);
    if (alc) {
      mockDb.updateAllocationStatus(id, 'Returned');
      mockDb.updateAssetStatus(alc.assetId, 'Available');
    }
  },
  getTransfers: async () => mockDb.getTransfers(),
  approveTransfer: async (id: string) => mockDb.updateTransferStatus(id, 'Approved'),
  rejectTransfer: async (id: string) => mockDb.updateTransferStatus(id, 'Rejected'),
};

export const MaintenanceAPI = {
  getAll: async () => mockDb.getMaintenance(),
  createRequest: async (req: Omit<MaintenanceRequest, 'id' | 'requestedDate' | 'status'>) => mockDb.addMaintenanceRequest(req),
};

export const BookingAPI = {
  getAll: async () => mockDb.getBookings(),
  create: async (booking: Omit<Booking, 'id' | 'status'>) => mockDb.addBooking(booking),
};

export const AuditAPI = {
  getAll: async () => mockDb.getAudits(),
};

export const NotificationAPI = {
  getAll: async () => mockDb.getNotifications(),
  markAllRead: async () => mockDb.markNotificationsAsRead(),
};
