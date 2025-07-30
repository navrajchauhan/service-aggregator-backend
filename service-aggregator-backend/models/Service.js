

const mongoose = require('mongoose');
const ServiceSchema = new mongoose.Schema({
  providerName: { type: String, required: true },
  serviceType: { type: String, required: true }, // e.g. caterer, florist
  description: { type: String },
  availability: [
    {
      date: { type: Date, required: true },
      isAvailable: { type: Boolean, default: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', ServiceSchema);