const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllAllocations = async (req, res) => {
  try {
    const { role, departmentId, id: userId } = req.user;
    let whereClause = {};

    if (role === 'Department Head') {
      whereClause = { departmentId };
    } else if (role === 'Employee') {
      whereClause = { userId };
    }

    const allocations = await prisma.allocation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { asset: true, user: true, department: true }
    });
    const mapped = allocations.map(a => ({
      id: a.id,
      assetId: a.assetId,
      assetName: a.asset ? a.asset.name : 'Unknown',
      serialNumber: a.asset ? a.asset.serialNumber : 'Unknown',
      allocatedTo: a.user ? a.user.name : 'Unknown',
      allocatedToEmail: a.user ? a.user.email : 'Unknown',
      department: a.department ? a.department.name : 'Unassigned',
      allocatedDate: a.allocatedDate.toISOString().split('T')[0],
      status: a.status
    }));
    res.status(200).json(mapped);
  } catch (error) {
    console.error('Fetch allocations error:', error);
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
};

exports.createAllocation = async (req, res) => {
  try {
    const { assetId, allocatedTo, department, dueDate, status } = req.body;
    
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    if (!asset.isShared && (asset.status === 'Allocated' || asset.status === 'Reserved')) {
      return res.status(409).json({ 
        error: `Conflict: Asset is already ${asset.status.toLowerCase()}.`,
        conflict: true 
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
          passwordHash: 'placeholder_hash_since_mock_user',
          role: 'Employee'
        }
      });
    }

    // Find or create department
    let dept = null;
    if (department) {
      dept = await prisma.department.findUnique({ where: { name: department } });
      if (!dept) {
        dept = await prisma.department.create({ data: { name: department } });
      }
    }

    const allocation = await prisma.allocation.create({
      data: {
        assetId,
        userId: user.id,
        departmentId: dept ? dept.id : null,
        status: status || 'Active',
        allocatedDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: { asset: true, user: true, department: true }
    });

    await prisma.asset.update({
      where: { id: assetId },
      data: { status: 'Allocated', departmentId: dept ? dept.id : null }
    });

    res.status(201).json({
      id: allocation.id,
      assetId: allocation.assetId,
      assetName: allocation.asset.name,
      serialNumber: allocation.asset.serialNumber,
      allocatedTo: allocation.user.name,
      allocatedToEmail: allocation.user.email,
      department: allocation.department ? allocation.department.name : 'Unassigned',
      allocatedDate: allocation.allocatedDate.toISOString().split('T')[0],
      dueDate: allocation.dueDate ? allocation.dueDate.toISOString().split('T')[0] : null,
      status: allocation.status
    });
  } catch (error) {
    console.error('Allocation error:', error);
    res.status(500).json({ error: 'Failed to create allocation' });
  }
};

exports.returnAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const allocation = await prisma.allocation.update({
      where: { id },
      data: { status: 'Returned' },
      include: { asset: true }
    });
    
    // Update asset status to Available
    if (allocation.assetId) {
      await prisma.asset.update({
        where: { id: allocation.assetId },
        data: { status: 'Available' }
      });
    }
    res.status(200).json(allocation);
  } catch (error) {
    console.error('Return allocation error:', error);
    res.status(500).json({ error: 'Failed to return allocation' });
  }
};

exports.initiateReturn = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if user owns the allocation
    const existing = await prisma.allocation.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to return this asset' });
    }
    
    const allocation = await prisma.allocation.update({
      where: { id },
      data: { status: 'Pending Return' },
    });
    res.status(200).json(allocation);
  } catch (error) {
    console.error('Initiate return error:', error);
    res.status(500).json({ error: 'Failed to initiate return' });
  }
};
