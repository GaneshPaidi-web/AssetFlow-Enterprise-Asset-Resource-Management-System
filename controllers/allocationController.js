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
    const { assetId, assetName, serialNumber, allocatedTo, allocatedToEmail, department, status } = req.body;
    const allocation = await prisma.allocation.create({
      data: {
        assetId,
        assetName,
        serialNumber,
        allocatedTo,
        allocatedToEmail,
        department,
        status: status || 'Active',
        allocatedDate: new Date()
      }
    });
    // Update asset status
    await prisma.asset.update({
      where: { id: assetId },
      data: { status: 'Allocated' }
    });
    res.status(201).json(allocation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create allocation' });
  }
};
