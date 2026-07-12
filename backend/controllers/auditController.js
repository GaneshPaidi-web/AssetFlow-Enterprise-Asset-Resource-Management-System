const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllAudits = async (req, res) => {
  try {
    const audits = await prisma.auditCycle.findMany({
      orderBy: { startDate: 'desc' }
    });
    res.status(200).json(audits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audits' });
  }
};
