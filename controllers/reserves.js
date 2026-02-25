const Reservation = require('../models/Reserve');
const Room = require('../models/Room');

// @desc    Get all reservations
// @route   GET /api/v1/reservations
// @route   GET /api/v1/rooms/:roomId/reservations
// @access  Private
exports.getReservations = async (req, res) => {
  try {
    let query;

    if (req.user.role !== 'admin') {
      // user เห็นของตัวเองเท่านั้น
      query = Reservation.find({ user: req.user.id }).populate({
        path: 'room',
        select: 'name coworkingSpace'
      });
    } else {
      // admin
      if (req.params.roomId) {
        query = Reservation.find({ room: req.params.roomId }).populate({
          path: 'room',
          select: 'name coworkingSpace'
        });
      } else {
        query = Reservation.find().populate({
          path: 'room',
          select: 'name coworkingSpace'
        });
      }
    }

    const reservations = await query;
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Cannot find reservation' });
  }
};

// @desc    Get single reservation
// @route   GET /api/v1/reservations/:id
// @access  Private
exports.getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: 'room',
      select: 'name coworkingSpace'
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        msg: `No reservation with id ${req.params.id}`
      });
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Cannot find reservation' });
  }
};

// @desc    Add reservation
// @route   POST /api/v1/rooms/:roomId/reservations
// @access  Private
exports.addReservation = async (req, res) => {
  try {
    req.body.user = req.user.id;
    req.body.room = req.params.roomId;

    // จำกัด user จองได้ไม่เกิน 3
    if (req.user.role !== 'admin') {
      const count = await Reservation.countDocuments({ user: req.user.id });
      if (count >= 3) {
        return res.status(400).json({
          success: false,
          msg: 'User has already made 3 reservations'
        });
      }
    }

    // ตรวจสอบ room
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        msg: `Cannot find room with id ${req.params.roomId}`
      });
    }

    // check availability
    const available = await Reservation.checkAvailability(
      req.params.roomId,
      req.body.date
    );
    if (!available) {
      return res.status(400).json({
        success: false,
        msg: 'Room is not available on selected date'
      });
    }

    const reservation = await Reservation.create(req.body);
    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, msg });
    }
    res.status(500).json({ success: false, msg: 'Cannot add reservation' });
  }
};

// @desc    Update reservation
// @route   PUT /api/v1/reservations/:id
// @access  Private
exports.updateReservation = async (req, res) => {
  try {
    let reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        msg: `No reservation with id ${req.params.id}`
      });
    }

    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        msg: 'Not authorized'
      });
    }

    reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Cannot update reservation' });
  }
};

// @desc    Delete reservation
// @route   DELETE /api/v1/reservations/:id
// @access  Private
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        msg: `No reservation with id ${req.params.id}`
      });
    }

    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        msg: 'Not authorized'
      });
    }

    await reservation.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Cannot delete reservation' });
  }
};