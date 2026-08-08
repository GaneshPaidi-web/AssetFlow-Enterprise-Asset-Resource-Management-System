const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllAllocations = async (req, res) => {
  try {
    const allocations = await prisma.allocation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { asset: true },
    });

    const mapped = allocations.map(a => ({
      id: a.id,
      assetId: a.assetId,
      assetName: a.assetName,
      serialNumber: a.serialNumber,
      allocatedTo: a.allocatedTo,
      allocatedToEmail: a.allocatedToEmail,
      department: a.departmentName,
      allocatedDate: a.allocatedDate.toISOString().split('T')[0],
      dueDate: a.dueDate ? a.dueDate.toISOString().split('T')[0] : null,
      status: a.status,
      checkInNotes: a.checkInNotes,
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error('Fetch allocations error:', error);
    res.status(500).json({ error: 'Failed to fetch allocations.' });
  }
};

exports.createAllocation = async (req, res) => {
  try {
    const { assetId, allocatedTo, department, dueDate } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });

    // Conflict rule: if asset is already allocated (and not shared), block it
    if (!asset.isShared && (asset.status === 'Allocated' || asset.status === 'Reserved')) {
      // Find who currently holds it
      const currentAlloc = await prisma.allocation.findFirst({
        where: { assetId, status: 'Active' },
      });
      return res.status(409).json({
        error: `Asset is currently ${asset.status.toLowerCase()}.`,
        conflict: true,
        currentHolder: currentAlloc ? currentAlloc.allocatedTo : 'Unknown',
      });
    }

    // Find or create user
    let user = await prisma.user.findFirst({ where: { name: allocatedTo } });
    if (!user) {
      const email = `${allocatedTo.toLowerCase().replace(/\s+/g, '.')}@assetflow.com`;
      user = await prisma.user.create({
        data: {
          name: allocatedTo,
          email,
          passwordHash: 'temp_placeholder',
          role: 'Employee',
        },
      });
    }

    // Find or create department
    let dept = null;
    if (department) {
      dept = await prisma.department.findUnique({ where: { name: department } }).catch(() => null);
      if (!dept) {
        dept = await prisma.department.create({ data: { name: department } });
      }
    }

    const allocation = await prisma.allocation.create({
      data: {
        assetId,
        assetName: asset.name,
        serialNumber: asset.serialNumber,
        userId: user.id,
        allocatedTo: user.name,
        allocatedToEmail: user.email,
        departmentId: dept ? dept.id : null,
        departmentName: dept ? dept.name : 'Unassigned',
        allocatedDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'Active',
      },
    });

    // Update asset status
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        status: 'Allocated',
        departmentId: dept ? dept.id : asset.departmentId,
        departmentName: dept ? dept.name : asset.departmentName,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Asset Allocated',
        description: `${asset.name} (${asset.tag}) allocated to ${user.name} in ${dept ? dept.name : 'Unassigned'}.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Asset Assigned',
        message: `${asset.name} has been allocated to ${user.name}.`,
        type: 'success',
        isRead: false,
      },
    });

    res.status(201).json({
      id: allocation.id,
      assetId: allocation.assetId,
      assetName: allocation.assetName,
      serialNumber: allocation.serialNumber,
      allocatedTo: allocation.allocatedTo,
      allocatedToEmail: allocation.allocatedToEmail,
      department: allocation.departmentName,
      allocatedDate: allocation.allocatedDate.toISOString().split('T')[0],
      dueDate: allocation.dueDate ? allocation.dueDate.toISOString().split('T')[0] : null,
      status: allocation.status,
    });
  } catch (error) {
    console.error('Allocation error:', error);
    res.status(500).json({ error: 'Failed to create allocation.' });
  }
};

exports.returnAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInNotes } = req.body;

    const allocation = await prisma.allocation.update({
      where: { id },
      data: {
        status: 'Returned',
        checkInNotes: checkInNotes || null,
      },
      include: { asset: true },
    });

    // Reset asset to Available
    await prisma.asset.update({
      where: { id: allocation.assetId },
      data: { status: 'Available' },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Asset Returned',
        description: `${allocation.assetName} returned by ${allocation.allocatedTo}.${checkInNotes ? ` Notes: ${checkInNotes}` : ''}`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Asset Returned',
        message: `${allocation.assetName} has been returned and is now available.`,
        type: 'info',
        isRead: false,
      },
    });

    res.status(200).json({ ...allocation, status: 'Returned' });
  } catch (error) {
    console.error('Return allocation error:', error);
    res.status(500).json({ error: 'Failed to return allocation.' });
  }
};

exports.initiateReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const allocation = await prisma.allocation.update({
      where: { id },
      data: { status: 'Pending Return' },
    });
    res.status(200).json(allocation);
  } catch (error) {
    console.error('Initiate return error:', error);
    res.status(500).json({ error: 'Failed to initiate return.' });
  }
};
