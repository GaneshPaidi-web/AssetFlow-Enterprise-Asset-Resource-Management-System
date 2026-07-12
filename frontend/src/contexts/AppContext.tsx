import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Asset, Allocation, TransferRequest, MaintenanceRequest, AuditCycle, Booking, Notification, User } from '../types';
import {
  AssetAPI,
  AllocationAPI,
  MaintenanceAPI,
  BookingAPI,
  AuditAPI,
  NotificationAPI
} from '../services/api';

interface AppContextType {
  user: User;
  activeSite: string;
  setActiveSite: (site: string) => void;
  assets: Asset[];
  allocations: Allocation[];
  transfers: TransferRequest[];
  maintenance: MaintenanceRequest[];
  audits: AuditCycle[];
  bookings: Booking[];
  notifications: Notification[];
  logout: () => void;
  addAsset: (asset: Omit<Asset, 'id' | 'status'>) => void;
  allocateAsset: (assetId: string, employee: string, department: string) => void;
  returnAsset: (allocationId: string) => void;
  approveTransfer: (transferId: string) => void;
  rejectTransfer: (transferId: string) => void;
  requestTransfer: (assetId: string, toEmployee: string, toDepartment: string) => void;
  requestMaintenance: (assetId: string, description: string, priority: 'Low' | 'Medium' | 'High') => void;
  createBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User>({
    id: 'USR-001',
    name: 'Kristin Watson',
    email: 'kristin.watson@assetflow.com',
    role: 'System Administrator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    site: 'San Francisco HQ'
  });

  const [activeSite, setActiveSite] = useState<string>('San Francisco HQ');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Synchronize state with live backend database
  const syncState = async () => {
    try {
      const [assetsData, allocationsData, transfersData, maintenanceData, auditsData, bookingsData, notificationsData] = await Promise.all([
        AssetAPI.getAll(),
        AllocationAPI.getAll(),
        AllocationAPI.getTransfers(),
        MaintenanceAPI.getAll(),
        AuditAPI.getAll(),
        BookingAPI.getAll(),
        NotificationAPI.getAll()
      ]);
      setAssets(assetsData);
      setAllocations(allocationsData);
      setTransfers(transfersData);
      setMaintenance(maintenanceData);
      setAudits(auditsData);
      setBookings(bookingsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Failed to load data from backend server:', error);
    }
  };

  useEffect(() => {
    syncState();
  }, []);

  const logout = () => {
    console.log('Logging out user...');
  };

  const handleAddAsset = async (asset: Omit<Asset, 'id' | 'status'>) => {
    try {
      await AssetAPI.create(asset);
      await syncState();
    } catch (error) {
      console.error('Failed to add asset:', error);
    }
  };

  const allocateAsset = async (assetId: string, employee: string, department: string) => {
    try {
      await AllocationAPI.allocate(assetId, employee, department);
      await syncState();
    } catch (error) {
      console.error('Failed to allocate asset:', error);
    }
  };

  const returnAsset = async (allocationId: string) => {
    try {
      await AllocationAPI.return(allocationId);
      await syncState();
    } catch (error) {
      console.error('Failed to return asset:', error);
    }
  };

  const approveTransfer = async (transferId: string) => {
    try {
      await AllocationAPI.approveTransfer(transferId);
      await syncState();
    } catch (error) {
      console.error('Failed to approve transfer:', error);
    }
  };

  const rejectTransfer = async (transferId: string) => {
    try {
      await AllocationAPI.rejectTransfer(transferId);
      await syncState();
    } catch (error) {
      console.error('Failed to reject transfer:', error);
    }
  };

  const requestTransfer = async (assetId: string, toEmployee: string, toDepartment: string) => {
    try {
      await AllocationAPI.createTransfer(assetId, toEmployee, toDepartment);
      await syncState();
    } catch (error) {
      console.error('Failed to create transfer request:', error);
    }
  };

  const requestMaintenance = async (assetId: string, description: string, priority: 'Low' | 'Medium' | 'High') => {
    try {
      await MaintenanceAPI.createRequest({ assetId, description, priority });
      await syncState();
    } catch (error) {
      console.error('Failed to request maintenance:', error);
    }
  };

  const createBooking = async (booking: Omit<Booking, 'id' | 'status'>) => {
    try {
      await BookingAPI.create(booking);
      await syncState();
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  const clearNotifications = async () => {
    try {
      await NotificationAPI.markAllRead();
      await syncState();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeSite,
        setActiveSite,
        assets,
        allocations,
        transfers,
        maintenance,
        audits,
        bookings,
        notifications,
        logout,
        addAsset: handleAddAsset,
        allocateAsset,
        returnAsset,
        approveTransfer,
        rejectTransfer,
        requestTransfer,
        requestMaintenance,
        createBooking,
        clearNotifications
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
