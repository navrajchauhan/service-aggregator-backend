const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Create a new service
router.post('/', async (req, res) => {
  try {
    const service = new Service(req.body);
    const saved = await service.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all services (with optional date filter)
router.get('/', async (req, res) => {
  try {
    const { date, serviceType } = req.query;

    let query = {};

    if (date) {
      const filterDate = new Date(date);
      query['availability.date'] = filterDate;
      query['availability.isAvailable'] = true;
    }

    if (serviceType) {
      query.serviceType = serviceType;
    }

    const services = await Service.find(query);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;