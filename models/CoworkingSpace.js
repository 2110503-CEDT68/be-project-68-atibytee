// models/CoworkingSpace.js
const mongoose = require('mongoose');

const RoomSubSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: Number,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const CoworkingSpaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  tel: { type: String, required: true },
  openTime: { type: String, required: true },
  closeTime: { type: String, required: true },

  // 1 coworking มี 10 ห้อง
  rooms: {
    type: [RoomSubSchema],
    validate: [
      arr => arr.length <= 10,
      'A coworking space can have at most 10 rooms'
    ]
  }
});

module.exports = mongoose.model('CoworkingSpace', CoworkingSpaceSchema);