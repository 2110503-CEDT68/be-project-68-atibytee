// models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coworkingSpace: {
    name: String,
    address: String,
    tel: String,
    openTime: String,
    closeTime: String
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// populate ย้อนไป Reservation
RoomSchema.virtual('reservations', {
  ref: 'Reservation',
  localField: '_id',
  foreignField: 'room'
});

module.exports = mongoose.model('Room', RoomSchema);