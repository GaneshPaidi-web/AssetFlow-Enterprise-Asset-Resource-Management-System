const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const [
      totalAssets,
      allocatedAssets,
      availableAssets,
      pendingTransfers,
      maintenanceToday,
      activeBookings,
      overdueAllocations,
      upcomingReturns,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'Allocated' } }),
      prisma.asset.count({ where: { status: 'Available' } }),
      prisma.transferRequest.count({ where: { status: 'Pending' } }),
      prisma.maintenanceRequest.count({ where: { status: { in: ['Pending', 'In Progress'] } } }),
      prisma.booking.count({ where: { status: { in: ['Confirmed', 'Ongoing'] } } }),
      // Overdue: active allocations where dueDate is in the past
      prisma.allocation.findMany({
        where: {
          status: 'Active',
          dueDate: { lt: now },
        },
        include: { asset: true },
      }),
      // Upcoming returns: due in next 7 days
      prisma.allocation.findMany({
        where: {
          status: 'Active',
          dueDate: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Map overdue allocations
    const overdueList = overdueAllocations.map(a => ({
      id: a.id,
      assetId: a.assetId,
      assetName: a.assetName,
      serialNumber: a.serialNumber,
      allocatedTo: a.allocatedTo,
      allocatedToEmail: a.allocatedToEmail,
      department: a.departmentName,
      allocatedDate: a.allocatedDate.toISOString().split('T')[0],
      dueDate: a.dueDate ? a.dueDate.toISOString().split('T')[0] : null,
      status: a.status,
    }));

    res.status(200).json({
      totalAssets,
      allocatedAssets,
      availableAssets,
      pendingTransfers,
      maintenanceToday,
      activeBookings,
      overdueAllocations: overdueList,
      upcomingReturns: upcomingReturns.length,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
};

exports.getReportData = async (req, res) => {
  try {
    // Capital breakdown by category
    const categoryStats = await prisma.category.findMany({
      include: {
        assets: { select: { purchaseValue: true, status: true, purchaseDate: true } },
        _count: { select: { assets: true } },
      },
    });

    const categoryBreakdown = categoryStats.map(c => ({
      name: c.name,
      value: c.assets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0),
      count: c._count.assets,
      depreciationRate: c.depreciationRate,
    }));

    // Department-wise allocation summary
    const departments = await prisma.department.findMany({
      include: {
        assets: { select: { purchaseValue: true, status: true } },
        allocations: { where: { status: 'Active' }, select: { id: true } },
      },
    });

    const departmentSummary = departments.map(d => ({
      name: d.name,
      totalAssets: d.assets.length,
      activeAllocations: d.allocations.length,
      totalValue: d.assets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0),
    }));

    // Maintenance frequency by category
    const maintenanceStats = await prisma.maintenanceRequest.groupBy({
      by: ['assetName'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Assets by status counts
    const statusCounts = await prisma.asset.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Booking heatmap: bookings grouped by day of week
    const bookings = await prisma.booking.findMany({
      where: { status: { in: ['Confirmed', 'Completed'] } },
      select: { startDate: true },
    });

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const bookingHeatmap = dayLabels.map((day, i) => ({
      day,
      count: bookings.filter(b => new Date(b.startDate).getDay() === i).length,
    }));

    // Total capital investment
    const totalCapital = await prisma.asset.aggregate({ _sum: { purchaseValue: true } });

    // Monthly allocation trend (last 7 months)
    const months = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const allocs = await prisma.allocation.count({
        where: { allocatedDate: { gte: monthStart, lte: monthEnd } },
      });
      const returns = await prisma.allocation.count({
        where: { status: 'Returned', updatedAt: { gte: monthStart, lte: monthEnd } },
      });
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        allocations: allocs,
        returns,
      });
    }

    res.status(200).json({
      categoryBreakdown,
      departmentSummary,
      maintenanceStats,
      statusCounts: statusCounts.map(s => ({ status: s.status, count: s._count.id })),
      bookingHeatmap,
      totalCapital: totalCapital._sum.purchaseValue || 0,
      allocationTrend: months,
    });
  } catch (error) {
    console.error('Report data error:', error);
    res.status(500).json({ error: 'Failed to fetch report data.' });
  }
};
