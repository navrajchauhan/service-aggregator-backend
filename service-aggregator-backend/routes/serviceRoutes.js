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
    const { date } = req.query;

    let services;

    if (date) {
      const filterDate = new Date(date);
      services = await Service.find({ 'availability.date': filterDate, 'availability.isAvailable': true });
    } else {
      services = await Service.find();
    }

    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;