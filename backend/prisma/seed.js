const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.booking.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.transferRequest.deleteMany({});
  await prisma.allocation.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.auditCycle.deleteMany({});

  console.log('Seeding assets...');
  const assets = [
    { id: 'AST-001', name: 'MacBook Pro 16" M3 Max', serialNumber: 'C02F87XMD6FF', category: 'IT Hardware', department: 'Engineering', status: 'Allocated', purchaseDate: new Date('2025-10-15'), purchaseValue: 3499, location: 'San Francisco HQ' },
    { id: 'AST-002', name: 'Dell XPS 15 9530', serialNumber: '5D9V3K2', category: 'IT Hardware', department: 'Product', status: 'Allocated', purchaseDate: new Date('2025-11-02'), purchaseValue: 2199, location: 'San Francisco HQ' },
    { id: 'AST-003', name: 'iPad Pro 12.9" M2', serialNumber: 'DLXGF77DQPTD', category: 'IT Hardware', department: 'Marketing', status: 'Available', purchaseDate: new Date('2025-06-20'), purchaseValue: 1099, location: 'New York Office' },
    { id: 'AST-004', name: 'ThinkPad X1 Carbon Gen 11', serialNumber: 'PF2Z5J9B', category: 'IT Hardware', department: 'Finance', status: 'Allocated', purchaseDate: new Date('2025-08-12'), purchaseValue: 1899, location: 'New York Office' },
    { id: 'AST-005', name: 'Cisco Catalyst 9300 Switch', serialNumber: 'FOC2415V0SL', category: 'Networking', department: 'IT', status: 'Maintenance', purchaseDate: new Date('2024-03-10'), purchaseValue: 4500, location: 'San Francisco Server Room' },
    { id: 'AST-006', name: 'iPhone 15 Pro Max 256GB', serialNumber: 'MQ8G3ZP/A', category: 'IT Hardware', department: 'Marketing', status: 'Reserved', purchaseDate: new Date('2025-09-25'), purchaseValue: 1199, location: 'San Francisco HQ' },
    { id: 'AST-007', name: 'Logitech MX Master 3S', serialNumber: '2230LZ089FD', category: 'Accessories', department: 'Design', status: 'Available', purchaseDate: new Date('2025-01-18'), purchaseValue: 99, location: 'London Hub' },
    { id: 'AST-008', name: 'Sony WH-1000XM5 Headset', serialNumber: '78401349082', category: 'Accessories', department: 'Engineering', status: 'Allocated', purchaseDate: new Date('2025-02-14'), purchaseValue: 399, location: 'San Francisco HQ' },
    { id: 'AST-009', name: 'Epson Pro EX11000 Projector', serialNumber: 'W8G8920194F', category: 'Facilities', department: 'HR', status: 'Available', purchaseDate: new Date('2024-07-05'), purchaseValue: 899, location: 'Conference Room C' },
    { id: 'AST-010', name: 'Herman Miller Aeron Chair', serialNumber: 'HM-A-948190', category: 'Furniture', department: 'HR', status: 'Allocated', purchaseDate: new Date('2024-01-20'), purchaseValue: 1450, location: 'San Francisco HQ' },
    { id: 'AST-011', name: 'Keysight Digital Oscilloscope', serialNumber: 'MY59281023', category: 'Lab Equipment', department: 'R&D', status: 'Maintenance', purchaseDate: new Date('2023-11-12'), purchaseValue: 12500, location: 'R&D Hardware Lab' },
    { id: 'AST-012', name: 'Dell UltraSharp 32" 4K Monitor', serialNumber: 'CN-0YT32D-74445', category: 'IT Hardware', department: 'Design', status: 'Available', purchaseDate: new Date('2025-04-30'), purchaseValue: 999, location: 'London Hub' },
    { id: 'AST-013', name: 'Ubiquiti UniFi Dream Machine', serialNumber: 'U-UDM-PRO-889', category: 'Networking', department: 'IT', status: 'Allocated', purchaseDate: new Date('2024-09-18'), purchaseValue: 379, location: 'London Server Room' },
    { id: 'AST-014', name: 'Steelcase Gesture Desk Chair', serialNumber: 'SC-G-002341', category: 'Furniture', department: 'HR', status: 'Disposed', purchaseDate: new Date('2022-05-10'), purchaseValue: 1100, location: 'Scrap Pile Yard' },
    { id: 'AST-015', name: 'Canon EOS R5 Mirrorless Camera', serialNumber: 'DS126839', category: 'Lab Equipment', department: 'Marketing', status: 'Lost', purchaseDate: new Date('2024-06-11'), purchaseValue: 3899, location: 'Unknown' }
  ];

  for (const asset of assets) {
    await prisma.asset.create({ data: asset });
  }

  console.log('Seeding allocations...');
  const allocations = [
    { id: 'ALC-001', assetId: 'AST-001', assetName: 'MacBook Pro 16" M3 Max', serialNumber: 'C02F87XMD6FF', allocatedTo: 'Jane Cooper', allocatedToEmail: 'jane.cooper@assetflow.com', department: 'Engineering', allocatedDate: new Date('2025-10-16'), status: 'Active' },
    { id: 'ALC-002', assetId: 'AST-002', assetName: 'Dell XPS 15 9530', serialNumber: '5D9V3K2', allocatedTo: 'John Doe', allocatedToEmail: 'john.doe@assetflow.com', department: 'Product', allocatedDate: new Date('2025-11-03'), status: 'Active' },
    { id: 'ALC-003', assetId: 'AST-004', assetName: 'ThinkPad X1 Carbon Gen 11', serialNumber: 'PF2Z5J9B', allocatedTo: 'Albert Flores', allocatedToEmail: 'albert.flores@assetflow.com', department: 'Finance', allocatedDate: new Date('2025-08-13'), status: 'Active' },
    { id: 'ALC-004', assetId: 'AST-008', assetName: 'Sony WH-1000XM5 Headset', serialNumber: '78401349082', allocatedTo: 'Jane Cooper', allocatedToEmail: 'jane.cooper@assetflow.com', department: 'Engineering', allocatedDate: new Date('2025-02-15'), status: 'Active' },
    { id: 'ALC-005', assetId: 'AST-010', assetName: 'Herman Miller Aeron Chair', serialNumber: 'HM-A-948190', allocatedTo: 'Kristin Watson', allocatedToEmail: 'kristin.watson@assetflow.com', department: 'HR', allocatedDate: new Date('2024-01-21'), status: 'Active' },
    { id: 'ALC-006', assetId: 'AST-013', assetName: 'Ubiquiti UniFi Dream Machine', serialNumber: 'U-UDM-PRO-889', allocatedTo: 'Guy Hawkins', allocatedToEmail: 'guy.hawkins@assetflow.com', department: 'IT', allocatedDate: new Date('2024-09-20'), status: 'Active' }
  ];

  for (const alc of allocations) {
    await prisma.allocation.create({ data: alc });
  }

  console.log('Seeding transfers...');
  const transfers = [
    { id: 'TRF-001', assetId: 'AST-003', assetName: 'iPad Pro 12.9" M2', serialNumber: 'DLXGF77DQPTD', fromEmployee: 'Unassigned', toEmployee: 'Cody Fisher', fromDepartment: 'Marketing', toDepartment: 'Sales', requestedDate: new Date('2026-07-10'), status: 'Pending' },
    { id: 'TRF-002', assetId: 'AST-007', assetName: 'Logitech MX Master 3S', serialNumber: '2230LZ089FD', fromEmployee: 'Unassigned', toEmployee: 'Esther Howard', fromDepartment: 'Design', toDepartment: 'Engineering', requestedDate: new Date('2026-07-11'), status: 'Pending' },
    { id: 'TRF-003', assetId: 'AST-012', assetName: 'Dell UltraSharp 32" 4K Monitor', serialNumber: 'CN-0YT32D-74445', fromEmployee: 'Unassigned', toEmployee: 'Bessie Cooper', fromDepartment: 'Design', toDepartment: 'Product', requestedDate: new Date('2026-07-09'), status: 'Approved' }
  ];

  for (const trf of transfers) {
    await prisma.transferRequest.create({ data: trf });
  }

  console.log('Seeding maintenance...');
  const maintenance = [
    { id: 'MNT-001', assetId: 'AST-005', assetName: 'Cisco Catalyst 9300 Switch', description: 'Firmware upgrade failure, switch loops on boot.', priority: 'High', status: 'In Progress', requestedDate: new Date('2026-07-08'), facilityHealth: 'Normal' },
    { id: 'MNT-002', assetId: 'AST-011', assetName: 'Keysight Digital Oscilloscope', description: 'Channel 3 calibration check and diagnostic testing.', priority: 'Medium', status: 'Pending', requestedDate: new Date('2026-07-12'), facilityHealth: 'Needs Service' }
  ];

  for (const mnt of maintenance) {
    await prisma.maintenanceRequest.create({ data: mnt });
  }

  console.log('Seeding audits...');
  const audits = [
    { id: 'AUD-001', name: 'Q2 2026 Hardware Audit', startDate: new Date('2026-04-01'), endDate: new Date('2026-06-30'), auditor: 'Robert Fox', status: 'Completed', progress: 100, missingAssets: 2, discrepancies: 5 },
    { id: 'AUD-002', name: 'Global Network Infrastructure Review', startDate: new Date('2026-07-01'), endDate: new Date('2026-09-30'), auditor: 'Darrell Steward', status: 'In Progress', progress: 45, missingAssets: 1, discrepancies: 2 },
    { id: 'AUD-003', name: 'FY2026 Furniture Physical Count', startDate: new Date('2026-10-01'), endDate: new Date('2026-12-31'), auditor: 'Savannah Nguyen', status: 'Pending', progress: 0, missingAssets: 0, discrepancies: 0 }
  ];

  for (const aud of audits) {
    await prisma.auditCycle.create({ data: aud });
  }

  console.log('Seeding bookings...');
  const bookings = [
    { id: 'BKG-001', assetId: 'AST-009', assetName: 'Epson Pro EX11000 Projector', bookedBy: 'Courtney Henry', startDate: new Date('2026-07-13T10:00:00Z'), endDate: new Date('2026-07-13T12:00:00Z'), status: 'Confirmed' },
    { id: 'BKG-002', assetId: 'AST-003', assetName: 'iPad Pro 12.9" M2', bookedBy: 'Darlene Robertson', startDate: new Date('2026-07-14T14:00:00Z'), endDate: new Date('2026-07-14T16:00:00Z'), status: 'Confirmed' },
    { id: 'BKG-003', assetId: 'AST-006', assetName: 'iPhone 15 Pro Max 256GB', bookedBy: 'Annette Black', startDate: new Date('2026-07-12T09:00:00Z'), endDate: new Date('2026-07-12T17:00:00Z'), status: 'Confirmed' }
  ];

  for (const bkg of bookings) {
    await prisma.booking.create({ data: bkg });
  }

  console.log('Seeding notifications...');
  const notifications = [
    { id: 'NTF-001', title: 'Asset Return Alert', message: 'MacBook Pro AST-001 is overdue for maintenance return.', type: 'warning', isRead: false },
    { id: 'NTF-002', title: 'New Transfer Request', message: 'Transfer request submitted for iPad Pro AST-003 by Cody Fisher.', type: 'info', isRead: false },
    { id: 'NTF-003', title: 'Audit Completed', message: 'Q2 2026 Hardware Audit report has been generated.', type: 'success', isRead: true },
    { id: 'NTF-004', title: 'Maintenance Required', message: 'Cisco Switch AST-005 has been moved to maintenance.', type: 'error', isRead: true }
  ];

  for (const ntf of notifications) {
    await prisma.notification.create({ data: ntf });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
