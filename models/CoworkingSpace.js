const mongoose = require('mongoose');

/* ---------- Room ---------- */
const RoomSubSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: Number,
      required: true
    }
  },
  {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* 👉 virtual: ให้ room เห็นวันที่ถูกจอง */
RoomSubSchema.virtual('reservations', {
  ref: 'Reservation',
  localField: 'roomNumber',
  foreignField: 'roomNumber',
  justOne: false
});

/* ---------- CoworkingSpace ---------- */
const CoworkingSpaceSchema = new mongoose.Schema(
  {
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('CoworkingSpace', CoworkingSpaceSchema);