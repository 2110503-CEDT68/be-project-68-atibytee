const express = require('express');
const {
  getReservations,
  addReservation,
  getReservation,
  updateReservation,
  deleteReservation
} = require('../controllers/reserves');

const { protect, authorize } = require('../middleware/auth');

// ✅ ต้องมี mergeParams:true เพื่อรับ coworkingId จาก parent route
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, getReservations)
  .post(protect, authorize('user', 'admin'), addReservation);

router
  .route('/:id')
  .get(protect, getReservation)
  .put(protect, authorize('user', 'admin'), updateReservation)
  .delete(protect, authorize('user', 'admin'), deleteReservation);

module.exports = router;