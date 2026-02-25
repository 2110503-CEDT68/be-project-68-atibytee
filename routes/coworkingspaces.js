const express = require('express');
const {
  getCoworkingSpaces,
  getCoworkingSpace,
  createCoworkingSpace,
  updateCoworkingSpace,
  deleteCoworkingSpace
} = require('../controllers/coworkingspaces');

const reserveRouter = require('./reserves');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ✅ ต้องใช้ coworkingId ให้ตรง controller
router.use('/:coworkingId/reservations', reserveRouter);

router
  .route('/')
  .get(getCoworkingSpaces)
  .post(protect, authorize('admin'), createCoworkingSpace);

router
  .route('/:id')
  .get(getCoworkingSpace)
  .put(protect, authorize('admin'), updateCoworkingSpace)
  .delete(protect, authorize('admin'), deleteCoworkingSpace);

module.exports = router;