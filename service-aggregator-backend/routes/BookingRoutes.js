const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Create a new booking (only consumers)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'consumer') {
      return res.status(403).json({ error: 'Only consumers can book services' });
    }

    const { serviceId, date, selectedPackage } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Optional: validate package exists on service
    let packageData = null;
    if (selectedPackage) {
      packageData = (service.packages || []).find(
        (p) => p.name === selectedPackage.name && Number(p.price) === Number(selectedPackage.price)
      );

      if (!packageData && selectedPackage.name) {
        // still allow if frontend sent full package object
        packageData = {
          name: selectedPackage.name,
          description: selectedPackage.description || '',
          price: Number(selectedPackage.price),
        };
      }
    }

    const booking = new Booking({
      service: serviceId,
      consumer: req.user._id,
      provider: service.provider,
      date,
      selectedPackage: packageData || undefined,
    });

    const saved = await booking.save();

    await Notification.create({
      recipient: service.provider,
      message: `New booking request for "${service.serviceType}" on ${new Date(date).toLocaleDateString()}${
        packageData ? ` (${packageData.name} - ₹${packageData.price})` : ''
      }`,
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

    const isProvider = booking.provider.toString() === req.user._id.toString();
    const isConsumer = booking.consumer.toString() === req.user._id.toString();

    // Authorization rules
    if (status === 'confirmed') {
      // Only provider can confirm
      if (!isProvider) {
        return res.status(403).json({ error: 'Only provider can confirm bookings' });
      }
    }

    if (status === 'cancelled') {
      // Provider or consumer can cancel
      if (!isProvider && !isConsumer) {
        return res.status(403).json({ error: 'Not authorized to cancel this booking' });
      }

      // Optional: don't allow cancelling already cancelled
      if (booking.status === 'cancelled') {
        return res.status(400).json({ error: 'Booking is already cancelled' });
      }
    }

    const previousStatus = booking.status;
    booking.status = status;

    if (status === 'cancelled') {
      booking.cancellationReason = isConsumer
        ? 'Cancelled by customer'
        : 'Cancelled by provider';
    }

    await booking.save();

    // If confirmed → block date
    if (status === 'confirmed') {
      const service = await Service.findById(booking.service);
      if (service) {
        if (!Array.isArray(service.availability)) service.availability = [];

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

    // If a previously confirmed booking is cancelled → unblock date
    if (status === 'cancelled' && previousStatus === 'confirmed') {
      const service = await Service.findById(booking.service);
      if (service && Array.isArray(service.availability)) {
        const bookingDateStr = new Date(booking.date).toDateString();

        service.availability = service.availability.filter(
          (a) => !(new Date(a.date).toDateString() === bookingDateStr && a.isAvailable === false)
        );

        // Or mark available again instead of removing:
        // const existing = service.availability.find(...)
        // if (existing) existing.isAvailable = true;

        await service.save();
      }
    }

    // Notifications
    try {
      const serviceDoc = await Service.findById(booking.service);
      const serviceName = serviceDoc ? serviceDoc.serviceType : 'the service';

      if (status === 'confirmed') {
        await Notification.create({
          recipient: booking.consumer,
          message: `Your booking for "${serviceName}" has been confirmed!`,
          type: 'booking_confirmed',
          relatedBooking: booking._id,
        });
      }

      if (status === 'cancelled') {
        // Notify the other party
        const recipient = isConsumer ? booking.provider : booking.consumer;
        const who = isConsumer ? 'customer' : 'provider';

        await Notification.create({
          recipient,
          message: `Booking for "${serviceName}" was cancelled by the ${who}.`,
          type: 'booking_cancelled',
          relatedBooking: booking._id,
        });
      }
    } catch (notifyErr) {
      console.error('Notification error:', notifyErr.message);
    }

    res.json(booking);
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;