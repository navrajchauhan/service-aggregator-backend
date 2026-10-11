const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { auth, isProvider } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Create a new service (Only logged-in Providers)
router.post('/', auth, isProvider, upload.array('images', 5), async (req, res) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILES:', req.files);
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const service = new Service({
      ...req.body,
      provider: req.user._id,
      providerName: req.user.name,
      images: imageUrls,
    });

    const saved = await service.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(400).json({ error: err.message || 'Image upload failed' });
  }
});
// Get all services (public)
router.get('/', async (req, res) => {
  try {
    const { date, serviceType } = req.query;

    let query = { isActive: true };

    if (date) {
      const filterDate = new Date(date);
      query['availability.date'] = filterDate;
      query['availability.isAvailable'] = true;
    }

    if (serviceType) {
      query.serviceType = serviceType;
    }

    const services = await Service.find(query).populate('provider', 'name email');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get services of logged-in provider
router.get('/my-services', auth, isProvider, async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Delete a service (only the owner can delete)
router.delete('/:id', auth, isProvider, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if the logged-in user owns this service
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this service' });
    }

    const Booking = require('../models/Booking');
    const Notification = require('../models/Notification');

    // Find all bookings related to this service
    const relatedBookings = await Booking.find({ service: service._id });

    // Cancel all related bookings and notify consumers
    for (const booking of relatedBookings) {
      // Only update if not already cancelled
      if (booking.status !== 'cancelled') {
        booking.status = 'cancelled';
        booking.cancellationReason = 'Service no longer exists';
        await booking.save();

        // Notify the consumer
        await Notification.create({
          recipient: booking.consumer,
          message: `Your booking for "${service.serviceType}" has been cancelled because the service no longer exists.`,
          type: 'booking_cancelled',
          relatedBooking: booking._id,
        });
      }
    }

    // Finally delete the service
    await service.deleteOne();

    res.json({ 
      message: 'Service deleted successfully. Related bookings have been cancelled.' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id', auth, isProvider, (req, res) => {
  upload.array('images', 5)(req, res, async (err) => {
    if (err) {
      console.error('UPLOAD ERROR:', err);
      return res.status(400).json({ error: err.message || 'Image upload failed' });
    }

    try {
      console.log('EDIT BODY:', req.body);
      console.log('EDIT FILES:', JSON.stringify(req.files, null, 2));

      const service = await Service.findById(req.params.id);

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      if (service.provider.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Update text fields
      if (req.body.serviceType) service.serviceType = req.body.serviceType;
      if (req.body.description !== undefined) service.description = req.body.description;
      if (req.body.price !== undefined) service.price = req.body.price;
      if (req.body.location !== undefined) service.location = req.body.location;
      if (req.body.contactNumber !== undefined) service.contactNumber = req.body.contactNumber;

      // If new images uploaded, replace old ones
      if (req.files && req.files.length > 0) {
        service.images = req.files.map((file) => file.path);
      }

      const updated = await service.save();
      res.json(updated);
    } catch (error) {
      console.error('EDIT SERVICE ERROR:', error);
      res.status(400).json({ error: error.message || 'Failed to update service' });
    }
  });
});
// Add availability date
// Block a date (mark as unavailable)
router.post('/:id/block-date', auth, isProvider, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const dateStr = new Date(date).toDateString();
    const existing = service.availability.find(
      (a) => new Date(a.date).toDateString() === dateStr
    );

    if (existing) {
      existing.isAvailable = false;
    } else {
      service.availability.push({ date, isAvailable: false });
    }

    await service.save();
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Unblock a date (make available again)
router.delete('/:id/block-date/:dateId', auth, isProvider, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    service.availability = service.availability.filter(
      (a) => a._id.toString() !== req.params.dateId
    );

    await service.save();
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
module.exports = router;