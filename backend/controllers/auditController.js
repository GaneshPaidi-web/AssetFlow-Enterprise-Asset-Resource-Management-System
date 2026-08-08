const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllAudits = async (req, res) => {
  try {
    const audits = await prisma.auditCycle.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        auditItems: {
          include: { asset: { select: { id: true, name: true, tag: true, status: true } } },
        },
      },
    });
    res.status(200).json(audits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audits.' });
  }
};

exports.createAuditCycle = async (req, res) => {
  try {
    const { name, startDate, endDate, auditor } = req.body;

    if (!name || !startDate || !endDate || !auditor) {
      return res.status(400).json({ error: 'Name, startDate, endDate, and auditor are required.' });
    }

    const audit = await prisma.auditCycle.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        auditor,
        status: 'In Progress',
        progress: 0,
        missingAssets: 0,
        discrepancies: 0,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Audit Cycle Created',
        description: `Audit cycle "${name}" started by ${req.user?.name || auditor}.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    res.status(201).json(audit);
  } catch (error) {
    console.error('Create audit error:', error);
    res.status(500).json({ error: 'Failed to create audit cycle.' });
  }
};

exports.addAuditItem = async (req, res) => {
  try {
    const { id: auditCycleId } = req.params;
    const { assetId, status, notes } = req.body;

    if (!assetId || !status) {
      return res.status(400).json({ error: 'assetId and status are required.' });
    }

    const validStatuses = ['Verified', 'Missing', 'Damaged', 'Pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    // Upsert — auditor may re-verify the same asset
    const existing = await prisma.auditItem.findFirst({
      where: { auditCycleId, assetId },
    });

    let item;
    if (existing) {
      item = await prisma.auditItem.update({
        where: { id: existing.id },
        data: { status, notes: notes || null },
        include: { asset: true },
      });
    } else {
      item = await prisma.auditItem.create({
        data: { auditCycleId, assetId, status, notes: notes || null },
        include: { asset: true },
      });
    }

    // Recalculate progress, missing, discrepancies
    const allItems = await prisma.auditItem.findMany({ where: { auditCycleId } });
    const verified = allItems.filter(i => i.status === 'Verified').length;
    const missing = allItems.filter(i => i.status === 'Missing').length;
    const damaged = allItems.filter(i => i.status === 'Damaged').length;
    const progress = allItems.length > 0 ? (verified / allItems.length) * 100 : 0;

    await prisma.auditCycle.update({
      where: { id: auditCycleId },
      data: {
        progress: Math.round(progress * 10) / 10,
        missingAssets: missing,
        discrepancies: missing + damaged,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Audit Item Updated',
        description: `Asset ${item.asset.name} marked as ${status} in audit.${notes ? ` Notes: ${notes}` : ''}`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    if (status === 'Missing' || status === 'Damaged') {
      await prisma.notification.create({
        data: {
          title: 'Audit Discrepancy Flagged',
          message: `${item.asset.name} (${item.asset.tag}) flagged as ${status} during audit.`,
          type: 'warning',
          isRead: false,
        },
      });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error('Add audit item error:', error);
    res.status(500).json({ error: 'Failed to update audit item.' });
  }
};

exports.closeAuditCycle = async (req, res) => {
  try {
    const { id } = req.params;

    const auditCycle = await prisma.auditCycle.findUnique({
      where: { id },
      include: { auditItems: { include: { asset: true } } },
    });

    if (!auditCycle) return res.status(404).json({ error: 'Audit cycle not found.' });
    if (auditCycle.status === 'Completed') return res.status(400).json({ error: 'Audit cycle is already closed.' });

    // Auto-update asset statuses based on audit results
    for (const item of auditCycle.auditItems) {
      if (item.status === 'Missing') {
        await prisma.asset.update({ where: { id: item.assetId }, data: { status: 'Lost' } });
      } else if (item.status === 'Damaged') {
        await prisma.asset.update({ where: { id: item.assetId }, data: { status: 'Under Maintenance' } });
      }
    }

    const closedAudit = await prisma.auditCycle.update({
      where: { id },
      data: { status: 'Completed', progress: 100 },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Audit Cycle Closed',
        description: `Audit cycle "${auditCycle.name}" closed by ${req.user?.name || 'Admin'}. ${auditCycle.missingAssets} missing, ${auditCycle.discrepancies} discrepancies.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Audit Completed',
        message: `Audit cycle "${auditCycle.name}" has been closed. Discrepancy report generated.`,
        type: 'success',
        isRead: false,
      },
    });

    res.status(200).json(closedAudit);
  } catch (error) {
    console.error('Close audit error:', error);
    res.status(500).json({ error: 'Failed to close audit cycle.' });
  }
};
