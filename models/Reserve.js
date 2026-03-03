// models/Reservation.js
const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  coworkingSpace: {
    type: mongoose.Schema.ObjectId,
    ref: 'CoworkingSpace',
    required: true
  },
  roomNumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

// ห้องเดียวกัน วันเดียวกัน ห้ามจองซ้ำ
ReservationSchema.index(
  { coworkingSpace: 1, roomNumber: 1, date: 1 },
  { unique: true }
);

// check availability (ว่างหรือไม่)
ReservationSchema.statics.checkAvailability = async function (
  coworkingId,
  roomNumber,
  date
) {
  const count = await this.countDocuments({
    coworkingSpace: coworkingId,
    roomNumber,
    date
  });
  return count === 0;
};

module.exports = mongoose.model('Reservation', ReservationSchema);