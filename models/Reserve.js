const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true
  }
);

/* ❗ สำคัญ: index นี้คือสิ่งที่ทำให้
   - ห้องเดียวกัน
   - วันเดียวกัน
   - จองซ้ำไม่ได้ */
ReservationSchema.index(
  { coworkingSpace: 1, roomNumber: 1, date: 1 },
  { unique: true }
);

/* ✅ normalize date ให้เป็นต้นวันเสมอ
   เพื่อให้ populate / query ตรงกัน */
ReservationSchema.pre('save', async function () {
  this.date.setHours(0, 0, 0, 0);
});

/* check availability (รายวัน) */
ReservationSchema.statics.checkAvailability = async function (
  coworkingSpaceId,
  roomNumber,
  requestedDate
) {
  const targetDate = new Date(requestedDate);
  targetDate.setHours(0, 0, 0, 0);

  const existingBooking = await this.findOne({
    coworkingSpace: coworkingSpaceId,
    roomNumber,
    date: targetDate
  });

  return !existingBooking;
};

module.exports = mongoose.model('Reservation', ReservationSchema);