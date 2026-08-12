const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { auth } = require('../middleware/auth');

// Create a new booking (only consumers)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'consumer') {
      return res.status(403).json({ error: 'Only consumers can book services' });
    }

    const { serviceId, date } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const booking = new Booking({
      service: serviceId,
      consumer: req.user._id,
      provider: service.provider,
      date,
    });
    const Notification = require('../models/Notification'); 

    const saved = await booking.save();
    await Notification.create({
      recipient: service.provider,
      message: `New booking request for "${service.serviceType}" on ${new Date(date).toLocaleDateString()}`,
      type: 'booking_request',
      relatedBooking: saved._id,
    });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get bookings of logged-in user
router.get('/my-bookings', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'consumer') {
      query.consumer = req.user._id;
    } else if (req.user.role === 'provider') {
      query.provider = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'serviceType providerName price location')
      .populate('consumer', 'name email')
      .populate('provider', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status (Provider can confirm/cancel)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();
    const message =
  status === 'confirmed'
    ? `Your booking for "${booking.service}" has been confirmed`
    : `Your booking has been cancelled by the provider`;

    // Better message (we need service name)
    const serviceDoc = await Service.findById(booking.service);
    const serviceName = serviceDoc ? serviceDoc.serviceType : 'the service';

    await Notification.create({
      recipient: booking.consumer,
      message:
        status === 'confirmed'
          ? `Your booking for "${serviceName}" has been confirmed!`
          : `Your booking for "${serviceName}" has been cancelled by the provider.`,
      type: status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled',
      relatedBooking: booking._id,
    });
    // When confirmed → block that date
    if (status === 'confirmed') {
      const service = await Service.findById(booking.service);
      if (service) {
        const bookingDateStr = new Date(booking.date).toDateString();

        const existing = service.availability.find(
          (a) => new Date(a.date).toDateString() === bookingDateStr
        );

        if (existing) {
          existing.isAvailable = false;
        } else {
          service.availability.push({
            date: booking.date,
            isAvailable: false,
          });
        }
        await service.save();
      }
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;