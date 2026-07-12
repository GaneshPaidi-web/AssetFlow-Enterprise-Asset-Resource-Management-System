const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllTransfers = async (req, res) => {
  try {
    const transfers = await prisma.transferRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transfer requests' });
  }
};

exports.approveTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    // Start a transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      const transfer = await tx.transferRequest.findUnique({
        where: { id }
      });

      if (!transfer) {
        throw new Error('Transfer request not found');
      }

      // Update transfer status
      const updatedTransfer = await tx.transferRequest.update({
        where: { id },
        data: { status: 'Approved' }
      });

      // Update existing active allocations for this asset to 'Returned'
      await tx.allocation.updateMany({
        where: {
          assetId: transfer.assetId,
          status: 'Active'
        },
        data: {
          status: 'Returned'
        }
      });

      // Create new active allocation for the transfer target
      await tx.allocation.create({
        data: {
          assetId: transfer.assetId,
          assetName: transfer.assetName,
          serialNumber: transfer.serialNumber,
          allocatedTo: transfer.toEmployee,
          allocatedToEmail: `${transfer.toEmployee.toLowerCase().replace(' ', '.')}@assetflow.com`,
          department: transfer.toDepartment,
          allocatedDate: new Date(),
          status: 'Active'
        }
      });

      // Update asset status and department
      await tx.asset.update({
        where: { id: transfer.assetId },
        data: {
          status: 'Allocated',
          department: transfer.toDepartment
        }
      });

      return updatedTransfer;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Approve transfer error:', error);
    res.status(500).json({ error: error.message || 'Failed to approve transfer request' });
  }
};

exports.rejectTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const transfer = await prisma.transferRequest.update({
      where: { id },
      data: { status: 'Rejected' }
    });

    res.status(200).json(transfer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject transfer request' });
  }
};

exports.createTransfer = async (req, res) => {
  try {
    const { assetId, toEmployee, toDepartment } = req.body;

    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const activeAllocation = await prisma.allocation.findFirst({
      where: {
        assetId,
        status: 'Active'
      }
    });

    const fromEmployee = activeAllocation ? activeAllocation.allocatedTo : 'Unassigned';
    const fromDepartment = activeAllocation ? activeAllocation.department : 'Unassigned';

    const transfer = await prisma.transferRequest.create({
      data: {
        assetId,
        assetName: asset.name,
        serialNumber: asset.serialNumber,
        fromEmployee,
        toEmployee,
        fromDepartment,
        toDepartment,
        requestedDate: new Date(),
        status: 'Pending'
      }
    });

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Create transfer request error:', error);
    res.status(500).json({ error: 'Failed to create transfer request' });
  }
};
