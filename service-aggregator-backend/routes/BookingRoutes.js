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

    const saved = await booking.save();
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

    // Only the provider of this booking can update status
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;