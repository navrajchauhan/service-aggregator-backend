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

module.exports = router;