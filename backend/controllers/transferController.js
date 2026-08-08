const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllTransfers = async (req, res) => {
  try {
    const transfers = await prisma.transferRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transfer requests.' });
  }
};

exports.createTransfer = async (req, res) => {
  try {
    const { assetId, toEmployee, toDepartment } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });

    const activeAllocation = await prisma.allocation.findFirst({
      where: { assetId, status: 'Active' },
    });

    const fromEmployee = activeAllocation ? activeAllocation.allocatedTo : 'Unassigned';
    const fromDepartment = activeAllocation ? activeAllocation.departmentName : asset.departmentName;

    const transfer = await prisma.transferRequest.create({
      data: {
        assetId,
        assetName: asset.name,
        serialNumber: asset.serialNumber,
        fromEmployee,
        toEmployee,
        fromDepartment,
        toDepartment: toDepartment || fromDepartment,
        requestedDate: new Date(),
        status: 'Pending',
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Transfer Requested',
        description: `Transfer of ${asset.name} from ${fromEmployee} to ${toEmployee} requested.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'New Transfer Request',
        message: `Transfer request for ${asset.name} submitted from ${fromEmployee} to ${toEmployee}.`,
        type: 'info',
        isRead: false,
      },
    });

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Create transfer error:', error);
    res.status(500).json({ error: 'Failed to create transfer request.' });
  }
};

exports.approveTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const transfer = await tx.transferRequest.findUnique({ where: { id } });
      if (!transfer) throw new Error('Transfer request not found.');

      const updatedTransfer = await tx.transferRequest.update({
        where: { id },
        data: { status: 'Approved' },
      });

      // Close existing active allocations
      await tx.allocation.updateMany({
        where: { assetId: transfer.assetId, status: 'Active' },
        data: { status: 'Returned' },
      });

      // Find or create target user
      let toUser = await tx.user.findFirst({ where: { name: transfer.toEmployee } });
      if (!toUser) {
        toUser = await tx.user.create({
          data: {
            name: transfer.toEmployee,
            email: `${transfer.toEmployee.toLowerCase().replace(/\s+/g, '.')}@assetflow.com`,
            passwordHash: 'temp_placeholder',
            role: 'Employee',
          },
        });
      }

      // Find or create target dept
      let toDept = await tx.department.findUnique({ where: { name: transfer.toDepartment } }).catch(() => null);
      if (!toDept) {
        toDept = await tx.department.create({ data: { name: transfer.toDepartment } });
      }

      // Create new allocation
      await tx.allocation.create({
        data: {
          assetId: transfer.assetId,
          assetName: transfer.assetName,
          serialNumber: transfer.serialNumber,
          userId: toUser.id,
          allocatedTo: transfer.toEmployee,
          allocatedToEmail: toUser.email,
          departmentId: toDept.id,
          departmentName: transfer.toDepartment,
          allocatedDate: new Date(),
          status: 'Active',
        },
      });

      // Update asset
      await tx.asset.update({
        where: { id: transfer.assetId },
        data: {
          status: 'Allocated',
          departmentId: toDept.id,
          departmentName: transfer.toDepartment,
        },
      });

      return updatedTransfer;
    });

    await prisma.activityLog.create({
      data: {
        action: 'Transfer Approved',
        description: `Transfer of ${result.assetName} to ${result.toEmployee} approved.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Transfer Approved',
        message: `Transfer of ${result.assetName} to ${result.toEmployee} has been approved.`,
        type: 'success',
        isRead: false,
      },
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Approve transfer error:', error);
    res.status(500).json({ error: error.message || 'Failed to approve transfer.' });
  }
};

exports.rejectTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await prisma.transferRequest.update({
      where: { id },
      data: { status: 'Rejected' },
    });

    await prisma.notification.create({
      data: {
        title: 'Transfer Rejected',
        message: `Transfer request for ${transfer.assetName} has been rejected.`,
        type: 'warning',
        isRead: false,
      },
    });

    res.status(200).json(transfer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject transfer.' });
  }
};
