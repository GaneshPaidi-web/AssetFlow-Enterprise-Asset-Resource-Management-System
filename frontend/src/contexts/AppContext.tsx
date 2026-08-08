import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Asset, Allocation, TransferRequest, MaintenanceRequest, AuditCycle, Booking, Notification } from '../types';
import { apiClient } from '../services/apiClient';

export interface DepartmentOption {
  id: string;
  name: string;
  status?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface EmployeeOption {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface AppContextType {
  activeSite: string;
  setActiveSite: (site: string) => void;
  assets: Asset[];
  allocations: Allocation[];
  transfers: TransferRequest[];
  maintenance: MaintenanceRequest[];
  audits: AuditCycle[];
  bookings: Booking[];
  notifications: Notification[];
  departments: DepartmentOption[];
  categories: CategoryOption[];
  employees: EmployeeOption[];
  addAsset: (asset: Omit<Asset, 'id' | 'status'>) => void;
  allocateAsset: (assetId: string, employee: string, department: string) => void;
  returnAsset: (allocationId: string) => void;
  initiateReturn: (allocationId: string) => void;
  requestTransfer: (assetId: string, employee: string, department: string) => Promise<void>;
  approveTransfer: (transferId: string) => Promise<void>;
  rejectTransfer: (transferId: string) => Promise<void>;
  requestMaintenance: (assetId: string, description: string, priority: 'Low' | 'Medium' | 'High') => Promise<void>;
  approveMaintenance: (ticketId: string) => Promise<void>;
  rejectMaintenance: (ticketId: string) => Promise<void>;
  resolveMaintenance: (ticketId: string) => Promise<void>;
  createBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  syncState: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSite, setActiveSite] = useState<string>('Main Office');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  const syncState = async () => {
    try {
      const [
        assetsRes,
        allocRes,
        transfersRes,
        maintenanceRes,
        bookingsRes,
        auditsRes,
        notificationsRes,
        departmentsRes,
        categoriesRes,
        usersRes,
      ] = await Promise.all([
        apiClient.get('/assets'),
        apiClient.get('/allocations'),
        apiClient.get('/transfers').catch(() => ({ data: [] })),
        apiClient.get('/maintenance').catch(() => ({ data: [] })),
        apiClient.get('/bookings').catch(() => ({ data: [] })),
        apiClient.get('/audits').catch(() => ({ data: [] })),
        apiClient.get('/notifications').catch(() => ({ data: [] })),
        apiClient.get('/departments').catch(() => ({ data: [] })),
        apiClient.get('/categories').catch(() => ({ data: [] })),
        apiClient.get('/users').catch(() => ({ data: [] })),
      ]);

      setAssets(assetsRes.data);
      setAllocations(allocRes.data);
      setTransfers(transfersRes.data);
      setMaintenance(maintenanceRes.data);
      setBookings(bookingsRes.data);
      setAudits(auditsRes.data);
      setNotifications(notificationsRes.data);
      setDepartments(departmentsRes.data.map((d: DepartmentOption) => ({ id: d.id, name: d.name, status: d.status })));
      setCategories(categoriesRes.data.map((c: CategoryOption) => ({ id: c.id, name: c.name })));
      setEmployees(usersRes.data.map((u: EmployeeOption) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
      })));
    } catch (e) {
      console.error('Failed to sync state from backend', e);
    }
  };

  useEffect(() => {
    syncState();
  }, []);

  const handleAddAsset = async (asset: Omit<Asset, 'id' | 'status'>) => {
    try {
      await apiClient.post('/assets', asset);
      await syncState();
    } catch (e) {
      console.error('Failed to add asset', e);
      throw e;
    }
  };

  const allocateAsset = async (assetId: string, employee: string, department: string) => {
    try {
      await apiClient.post('/allocations', { assetId, allocatedTo: employee, department });
      await syncState();
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err.response?.status === 409) {
        throw new Error('CONFLICT');
      }
      console.error('Failed to allocate asset', e);
      throw e;
    }
  };

  const returnAsset = async (allocationId: string) => {
    try {
      await apiClient.patch(`/allocations/${allocationId}/return`);
      await syncState();
    } catch (e) {
      console.error('Failed to return asset', e);
    }
  };

  const initiateReturn = async (allocationId: string) => {
    try {
      await apiClient.patch(`/allocations/${allocationId}/initiate-return`);
      await syncState();
    } catch (e) {
      console.error('Failed to initiate return', e);
    }
  };

  const requestTransfer = async (assetId: string, employeeName: string, department: string) => {
    try {
      await apiClient.post('/transfers', {
        assetId,
        toEmployee: employeeName,
        toDepartment: department,
      });
      await syncState();
    } catch (e) {
      console.error('Failed to request transfer', e);
      throw e;
    }
  };

  const approveTransfer = async (transferId: string) => {
    try {
      await apiClient.patch(`/transfers/${transferId}/approve`);
      await syncState();
    } catch (e) {
      console.error('Failed to approve transfer', e);
      throw e;
    }
  };

  const rejectTransfer = async (transferId: string) => {
    try {
      await apiClient.patch(`/transfers/${transferId}/reject`);
      await syncState();
    } catch (e) {
      console.error('Failed to reject transfer', e);
      throw e;
    }
  };

  const requestMaintenance = async (assetId: string, description: string, priority: 'Low' | 'Medium' | 'High') => {
    try {
      await apiClient.post('/maintenance', { assetId, description, priority });
      await syncState();
    } catch (e) {
      console.error('Failed to request maintenance', e);
      throw e;
    }
  };

  const approveMaintenance = async (ticketId: string) => {
    try {
      await apiClient.patch(`/maintenance/${ticketId}/approve`);
      await syncState();
    } catch (e) {
      console.error('Failed to approve maintenance ticket', e);
    }
  };

  const rejectMaintenance = async (ticketId: string) => {
    try {
      await apiClient.patch(`/maintenance/${ticketId}/reject`);
      await syncState();
    } catch (e) {
      console.error('Failed to reject maintenance ticket', e);
    }
  };

  const resolveMaintenance = async (ticketId: string) => {
    try {
      await apiClient.patch(`/maintenance/${ticketId}/resolve`);
      await syncState();
    } catch (e) {
      console.error('Failed to resolve maintenance ticket', e);
    }
  };

  const createBooking = async (booking: Omit<Booking, 'id' | 'status'>) => {
    try {
      await apiClient.post('/bookings', booking);
      await syncState();
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { conflict?: boolean } } };
      if (err.response?.status === 409 && err.response?.data?.conflict) {
        throw new Error('CONFLICT');
      }
      console.error('Failed to create booking', e);
      throw e;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await apiClient.patch(`/bookings/${bookingId}/cancel`);
      await syncState();
    } catch (e) {
      console.error('Failed to cancel booking', e);
      throw e;
    }
  };

  const clearNotifications = async () => {
    try {
      await apiClient.post('/notifications/mark-all-read');
      await syncState();
    } catch (e) {
      console.error('Failed to mark notifications as read', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeSite,
        setActiveSite,
        assets,
        allocations,
        transfers,
        maintenance,
        audits,
        bookings,
        notifications,
        departments,
        categories,
        employees,
        addAsset: handleAddAsset,
        allocateAsset,
        returnAsset,
        initiateReturn,
        requestTransfer,
        approveTransfer,
        rejectTransfer,
        requestMaintenance,
        approveMaintenance,
        rejectMaintenance,
        resolveMaintenance,
        createBooking,
        cancelBooking,
        clearNotifications,
        syncState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
