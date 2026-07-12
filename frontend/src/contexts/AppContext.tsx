import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Asset, Allocation, TransferRequest, MaintenanceRequest, AuditCycle, Booking, Notification, User } from '../types';
import {
  getAssets,
  getAllocations,
  getTransfers,
  getMaintenance,
  getAudits,
  getBookings,
  getNotifications,
  updateAssetStatus as apiUpdateAssetStatus,
  addAllocation as apiAddAllocation,
  updateAllocationStatus as apiUpdateAllocationStatus,
  updateTransferStatus as apiUpdateTransferStatus,
  addMaintenanceRequest as apiAddMaintenanceRequest,
  addBooking as apiAddBooking,
  addAsset as apiAddAsset,
  markNotificationsAsRead as apiMarkNotificationsAsRead
} from '../api/mockData';

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

  // Synchronize state with mock data backend
  const syncState = () => {
    setAssets([...getAssets()]);
    setAllocations([...getAllocations()]);
    setTransfers([...getTransfers()]);
    setMaintenance([...getMaintenance()]);
    setAudits([...getAudits()]);
    setBookings([...getBookings()]);
    setNotifications([...getNotifications()]);
  };

  useEffect(() => {
    syncState();
  }, []);

  const logout = () => {
    console.log('Logging out user...');
  };

  const handleAddAsset = (asset: Omit<Asset, 'id' | 'status'>) => {
    apiAddAsset(asset);
    // Push a notification
    const nId = `NTF-0${Date.now()}`;
    const newN = {
      id: nId,
      title: 'New Asset Added',
      message: `Asset ${asset.name} was successfully registered.`,
      type: 'success' as const,
      timestamp: 'Just now',
      isRead: false
    };
    getNotifications().unshift(newN);
    syncState();
  };

  const allocateAsset = (assetId: string, employee: string, department: string) => {
    const asset = getAssets().find(a => a.id === assetId);
    if (!asset) return;

    apiUpdateAssetStatus(assetId, 'Allocated');
    apiAddAllocation({
      assetId,
      assetName: asset.name,
      serialNumber: asset.serialNumber,
      allocatedTo: employee,
      allocatedToEmail: `${employee.toLowerCase().replace(' ', '.')}@assetflow.com`,
      department,
      allocatedDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    });

    const newN = {
      id: `NTF-0${Date.now()}`,
      title: 'Asset Allocated',
      message: `${asset.name} has been allocated to ${employee} (${department}).`,
      type: 'success' as const,
      timestamp: 'Just now',
      isRead: false
    };
    getNotifications().unshift(newN);
    syncState();
  };

  const returnAsset = (allocationId: string) => {
    const alc = getAllocations().find(a => a.id === allocationId && a.status === 'Active');
    if (!alc) return;

    apiUpdateAllocationStatus(allocationId, 'Returned');
    apiUpdateAssetStatus(alc.assetId, 'Available');

    const newN = {
      id: `NTF-0${Date.now()}`,
      title: 'Asset Returned',
      message: `${alc.assetName} was returned by ${alc.allocatedTo}.`,
      type: 'info' as const,
      timestamp: 'Just now',
      isRead: false
    };
    getNotifications().unshift(newN);
    syncState();
  };

  const approveTransfer = (transferId: string) => {
    apiUpdateTransferStatus(transferId, 'Approved');
    const transfer = getTransfers().find(t => t.id === transferId);
    if (transfer) {
      const newN = {
        id: `NTF-0${Date.now()}`,
        title: 'Transfer Approved',
        message: `Transfer for ${transfer.assetName} to ${transfer.toEmployee} has been approved.`,
        type: 'success' as const,
        timestamp: 'Just now',
        isRead: false
      };
      getNotifications().unshift(newN);
    }
    syncState();
  };

  const rejectTransfer = (transferId: string) => {
    apiUpdateTransferStatus(transferId, 'Rejected');
    const transfer = getTransfers().find(t => t.id === transferId);
    if (transfer) {
      const newN = {
        id: `NTF-0${Date.now()}`,
        title: 'Transfer Rejected',
        message: `Transfer request for ${transfer.assetName} was rejected.`,
        type: 'warning' as const,
        timestamp: 'Just now',
        isRead: false
      };
      getNotifications().unshift(newN);
    }
    syncState();
  };

  const requestMaintenance = (assetId: string, description: string, priority: 'Low' | 'Medium' | 'High') => {
    const asset = getAssets().find(a => a.id === assetId);
    if (!asset) return;

    apiAddMaintenanceRequest({
      assetId,
      assetName: asset.name,
      description,
      priority,
      facilityHealth: 'Needs Service'
    });

    const newN = {
      id: `NTF-0${Date.now()}`,
      title: 'Maintenance Requested',
      message: `Maintenance requested for ${asset.name}. Status set to Maintenance.`,
      type: 'error' as const,
      timestamp: 'Just now',
      isRead: false
    };
    getNotifications().unshift(newN);
    syncState();
  };

  const createBooking = (booking: Omit<Booking, 'id' | 'status'>) => {
    apiAddBooking(booking);
    const asset = getAssets().find(a => a.id === booking.assetId);
    const newN = {
      id: `NTF-0${Date.now()}`,
      title: 'New Booking Confirmed',
      message: `${asset ? asset.name : 'Asset'} has been booked by ${booking.bookedBy}.`,
      type: 'info' as const,
      timestamp: 'Just now',
      isRead: false
    };
    getNotifications().unshift(newN);
    syncState();
  };

  const clearNotifications = () => {
    apiMarkNotificationsAsRead();
    syncState();
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
