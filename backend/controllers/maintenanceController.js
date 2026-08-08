const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllMaintenance = async (req, res) => {
  try {
    const maintenance = await prisma.maintenanceRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(maintenance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance requests.' });
  }
};

exports.createMaintenanceRequest = async (req, res) => {
  try {
    const { assetId, description, priority, photoUrl } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        assetName: asset.name,
        description,
        priority: priority || 'Medium',
        status: 'Pending',
        requestedDate: new Date(),
        facilityHealth: 'Needs Service',
        photoUrl: photoUrl || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Maintenance Requested',
        description: `Maintenance ticket raised for ${asset.name}: ${description}`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Maintenance Request Submitted',
        message: `A ${priority} priority maintenance request was submitted for ${asset.name}.`,
        type: 'info',
        isRead: false,
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({ error: 'Failed to create maintenance request.' });
  }
};

exports.approveMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { technician } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: 'In Progress',
          technician: technician || null,
        },
      });

      // Asset flips to Under Maintenance on approval
      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: 'Under Maintenance' },
      });

      return request;
    });

    await prisma.activityLog.create({
      data: {
        action: 'Maintenance Approved',
        description: `Maintenance for ${result.assetName} approved.${technician ? ` Assigned to ${technician}.` : ''}`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Maintenance Approved',
        message: `Maintenance request for ${result.assetName} has been approved and is now in progress.`,
        type: 'success',
        isRead: false,
      },
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Approve maintenance error:', error);
    res.status(500).json({ error: 'Failed to approve maintenance request.' });
  }
};

exports.rejectMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: { status: 'Rejected' },
    });

    await prisma.notification.create({
      data: {
        title: 'Maintenance Rejected',
        message: `Maintenance request for ${request.assetName} has been rejected.`,
        type: 'warning',
        isRead: false,
      },
    });

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject maintenance request.' });
  }
};

exports.resolveMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.update({
        where: { id },
        data: { status: 'Completed', facilityHealth: 'Normal' },
      });

      // Asset reverts to Available on resolution
      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: 'Available' },
      });

      return request;
    });

    await prisma.activityLog.create({
      data: {
        action: 'Maintenance Completed',
        description: `Maintenance for ${result.assetName} resolved. Asset is now available.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Maintenance Resolved',
        message: `Maintenance for ${result.assetName} is complete. Asset is now available.`,
        type: 'success',
        isRead: false,
      },
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Resolve maintenance error:', error);
    res.status(500).json({ error: 'Failed to resolve maintenance request.' });
  }
};
