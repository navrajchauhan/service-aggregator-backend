require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Service = require('./models/Service');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const bookings = await Booking.find({});
    let cleaned = 0;

    for (const booking of bookings) {
      const serviceExists = await Service.exists({ _id: booking.service });

      if (!serviceExists) {
        booking.status = 'cancelled';
        booking.cancellationReason = 'Service no longer exists';
        await booking.save();
        cleaned++;
        console.log(`Cleaned booking: ${booking._id}`);
      }
    }

    console.log(`Done. Cleaned ${cleaned} orphaned bookings.`);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });