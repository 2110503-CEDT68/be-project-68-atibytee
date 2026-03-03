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
ReservationSchema.statics.checkAvailability = async function(coworkingSpaceId, roomNumber, requestedDate) {
    // 1. Convert the requested date into a JavaScript Date object
    const targetDate = new Date(requestedDate);
    
    // 2. Figure out the exact start and end of that specific day
    const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

    // 3. Search the database for any booking that overlaps with this day
    const existingBooking = await this.findOne({
        coworkingSpace: coworkingSpaceId,
        roomNumber: roomNumber,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    // 4. If a booking exists, return false (not available). If null, return true (available).
    return !existingBooking;
};

module.exports = mongoose.model('Reservation', ReservationSchema);