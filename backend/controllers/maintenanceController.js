const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllMaintenance = async (req, res) => {
  try {
    const maintenance = await prisma.maintenanceRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(maintenance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
};

exports.createMaintenanceRequest = async (req, res) => {
  try {
    const { assetId, description, priority } = req.body;

    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Create pending maintenance request (asset status remains unchanged until approval)
    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        assetName: asset.name,
        description,
        priority,
        status: 'Pending',
        requestedDate: new Date(),
        facilityHealth: 'Needs Service'
      }
    });

    res.status(201).json(maintenanceRequest);
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({ error: 'Failed to create maintenance request' });
  }
};

exports.approveMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.update({
        where: { id },
        data: { status: 'In Progress' }
      });

      // Asset flips to Maintenance on approval
      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: 'Maintenance' }
      });

      return request;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Approve maintenance error:', error);
    res.status(500).json({ error: 'Failed to approve maintenance request' });
  }
};

exports.rejectMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: { status: 'Rejected' }
    });

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject maintenance request' });
  }
};

exports.resolveMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.update({
        where: { id },
        data: { status: 'Completed' }
      });

      // Asset flips back to Available on resolution
      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: 'Available' }
      });

      return request;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Resolve maintenance error:', error);
    res.status(500).json({ error: 'Failed to resolve maintenance request' });
  }
};
