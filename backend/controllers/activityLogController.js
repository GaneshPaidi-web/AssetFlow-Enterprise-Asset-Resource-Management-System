const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getActivityLogs = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    const mapped = logs.map(l => ({
      id: l.id,
      action: l.action,
      description: l.description,
      userId: l.userId,
      userName: l.userName,
      createdAt: l.createdAt.toISOString(),
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error('Activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs.' });
  }
};
