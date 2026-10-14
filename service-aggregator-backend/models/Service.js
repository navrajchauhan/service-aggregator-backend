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
  packages: [{
    name: {type: String, required : true},
    description:{type: String, default : ''},
    price:{type: Number, required : true},
  }],
  location: { type: String },
  contactNumber: { type: String },
  availability: [
    {
      date: { type: Date, required: true },
      isAvailable: { type: Boolean, default: true }
    }
  ],
  images: {
  type: [String], // will store Cloudinary URL
  default: [],
},
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
  
});

module.exports = mongoose.model('Service', ServiceSchema);