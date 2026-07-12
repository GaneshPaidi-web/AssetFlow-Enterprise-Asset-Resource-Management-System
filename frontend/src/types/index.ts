export type AssetStatus = 'Available' | 'Allocated' | 'Reserved' | 'Maintenance' | 'Disposed' | 'Lost';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  site?: string;
}

export interface Site {
  id: string;
  name: string;
}

export interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  department: string;
  status: AssetStatus;
  purchaseDate: string;
  purchaseValue: number;
  location: string;
  qrCode?: string;
}

export interface Allocation {
  id: string;
  assetId: string;
  assetName: string;
  serialNumber: string;
  allocatedTo: string;
  allocatedToEmail: string;
  department: string;
  allocatedDate: string;
  status: 'Active' | 'Returned';
}

export interface TransferRequest {
  id: string;
  assetId: string;
  assetName: string;
  serialNumber: string;
  fromEmployee: string;
  toEmployee: string;
  fromDepartment: string;
  toDepartment: string;
  requestedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  assetName: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  requestedDate: string;
  facilityHealth: string;
}

export interface AuditCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  auditor: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number; // percentage
  missingAssets: number;
  discrepancies: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

export interface Booking {
  id: string;
  assetId: string;
  assetName: string;
  bookedBy: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  status: 'Confirmed' | 'Cancelled';
}
