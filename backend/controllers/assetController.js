const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Auto-generate sequential asset tag e.g. AF-0001
const generateTag = async () => {
  const count = await prisma.asset.count();
  const next = count + 1;
  return `AF-${String(next).padStart(4, '0')}`;
};

exports.getAllAssets = async (req, res) => {
  try {
    const { tag, category, department, location, status, search } = req.query;

    const where = {};
    if (tag) where.tag = { contains: tag, mode: 'insensitive' };
    if (category) where.categoryName = { contains: category, mode: 'insensitive' };
    if (department) where.departmentName = { contains: department, mode: 'insensitive' };
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { tag: { contains: search, mode: 'insensitive' } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets.' });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset.' });
  }
};

exports.getAssetHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const [allocations, maintenance] = await Promise.all([
      prisma.allocation.findMany({
        where: { assetId: id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.maintenanceRequest.findMany({
        where: { assetId: id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.status(200).json({ allocations, maintenance });
  } catch (error) {
    console.error('Get asset history error:', error);
    res.status(500).json({ error: 'Failed to fetch asset history.' });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const {
      name, serialNumber, categoryId, categoryName, departmentId, departmentName,
      purchaseValue, location, condition, isShared, purchaseDate, photoUrl, documentUrl
    } = req.body;

    if (!name || !serialNumber) {
      return res.status(400).json({ error: 'Name and serial number are required.' });
    }

    const tag = await generateTag();

    const asset = await prisma.asset.create({
      data: {
        name,
        serialNumber,
        tag,
        categoryId: categoryId || null,
        categoryName: categoryName || 'Uncategorized',
        departmentId: departmentId || null,
        departmentName: departmentName || 'Unassigned',
        status: 'Available',
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        purchaseValue: parseFloat(purchaseValue) || 0,
        location: location || 'Main Office',
        condition: condition || 'Good',
        isShared: isShared === true || isShared === 'true',
        photoUrl: photoUrl || null,
        documentUrl: documentUrl || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Asset Registered',
        description: `Asset "${name}" (${tag}) registered by ${req.user?.name || 'System'}.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    res.status(201).json(asset);
  } catch (error) {
    console.error('Create asset error:', error);
    if (error.code === 'P2002') return res.status(409).json({ error: 'An asset with this serial number already exists.' });
    res.status(500).json({ error: 'Failed to create asset.' });
  }
};

exports.updateAssetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const asset = await prisma.asset.update({
      where: { id },
      data: { status },
    });

    res.status(200).json(asset);
  } catch (error) {
    console.error('Update asset status error:', error);
    res.status(500).json({ error: 'Failed to update asset status.' });
  }
};
