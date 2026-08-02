const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerName: { type: String, required: true },
  serviceType: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  location: { type: String },
  contactNumber: { type: String },
  availability: [
    {
      date: { type: Date, required: true },
      isAvailable: { type: Boolean, default: true }
    }
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', ServiceSchema);