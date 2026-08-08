const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { employees: true, assets: true } },
        assets: { select: { purchaseValue: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const mapped = departments.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      status: d.status,
      manager: d.manager ? d.manager.name : 'Unassigned',
      managerId: d.managerId,
      parentDepartmentId: d.parentDepartmentId,
      employeeCount: d._count.employees,
      assetsCount: d._count.assets,
      totalValue: d.assets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0),
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments.' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, managerId, parentDepartmentId } = req.body;

    if (!name) return res.status(400).json({ error: 'Department name is required.' });

    const dept = await prisma.department.create({
      data: {
        name,
        code: code || null,
        managerId: managerId || null,
        parentDepartmentId: parentDepartmentId || null,
        status: 'Active',
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Department Created',
        description: `Department "${name}" created.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    res.status(201).json(dept);
  } catch (error) {
    console.error('Create department error:', error);
    if (error.code === 'P2002') return res.status(409).json({ error: 'A department with this name already exists.' });
    res.status(500).json({ error: 'Failed to create department.' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, managerId, parentDepartmentId, status } = req.body;

    const dept = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code !== undefined && { code }),
        ...(managerId !== undefined && { managerId: managerId || null }),
        ...(parentDepartmentId !== undefined && { parentDepartmentId: parentDepartmentId || null }),
        ...(status && { status }),
      },
    });

    res.status(200).json(dept);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Failed to update department.' });
  }
};

exports.deactivateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await prisma.department.update({
      where: { id },
      data: { status: 'Inactive' },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Department Deactivated',
        description: `Department "${dept.name}" deactivated.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    res.status(200).json(dept);
  } catch (error) {
    console.error('Deactivate department error:', error);
    res.status(500).json({ error: 'Failed to deactivate department.' });
  }
};
