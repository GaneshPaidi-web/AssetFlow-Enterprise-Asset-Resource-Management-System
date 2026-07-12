const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { startDate: 'desc' }
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { assetId, bookedBy, startDate, endDate } = req.body;

    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Check overlap validation (Time-slot overlap check)
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    
    const overlap = await prisma.booking.findFirst({
      where: {
        assetId,
        status: 'Confirmed',
        AND: [
          { startDate: { lt: newEnd } },
          { endDate: { gt: newStart } }
        ]
      }
    });

    if (overlap) {
      return res.status(400).json({ error: 'Overlapping reservation. This resource is already booked during this time window.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the booking entry
      const booking = await tx.booking.create({
        data: {
          assetId,
          assetName: asset.name,
          bookedBy,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'Confirmed'
        }
      });

      // Update asset status to 'Reserved'
      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'Reserved' }
      });

      return booking;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};
