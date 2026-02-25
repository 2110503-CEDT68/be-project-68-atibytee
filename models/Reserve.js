// models/Reservation.js
const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',   // <-- รองรับ populate room
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// availability
ReservationSchema.statics.checkAvailability = async function (roomId, date) {
  const count = await this.countDocuments({ room: roomId, date });
  return count === 0;
};

module.exports = mongoose.model('Reservation', ReservationSchema);