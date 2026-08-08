const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { assets: true } },
        assets: { select: { purchaseValue: true } },
      },
      orderBy: { name: 'asc' },
    });

    const mapped = categories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      warrantyPeriod: c.warrantyPeriod,
      depreciationRate: c.depreciationRate,
      assetsCount: c._count.assets,
      totalValue: c.assets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0),
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, warrantyPeriod, depreciationRate } = req.body;

    if (!name) return res.status(400).json({ error: 'Category name is required.' });

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        warrantyPeriod: warrantyPeriod ? parseInt(warrantyPeriod) : null,
        depreciationRate: depreciationRate ? parseFloat(depreciationRate) : null,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Category Created',
        description: `Asset category "${name}" created.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'P2002') return res.status(409).json({ error: 'A category with this name already exists.' });
    res.status(500).json({ error: 'Failed to create category.' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, warrantyPeriod, depreciationRate } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(warrantyPeriod !== undefined && { warrantyPeriod: warrantyPeriod ? parseInt(warrantyPeriod) : null }),
        ...(depreciationRate !== undefined && { depreciationRate: depreciationRate ? parseFloat(depreciationRate) : null }),
      },
    });

    res.status(200).json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category.' });
  }
};
