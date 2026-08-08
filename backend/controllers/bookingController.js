const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { startDate: 'desc' },
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { assetId, bookedBy, startDate, endDate } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    if (newStart >= newEnd) {
      return res.status(400).json({ error: 'Start time must be before end time.' });
    }

    // Overlap validation: newStart < existingEnd AND newEnd > existingStart
    const overlap = await prisma.booking.findFirst({
      where: {
        assetId,
        status: { in: ['Confirmed', 'Upcoming', 'Ongoing'] },
        AND: [
          { startDate: { lt: newEnd } },
          { endDate: { gt: newStart } },
        ],
      },
    });

    if (overlap) {
      return res.status(409).json({
        error: `Overlapping reservation. ${asset.name} is already booked by ${overlap.bookedBy} during this time window.`,
        conflict: true,
        conflictBooking: {
          bookedBy: overlap.bookedBy,
          startDate: overlap.startDate,
          endDate: overlap.endDate,
        },
      });
    }

    // Find user if logged in
    let userId = null;
    if (req.user?.id) {
      userId = req.user.id;
    }

    const booking = await prisma.booking.create({
      data: {
        assetId,
        assetName: asset.name,
        userId,
        bookedBy,
        startDate: newStart,
        endDate: newEnd,
        status: 'Confirmed',
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Resource Booked',
        description: `${asset.name} booked by ${bookedBy} from ${newStart.toISOString()} to ${newEnd.toISOString()}.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Booking Confirmed',
        message: `Your booking for ${asset.name} has been confirmed.`,
        type: 'success',
        isRead: false,
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: 'Cancelled' },
    });

    await prisma.notification.create({
      data: {
        title: 'Booking Cancelled',
        message: `Booking for ${booking.assetName} has been cancelled.`,
        type: 'warning',
        isRead: false,
      },
    });

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
};
