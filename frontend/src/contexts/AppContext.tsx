import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Asset, Allocation, TransferRequest, MaintenanceRequest, AuditCycle, Booking, Notification } from '../types';
import apiClient from '../services/apiClient';

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
  addAsset: (asset: Omit<Asset, 'id' | 'status'>) => void;
  allocateAsset: (assetId: string, employee: string, department: string) => void;
  returnAsset: (allocationId: string) => void;
  initiateReturn: (allocationId: string) => void;
  requestTransfer: (assetId: string, employee: string) => Promise<void>;
  approveTransfer: (transferId: string) => Promise<void>;
  rejectTransfer: (transferId: string) => Promise<void>;
  requestMaintenance: (assetId: string, description: string, priority: 'Low' | 'Medium' | 'High') => Promise<void>;
  approveMaintenance: (ticketId: string) => Promise<void>;
  rejectMaintenance: (ticketId: string) => Promise<void>;
  resolveMaintenance: (ticketId: string) => Promise<void>;
  createBooking: (booking: { assetId: string; startDate: string; endDate: string }) => Promise<void>;
  clearNotifications: () => void;
  syncState: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSite, setActiveSite] = useState<string>('San Francisco HQ');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Synchronize state with backend
  const syncState = async () => {
    try {
      const [assetsRes, allocRes, transfersRes, maintenanceRes] = await Promise.all([
        apiClient.get('/assets'),
        apiClient.get('/allocations'),
        apiClient.get('/transfers').catch(() => ({ data: [] })),
        apiClient.get('/maintenance').catch(() => ({ data: [] })),
      ]);
      setAssets(assetsRes.data);
      setAllocations(allocRes.data);
      setTransfers(transfersRes.data);
      setMaintenance(maintenanceRes.data);
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
      syncState();
    } catch (e) {
      console.error('Failed to add asset', e);
    }
  };

  const allocateAsset = async (assetId: string, employee: string, department: string) => {
    try {
      await apiClient.post('/allocations', { assetId, allocatedTo: employee, department });
      syncState();
    } catch (e: any) {
      if (e.response?.status === 409) {
        throw new Error('CONFLICT');
      }
      console.error('Failed to allocate asset', e);
      throw e;
    }
  };

  const returnAsset = async (allocationId: string) => {
    try {
      await apiClient.patch(`/allocations/${allocationId}/return`);
      syncState();
    } catch (e) {
      console.error('Failed to return asset', e);
    }
  };

  const initiateReturn = async (allocationId: string) => {
    try {
      await apiClient.patch(`/allocations/${allocationId}/initiate-return`);
      syncState();
    } catch (e) {
      console.error('Failed to initiate return', e);
    }
  };

  const requestTransfer = async (assetId: string, employeeName: string) => {
    try {
      // Find the user by name to get their ID for the transfer
      const usersRes = await apiClient.get('/users');
      const targetUser = usersRes.data.find((u: any) => u.name === employeeName);
      if (!targetUser) {
        throw new Error('Target user not found');
      }
      await apiClient.post('/transfers', { assetId, toUserId: targetUser.id });
      syncState();
    } catch (e) {
      console.error('Failed to request transfer', e);
      throw e;
    }
  };

  const approveTransfer = async (transferId: string) => {
    try {
      await apiClient.patch(`/transfers/${transferId}/approve`);
      syncState();
    } catch (e) {
      console.error('Failed to approve transfer', e);
      throw e;
    }
  };

  const rejectTransfer = async (transferId: string) => {
    try {
      await apiClient.patch(`/transfers/${transferId}/reject`);
      syncState();
    } catch (e) {
      console.error('Failed to reject transfer', e);
      throw e;
    }
  };

  const requestMaintenance = async (assetId: string, description: string, priority: 'Low' | 'Medium' | 'High') => {
    try {
      await apiClient.post('/maintenance', { assetId, description, priority });
      syncState();
    } catch (e) {
      console.error('Failed to request maintenance', e);
      throw e;
    }
  };

  const approveMaintenance = async (ticketId: string) => {
    try {
      await apiClient.patch(`/maintenance/${ticketId}/approve`);
      syncState();
    } catch (e) {
      console.error('Failed to approve maintenance ticket', e);
      throw e;
    }
  };

  const rejectMaintenance = async (ticketId: string) => {
    try {
      await apiClient.patch(`/maintenance/${ticketId}/reject`);
      syncState();
    } catch (e) {
      console.error('Failed to reject maintenance ticket', e);
      throw e;
    }
  };

  const resolveMaintenance = async (ticketId: string) => {
    try {
      await apiClient.patch(`/maintenance/${ticketId}/resolve`);
      syncState();
    } catch (e) {
      console.error('Failed to resolve maintenance ticket', e);
      throw e;
    }
  };

  const createBooking = async (booking: { assetId: string; startDate: string; endDate: string }) => {
    try {
      await apiClient.post('/bookings', booking);
      syncState();
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { conflict?: boolean } } };
      if (err.response?.status === 409 && err.response?.data?.conflict) {
        throw new Error('CONFLICT');
      }
      console.error('Failed to create booking', e);
      throw e;
    }
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
