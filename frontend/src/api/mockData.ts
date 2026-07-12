import type { Asset, Allocation, TransferRequest, MaintenanceRequest, AuditCycle, Notification, Booking } from '../types';

export let mockAssets: Asset[] = [
  { id: 'AST-001', name: 'MacBook Pro 16" M3 Max', serialNumber: 'C02F87XMD6FF', category: 'IT Hardware', department: 'Engineering', status: 'Allocated', purchaseDate: '2025-10-15', purchaseValue: 3499, location: 'San Francisco HQ' },
  { id: 'AST-002', name: 'Dell XPS 15 9530', serialNumber: '5D9V3K2', category: 'IT Hardware', department: 'Product', status: 'Allocated', purchaseDate: '2025-11-02', purchaseValue: 2199, location: 'San Francisco HQ' },
  { id: 'AST-003', name: 'iPad Pro 12.9" M2', serialNumber: 'DLXGF77DQPTD', category: 'IT Hardware', department: 'Marketing', status: 'Available', purchaseDate: '2025-06-20', purchaseValue: 1099, location: 'New York Office' },
  { id: 'AST-004', name: 'ThinkPad X1 Carbon Gen 11', serialNumber: 'PF2Z5J9B', category: 'IT Hardware', department: 'Finance', status: 'Allocated', purchaseDate: '2025-08-12', purchaseValue: 1899, location: 'New York Office' },
  { id: 'AST-005', name: 'Cisco Catalyst 9300 Switch', serialNumber: 'FOC2415V0SL', category: 'Networking', department: 'IT', status: 'Maintenance', purchaseDate: '2024-03-10', purchaseValue: 4500, location: 'San Francisco Server Room' },
  { id: 'AST-006', name: 'iPhone 15 Pro Max 256GB', serialNumber: 'MQ8G3ZP/A', category: 'IT Hardware', department: 'Marketing', status: 'Reserved', purchaseDate: '2025-09-25', purchaseValue: 1199, location: 'San Francisco HQ' },
  { id: 'AST-007', name: 'Logitech MX Master 3S', serialNumber: '2230LZ089FD', category: 'Accessories', department: 'Design', status: 'Available', purchaseDate: '2025-01-18', purchaseValue: 99, location: 'London Hub' },
  { id: 'AST-008', name: 'Sony WH-1000XM5 Headset', serialNumber: '78401349082', category: 'Accessories', department: 'Engineering', status: 'Allocated', purchaseDate: '2025-02-14', purchaseValue: 399, location: 'San Francisco HQ' },
  { id: 'AST-009', name: 'Epson Pro EX11000 Projector', serialNumber: 'W8G8920194F', category: 'Facilities', department: 'HR', status: 'Available', purchaseDate: '2024-07-05', purchaseValue: 899, location: 'Conference Room C' },
  { id: 'AST-010', name: 'Herman Miller Aeron Chair', serialNumber: 'HM-A-948190', category: 'Furniture', department: 'HR', status: 'Allocated', purchaseDate: '2024-01-20', purchaseValue: 1450, location: 'San Francisco HQ' },
  { id: 'AST-011', name: 'Keysight Digital Oscilloscope', serialNumber: 'MY59281023', category: 'Lab Equipment', department: 'R&D', status: 'Maintenance', purchaseDate: '2023-11-12', purchaseValue: 12500, location: 'R&D Hardware Lab' },
  { id: 'AST-012', name: 'Dell UltraSharp 32" 4K Monitor', serialNumber: 'CN-0YT32D-74445', category: 'IT Hardware', department: 'Design', status: 'Available', purchaseDate: '2025-04-30', purchaseValue: 999, location: 'London Hub' },
  { id: 'AST-013', name: 'Ubiquiti UniFi Dream Machine', serialNumber: 'U-UDM-PRO-889', category: 'Networking', department: 'IT', status: 'Allocated', purchaseDate: '2024-09-18', purchaseValue: 379, location: 'London Server Room' },
  { id: 'AST-014', name: 'Steelcase Gesture Desk Chair', serialNumber: 'SC-G-002341', category: 'Furniture', department: 'HR', status: 'Disposed', purchaseDate: '2022-05-10', purchaseValue: 1100, location: 'Scrap Pile Yard' },
  { id: 'AST-015', name: 'Canon EOS R5 Mirrorless Camera', serialNumber: 'DS126839', category: 'Lab Equipment', department: 'Marketing', status: 'Lost', purchaseDate: '2024-06-11', purchaseValue: 3899, location: 'Unknown' }
];

export let mockAllocations: Allocation[] = [
  { id: 'ALC-001', assetId: 'AST-001', assetName: 'MacBook Pro 16" M3 Max', serialNumber: 'C02F87XMD6FF', allocatedTo: 'Jane Cooper', allocatedToEmail: 'jane.cooper@assetflow.com', department: 'Engineering', allocatedDate: '2025-10-16', status: 'Active' },
  { id: 'ALC-002', assetId: 'AST-002', assetName: 'Dell XPS 15 9530', serialNumber: '5D9V3K2', allocatedTo: 'John Doe', allocatedToEmail: 'john.doe@assetflow.com', department: 'Product', allocatedDate: '2025-11-03', status: 'Active' },
  { id: 'ALC-003', assetId: 'AST-004', assetName: 'ThinkPad X1 Carbon Gen 11', serialNumber: 'PF2Z5J9B', allocatedTo: 'Albert Flores', allocatedToEmail: 'albert.flores@assetflow.com', department: 'Finance', allocatedDate: '2025-08-13', status: 'Active' },
  { id: 'ALC-004', assetId: 'AST-008', assetName: 'Sony WH-1000XM5 Headset', serialNumber: '78401349082', allocatedTo: 'Jane Cooper', allocatedToEmail: 'jane.cooper@assetflow.com', department: 'Engineering', allocatedDate: '2025-02-15', status: 'Active' },
  { id: 'ALC-005', assetId: 'AST-010', assetName: 'Herman Miller Aeron Chair', serialNumber: 'HM-A-948190', allocatedTo: 'Kristin Watson', allocatedToEmail: 'kristin.watson@assetflow.com', department: 'HR', allocatedDate: '2024-01-21', status: 'Active' },
  { id: 'ALC-006', assetId: 'AST-013', assetName: 'Ubiquiti UniFi Dream Machine', serialNumber: 'U-UDM-PRO-889', allocatedTo: 'Guy Hawkins', allocatedToEmail: 'guy.hawkins@assetflow.com', department: 'IT', allocatedDate: '2024-09-20', status: 'Active' }
];

export let mockTransfers: TransferRequest[] = [
  { id: 'TRF-001', assetId: 'AST-003', assetName: 'iPad Pro 12.9" M2', serialNumber: 'DLXGF77DQPTD', fromEmployee: 'Unassigned', toEmployee: 'Cody Fisher', fromDepartment: 'Marketing', toDepartment: 'Sales', requestedDate: '2026-07-10', status: 'Pending' },
  { id: 'TRF-002', assetId: 'AST-007', assetName: 'Logitech MX Master 3S', serialNumber: '2230LZ089FD', fromEmployee: 'Unassigned', toEmployee: 'Esther Howard', fromDepartment: 'Design', toDepartment: 'Engineering', requestedDate: '2026-07-11', status: 'Pending' },
  { id: 'TRF-003', assetId: 'AST-012', assetName: 'Dell UltraSharp 32" 4K Monitor', serialNumber: 'CN-0YT32D-74445', fromEmployee: 'Unassigned', toEmployee: 'Bessie Cooper', fromDepartment: 'Design', toDepartment: 'Product', requestedDate: '2026-07-09', status: 'Approved' }
];

export let mockMaintenance: MaintenanceRequest[] = [
  { id: 'MNT-001', assetId: 'AST-005', assetName: 'Cisco Catalyst 9300 Switch', description: 'Firmware upgrade failure, switch loops on boot.', priority: 'High', status: 'In Progress', requestedDate: '2026-07-08', facilityHealth: 'Normal' },
  { id: 'MNT-002', assetId: 'AST-011', assetName: 'Keysight Digital Oscilloscope', description: 'Channel 3 calibration check and diagnostic testing.', priority: 'Medium', status: 'Pending', requestedDate: '2026-07-12', facilityHealth: 'Needs Service' }
];

export let mockAudits: AuditCycle[] = [
  { id: 'AUD-001', name: 'Q2 2026 Hardware Audit', startDate: '2026-04-01', endDate: '2026-06-30', auditor: 'Robert Fox', status: 'Completed', progress: 100, missingAssets: 2, discrepancies: 5 },
  { id: 'AUD-002', name: 'Global Network Infrastructure Review', startDate: '2026-07-01', endDate: '2026-09-30', auditor: 'Darrell Steward', status: 'In Progress', progress: 45, missingAssets: 1, discrepancies: 2 },
  { id: 'AUD-003', name: 'FY2026 Furniture Physical Count', startDate: '2026-10-01', endDate: '2026-12-31', auditor: 'Savannah Nguyen', status: 'Pending', progress: 0, missingAssets: 0, discrepancies: 0 }
];

export let mockBookings: Booking[] = [
  { id: 'BKG-001', assetId: 'AST-009', assetName: 'Epson Pro EX11000 Projector', bookedBy: 'Courtney Henry', startDate: '2026-07-13T10:00:00Z', endDate: '2026-07-13T12:00:00Z', status: 'Confirmed' },
  { id: 'BKG-002', assetId: 'AST-003', assetName: 'iPad Pro 12.9" M2', bookedBy: 'Darlene Robertson', startDate: '2026-07-14T14:00:00Z', endDate: '2026-07-14T16:00:00Z', status: 'Confirmed' },
  { id: 'BKG-003', assetId: 'AST-006', assetName: 'iPhone 15 Pro Max 256GB', bookedBy: 'Annette Black', startDate: '2026-07-12T09:00:00Z', endDate: '2026-07-12T17:00:00Z', status: 'Confirmed' }
];

export let mockNotifications: Notification[] = [
  { id: 'NTF-001', title: 'Asset Return Alert', message: 'MacBook Pro AST-001 is overdue for maintenance return.', type: 'warning', timestamp: '2 hours ago', isRead: false },
  { id: 'NTF-002', title: 'New Transfer Request', message: 'Transfer request submitted for iPad Pro AST-003 by Cody Fisher.', type: 'info', timestamp: '1 day ago', isRead: false },
  { id: 'NTF-003', title: 'Audit Completed', message: 'Q2 2026 Hardware Audit report has been generated.', type: 'success', timestamp: '3 days ago', isRead: true },
  { id: 'NTF-004', title: 'Maintenance Required', message: 'Cisco Switch AST-005 has been moved to maintenance.', type: 'error', timestamp: '4 days ago', isRead: true }
];

// Helper functions to manage state dynamically in memory
export const getAssets = () => mockAssets;
export const getAllocations = () => mockAllocations;
export const getTransfers = () => mockTransfers;
export const getMaintenance = () => mockMaintenance;
export const getAudits = () => mockAudits;
export const getBookings = () => mockBookings;
export const getNotifications = () => mockNotifications;

export const updateAssetStatus = (id: string, status: Asset['status']) => {
  mockAssets = mockAssets.map(a => a.id === id ? { ...a, status } : a);
};

export const addAllocation = (allocation: Omit<Allocation, 'id'>) => {
  const id = `ALC-00${mockAllocations.length + 1}`;
  const newAlc = { ...allocation, id } as Allocation;
  mockAllocations = [newAlc, ...mockAllocations];
  return newAlc;
};

export const updateAllocationStatus = (id: string, status: Allocation['status']) => {
  mockAllocations = mockAllocations.map(a => a.id === id ? { ...a, status } : a);
};

export const updateTransferStatus = (id: string, status: TransferRequest['status']) => {
  mockTransfers = mockTransfers.map(t => {
    if (t.id === id) {
      const updated = { ...t, status };
      // If approved, update allocation and asset status
      if (status === 'Approved') {
        const asset = mockAssets.find(a => a.id === t.assetId);
        if (asset) {
          // If asset was already allocated, update that allocation, else create new
          const existingAlcIndex = mockAllocations.findIndex(a => a.assetId === t.assetId && a.status === 'Active');
          if (existingAlcIndex > -1) {
            // End existing allocation
            mockAllocations[existingAlcIndex].status = 'Returned';
          }
          // Create new allocation
          addAllocation({
            assetId: t.assetId,
            assetName: t.assetName,
            serialNumber: t.serialNumber,
            allocatedTo: t.toEmployee,
            allocatedToEmail: `${t.toEmployee.toLowerCase().replace(' ', '.')}@assetflow.com`,
            department: t.toDepartment,
            allocatedDate: new Date().toISOString().split('T')[0],
            status: 'Active'
          });
          updateAssetStatus(t.assetId, 'Allocated');
        }
      }
      return updated;
    }
    return t;
  });
};

export const addMaintenanceRequest = (req: Omit<MaintenanceRequest, 'id' | 'requestedDate' | 'status'>) => {
  const id = `MNT-00${mockMaintenance.length + 1}`;
  const newReq: MaintenanceRequest = {
    ...req,
    id,
    requestedDate: new Date().toISOString().split('T')[0],
    status: 'Pending'
  };
  mockMaintenance = [newReq, ...mockMaintenance];
  updateAssetStatus(req.assetId, 'Maintenance');
  return newReq;
};

export const addBooking = (booking: Omit<Booking, 'id' | 'status'>) => {
  const id = `BKG-00${mockBookings.length + 1}`;
  const newBkg: Booking = { ...booking, id, status: 'Confirmed' };
  mockBookings = [newBkg, ...mockBookings];
  updateAssetStatus(booking.assetId, 'Reserved');
  return newBkg;
};

export const addAsset = (asset: Omit<Asset, 'id' | 'status'>) => {
  const id = `AST-0${mockAssets.length + 1}`;
  const newAsset: Asset = { ...asset, id, status: 'Available' };
  mockAssets = [newAsset, ...mockAssets];
  return newAsset;
};

export const markNotificationsAsRead = () => {
  mockNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
};
