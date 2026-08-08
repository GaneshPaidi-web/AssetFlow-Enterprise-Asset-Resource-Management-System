const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.activityLog.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.transferRequest.deleteMany({});
  await prisma.allocation.deleteMany({});
  await prisma.auditItem.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.auditCycle.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('Seeding categories...');
  const catHardware = await prisma.category.create({ data: { name: 'IT Hardware', description: 'Computers, laptops, tablets, and phones', warrantyPeriod: 36, depreciationRate: 20.0 } });
  const catNetwork = await prisma.category.create({ data: { name: 'Networking', description: 'Switches, routers, firewalls, and access points', warrantyPeriod: 60, depreciationRate: 15.0 } });
  const catFacilities = await prisma.category.create({ data: { name: 'Facilities', description: 'Projectors, display screens, and appliances', warrantyPeriod: 24, depreciationRate: 10.0 } });
  const catFurniture = await prisma.category.create({ data: { name: 'Furniture', description: 'Ergonomic chairs, standing desks, conference tables', warrantyPeriod: 120, depreciationRate: 5.0 } });
  const catAccessories = await prisma.category.create({ data: { name: 'Accessories', description: 'Keyboards, mice, headsets, and adapters', warrantyPeriod: 12, depreciationRate: 33.3 } });

  console.log('Seeding departments...');
  const deptIT = await prisma.department.create({ data: { name: 'IT', code: 'IT-DEPT', status: 'Active' } });
  const deptEng = await prisma.department.create({ data: { name: 'Engineering', code: 'ENG-DEPT', status: 'Active' } });
  const deptOps = await prisma.department.create({ data: { name: 'Operations', code: 'OPS-DEPT', status: 'Active' } });
  const deptFin = await prisma.department.create({ data: { name: 'Finance', code: 'FIN-DEPT', status: 'Active' } });
  const deptHR = await prisma.department.create({ data: { name: 'HR', code: 'HR-DEPT', status: 'Active' } });
  const deptMarketing = await prisma.department.create({ data: { name: 'Marketing', code: 'MKT-DEPT', status: 'Active' } });
  const deptLegal = await prisma.department.create({ data: { name: 'Legal', code: 'LGL-DEPT', status: 'Inactive' } });

  console.log('Seeding users/employees...');
  // We store plaintext passwords since this is a local sandbox environment matching original credentials check
  const uAdmin = await prisma.user.create({
    data: {
      name: 'Kristin Watson',
      email: 'admin@assetflow.com',
      passwordHash: 'password',
      role: 'Admin',
      status: 'Active',
      site: 'San Francisco HQ',
      departmentId: deptIT.id
    }
  });

  const uManager = await prisma.user.create({
    data: {
      name: 'James Carter',
      email: 'manager@assetflow.com',
      passwordHash: 'password',
      role: 'Asset Manager',
      status: 'Active',
      site: 'Chicago Office',
      departmentId: deptOps.id
    }
  });

  const uDeptHead = await prisma.user.create({
    data: {
      name: 'Priya Nair',
      email: 'depthead@assetflow.com',
      passwordHash: 'password',
      role: 'Department Head',
      status: 'Active',
      site: 'New York Branch',
      departmentId: deptEng.id
    }
  });

  const uEmployee = await prisma.user.create({
    data: {
      name: 'Marcus Lee',
      email: 'employee@assetflow.com',
      passwordHash: 'password',
      role: 'Employee',
      status: 'Active',
      site: 'Remote',
      departmentId: deptFin.id
    }
  });

  const uAisha = await prisma.user.create({
    data: {
      name: 'Aisha Patel',
      email: 'aisha.patel@assetflow.com',
      passwordHash: 'password',
      role: 'Employee',
      status: 'Active',
      site: 'San Francisco HQ',
      departmentId: deptHR.id
    }
  });

  const uCody = await prisma.user.create({
    data: {
      name: 'Cody Fisher',
      email: 'cody.fisher@assetflow.com',
      passwordHash: 'password',
      role: 'Employee',
      status: 'Active',
      site: 'Chicago Office',
      departmentId: deptMarketing.id
    }
  });

  // Assign department heads
  await prisma.department.update({ where: { id: deptIT.id }, data: { managerId: uAdmin.id } });
  await prisma.department.update({ where: { id: deptEng.id }, data: { managerId: uDeptHead.id } });
  await prisma.department.update({ where: { id: deptOps.id }, data: { managerId: uManager.id } });

  console.log('Seeding assets...');
  const assets = [
    { name: 'MacBook Pro 16" M3 Max', serialNumber: 'C02F87XMD6FF', tag: 'AF-0001', categoryId: catHardware.id, categoryName: 'IT Hardware', departmentId: deptEng.id, departmentName: 'Engineering', status: 'Allocated', purchaseDate: new Date('2025-10-15'), purchaseValue: 3499, location: 'San Francisco HQ', isShared: false, condition: 'Good' },
    { name: 'Dell XPS 15 9530', serialNumber: '5D9V3K2', tag: 'AF-0002', categoryId: catHardware.id, categoryName: 'IT Hardware', departmentId: deptFin.id, departmentName: 'Finance', status: 'Allocated', purchaseDate: new Date('2025-11-02'), purchaseValue: 2199, location: 'San Francisco HQ', isShared: false, condition: 'Good' },
    { name: 'iPad Pro 12.9" M2', serialNumber: 'DLXGF77DQPTD', tag: 'AF-0003', categoryId: catHardware.id, categoryName: 'IT Hardware', departmentId: deptMarketing.id, departmentName: 'Marketing', status: 'Available', purchaseDate: new Date('2025-06-20'), purchaseValue: 1099, location: 'New York Office', isShared: true, condition: 'Good' },
    { name: 'ThinkPad X1 Carbon Gen 11', serialNumber: 'PF2Z5J9B', tag: 'AF-0004', categoryId: catHardware.id, categoryName: 'IT Hardware', departmentId: deptFin.id, departmentName: 'Finance', status: 'Allocated', purchaseDate: new Date('2025-08-12'), purchaseValue: 1899, location: 'New York Office', isShared: false, condition: 'Good' },
    { name: 'Cisco Catalyst 9300 Switch', serialNumber: 'FOC2415V0SL', tag: 'AF-0005', categoryId: catNetwork.id, categoryName: 'Networking', departmentId: deptIT.id, departmentName: 'IT', status: 'Under Maintenance', purchaseDate: new Date('2024-03-10'), purchaseValue: 4500, location: 'San Francisco Server Room', isShared: false, condition: 'Fair' },
    { name: 'iPhone 15 Pro Max 256GB', serialNumber: 'MQ8G3ZP/A', tag: 'AF-0006', categoryId: catHardware.id, categoryName: 'IT Hardware', departmentId: deptMarketing.id, departmentName: 'Marketing', status: 'Reserved', purchaseDate: new Date('2025-09-25'), purchaseValue: 1199, location: 'San Francisco HQ', isShared: true, condition: 'New' },
    { name: 'Logitech MX Master 3S', serialNumber: '2230LZ089FD', tag: 'AF-0007', categoryId: catAccessories.id, categoryName: 'Accessories', departmentId: deptEng.id, departmentName: 'Engineering', status: 'Available', purchaseDate: new Date('2025-01-18'), purchaseValue: 99, location: 'London Hub', isShared: true, condition: 'Good' },
    { name: 'Sony WH-1000XM5 Headset', serialNumber: '78401349082', tag: 'AF-0008', categoryId: catAccessories.id, categoryName: 'Accessories', departmentId: deptEng.id, departmentName: 'Engineering', status: 'Allocated', purchaseDate: new Date('2025-02-14'), purchaseValue: 399, location: 'San Francisco HQ', isShared: false, condition: 'Good' },
    { name: 'Epson Pro EX11000 Projector', serialNumber: 'W8G8920194F', tag: 'AF-0009', categoryId: catFacilities.id, categoryName: 'Facilities', departmentId: deptHR.id, departmentName: 'HR', status: 'Available', purchaseDate: new Date('2024-07-05'), purchaseValue: 899, location: 'Conference Room C', isShared: true, condition: 'Good' },
    { name: 'Herman Miller Aeron Chair', serialNumber: 'HM-A-948190', tag: 'AF-0010', categoryId: catFurniture.id, categoryName: 'Furniture', departmentId: deptHR.id, departmentName: 'HR', status: 'Allocated', purchaseDate: new Date('2024-01-20'), purchaseValue: 1450, location: 'San Francisco HQ', isShared: false, condition: 'Good' }
  ];

  const dbAssets = [];
  for (const asset of assets) {
    const dbAsset = await prisma.asset.create({ data: asset });
    dbAssets.push(dbAsset);
  }

  console.log('Seeding allocations...');
  // Jane Cooper (Priya Nair in demo), John Doe, Albert Flores
  const allocations = [
    { assetId: dbAssets[0].id, assetName: dbAssets[0].name, serialNumber: dbAssets[0].serialNumber, userId: uDeptHead.id, allocatedTo: uDeptHead.name, allocatedToEmail: uDeptHead.email, departmentId: deptEng.id, departmentName: 'Engineering', allocatedDate: new Date('2025-10-16'), status: 'Active', dueDate: new Date('2026-10-16') },
    { assetId: dbAssets[1].id, assetName: dbAssets[1].name, serialNumber: dbAssets[1].serialNumber, userId: uEmployee.id, allocatedTo: uEmployee.name, allocatedToEmail: uEmployee.email, departmentId: deptFin.id, departmentName: 'Finance', allocatedDate: new Date('2025-11-03'), status: 'Active', dueDate: new Date('2026-06-01') }, // Overdue return
    { assetId: dbAssets[3].id, assetName: dbAssets[3].name, serialNumber: dbAssets[3].serialNumber, userId: uAisha.id, allocatedTo: uAisha.name, allocatedToEmail: uAisha.email, departmentId: deptFin.id, departmentName: 'Finance', allocatedDate: new Date('2025-08-13'), status: 'Active', dueDate: new Date('2026-08-13') },
    { assetId: dbAssets[7].id, assetName: dbAssets[7].name, serialNumber: dbAssets[7].serialNumber, userId: uDeptHead.id, allocatedTo: uDeptHead.name, allocatedToEmail: uDeptHead.email, departmentId: deptEng.id, departmentName: 'Engineering', allocatedDate: new Date('2025-02-15'), status: 'Active', dueDate: new Date('2026-02-15') },
    { assetId: dbAssets[9].id, assetName: dbAssets[9].name, serialNumber: dbAssets[9].serialNumber, userId: uAdmin.id, allocatedTo: uAdmin.name, allocatedToEmail: uAdmin.email, departmentId: deptHR.id, departmentName: 'HR', allocatedDate: new Date('2024-01-21'), status: 'Active', dueDate: new Date('2025-01-21') } // Overdue return
  ];

  for (const alc of allocations) {
    await prisma.allocation.create({ data: alc });
  }

  console.log('Seeding transfers...');
  const transfers = [
    { assetId: dbAssets[2].id, assetName: dbAssets[2].name, serialNumber: dbAssets[2].serialNumber, fromEmployee: 'Unassigned', toEmployee: uCody.name, fromDepartment: 'Marketing', toDepartment: 'Marketing', requestedDate: new Date('2026-07-10'), status: 'Pending' },
    { assetId: dbAssets[6].id, assetName: dbAssets[6].name, serialNumber: dbAssets[6].serialNumber, fromEmployee: 'Unassigned', toEmployee: uEmployee.name, fromDepartment: 'Engineering', toDepartment: 'Finance', requestedDate: new Date('2026-07-11'), status: 'Pending' }
  ];

  for (const trf of transfers) {
    await prisma.transferRequest.create({ data: trf });
  }

  console.log('Seeding maintenance...');
  const maintenance = [
    { assetId: dbAssets[4].id, assetName: dbAssets[4].name, description: 'Firmware upgrade failure, switch loops on boot.', priority: 'High', status: 'In Progress', requestedDate: new Date('2026-07-08'), facilityHealth: 'Normal' }
  ];

  for (const mnt of maintenance) {
    await prisma.maintenanceRequest.create({ data: mnt });
  }

  console.log('Seeding audits...');
  const audit = await prisma.auditCycle.create({
    data: {
      name: 'Q3 2026 IT Physical Audit',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-09-30'),
      auditor: 'James Carter',
      status: 'In Progress',
      progress: 33.3,
      missingAssets: 1,
      discrepancies: 1
    }
  });

  await prisma.auditItem.create({ data: { auditCycleId: audit.id, assetId: dbAssets[0].id, status: 'Verified', notes: 'Verified at desk of Priya' } });
  await prisma.auditItem.create({ data: { auditCycleId: audit.id, assetId: dbAssets[1].id, status: 'Missing', notes: 'Not found at regular work site' } });
  await prisma.auditItem.create({ data: { auditCycleId: audit.id, assetId: dbAssets[4].id, status: 'Damaged', notes: 'Reported with boot-looping issue' } });

  console.log('Seeding bookings...');
  const bookings = [
    { assetId: dbAssets[8].id, assetName: dbAssets[8].name, bookedBy: uCody.name, startDate: new Date('2026-07-13T10:00:00Z'), endDate: new Date('2026-07-13T12:00:00Z'), status: 'Confirmed', userId: uCody.id },
    { assetId: dbAssets[2].id, assetName: dbAssets[2].name, bookedBy: uDeptHead.name, startDate: new Date('2026-07-14T14:00:00Z'), endDate: new Date('2026-07-14T16:00:00Z'), status: 'Confirmed', userId: uDeptHead.id }
  ];

  for (const bkg of bookings) {
    await prisma.booking.create({ data: bkg });
  }

  console.log('Seeding notifications...');
  const notifications = [
    { title: 'Asset Return Alert', message: 'Herman Miller Chair AF-0010 is overdue for return.', type: 'warning', isRead: false },
    { title: 'New Transfer Request', message: `Transfer request submitted for iPad Pro by ${uCody.name}.`, type: 'info', isRead: false }
  ];

  for (const ntf of notifications) {
    await prisma.notification.create({ data: ntf });
  }

  console.log('Seeding activity logs...');
  const activityLogs = [
    { action: 'Asset Allocated', description: `MacBook Pro AF-0001 allocated to ${uDeptHead.name}`, userId: uManager.id, userName: uManager.name },
    { action: 'Maintenance Ticket Raised', description: `Boot-looping issue reported on Cisco Switch AF-0005`, userId: uAdmin.id, userName: uAdmin.name }
  ];

  for (const log of activityLogs) {
    await prisma.activityLog.create({ data: log });
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
