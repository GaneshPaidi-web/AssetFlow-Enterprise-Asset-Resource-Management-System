const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllAllocations = async (req, res) => {
  try {
    const allocations = await prisma.allocation.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(allocations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
};

exports.createAllocation = async (req, res) => {
  try {
    const { assetId, allocatedTo, department, status } = req.body;
    
    // Find asset to get name and serial number
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const allocation = await prisma.allocation.create({
      data: {
        assetId,
        assetName: asset.name,
        serialNumber: asset.serialNumber,
        allocatedTo,
        allocatedToEmail: `${allocatedTo.toLowerCase().replace(/\s+/g, '.')}@assetflow.com`,
        department: department || asset.department,
        status: status || 'Active',
        allocatedDate: new Date()
      }
    });

    // Update asset status
    await prisma.asset.update({
      where: { id: assetId },
      data: { 
        status: 'Allocated',
        department: department || asset.department
      }
    });
    res.status(201).json(allocation);
  } catch (error) {
    console.error('Create allocation error:', error);
    res.status(500).json({ error: 'Failed to create allocation' });
  }
};

exports.returnAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const allocation = await prisma.allocation.update({
      where: { id },
      data: { status: 'Returned' }
    });
    // Update asset status to Available
    await prisma.asset.update({
      where: { id: allocation.assetId },
      data: { status: 'Available' }
    });
    res.status(200).json(allocation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to return allocation' });
  }
};
