const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { auth, isProvider } = require('../middleware/auth');

// Create a new service (Only logged-in Providers)
router.post('/', auth, isProvider, async (req, res) => {
  try {
    const service = new Service({
      ...req.body,
      provider: req.user._id,
      providerName: req.user.name   // automatically take name from logged-in user
    });

    const saved = await service.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

    await service.deleteOne();
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a service (only the owner can update)
router.put('/:id', auth, isProvider, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check ownership
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this service' });
    }

    // Update fields
    const { serviceType, description, price, location, contactNumber } = req.body;

    if (serviceType) service.serviceType = serviceType;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = price;
    if (location !== undefined) service.location = location;
    if (contactNumber !== undefined) service.contactNumber = contactNumber;

    const updated = await service.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
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