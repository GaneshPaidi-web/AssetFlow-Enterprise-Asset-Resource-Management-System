const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllAssets = async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const { name, serialNumber, category, department, purchaseValue, location, status } = req.body;
    const asset = await prisma.asset.create({
      data: {
        name,
        serialNumber,
        category,
        department: department || 'Unassigned',
        status: status || 'Available',
        purchaseDate: new Date(),
        purchaseValue: parseFloat(purchaseValue),
        location: location || 'San Francisco HQ'
      }
    });
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create asset' });
  }
};
