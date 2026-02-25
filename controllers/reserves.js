const Reservation = require('../models/Reserve');
const CoworkingSpace = require('../models/CoworkingSpace');

// @desc    Get all reservations
// @route   GET /api/v1/reservations
// @route   GET /api/v1/coworkings/:coworkingId/reservations
// @access  Private
exports.getReservations = async (req, res) => {
  try {
    let query;

    if (req.user.role !== 'admin') {
      // user เห็นของตัวเองเท่านั้น
      query = Reservation.find({ user: req.user.id }).populate({
        path: 'coworkingSpace',
        select: 'name address tel openTime closeTime'
      });
    } else {
      // admin
      if (req.params.coworkingId) {
        query = Reservation.find({
          coworkingSpace: req.params.coworkingId
        }).populate('coworkingSpace');
      } else {
        query = Reservation.find().populate('coworkingSpace');
      }
    }

    const reservations = await query;

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: 'Cannot find reservations'
    });
  }
};

exports.getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: 'coworkingSpace',
      select: 'name address tel openTime closeTime'
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        msg: `No reservation with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: 'Cannot find reservation'
    });
  }
};

exports.addReservation = async (req, res) => {
  try {
    const { roomNumber, date } = req.body;

    req.body.user = req.user.id;
    req.body.coworkingSpace = req.params.coworkingId;

    // จำกัด user จองได้ไม่เกิน 3 ห้อง
    if (req.user.role !== 'admin') {
      const count = await Reservation.countDocuments({
        user: req.user.id
      });
      if (count >= 3) {
        return res.status(400).json({
          success: false,
          msg: 'User can reserve at most 3 rooms'
        });
      }
    }

    // ตรวจสอบ coworking space
    const coworking = await CoworkingSpace.findById(
      req.params.coworkingId
    );
    if (!coworking) {
      return res.status(404).json({
        success: false,
        msg: `Cannot find coworking space with id ${req.params.coworkingId}`
      });
    }

    // ตรวจสอบว่ามี roomNumber นี้จริงไหม
    const roomExists = coworking.rooms.some(
      r => r.roomNumber === roomNumber
    );
    if (!roomExists) {
      return res.status(400).json({
        success: false,
        msg: `Room number ${roomNumber} does not exist`
      });
    }

    // check availability
    const available = await Reservation.checkAvailability(
      req.params.coworkingId,
      roomNumber,
      date
    );

    if (!available) {
      return res.status(400).json({
        success: false,
        msg: 'Room is not available on selected date'
      });
    }

    const reservation = await Reservation.create(req.body);

    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, msg });
    }
    res.status(500).json({
      success: false,
      msg: 'Cannot add reservation'
    });
  }
};

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

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: 'Cannot update reservation'
    });
  }
};

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

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: 'Cannot delete reservation'
    });
  }
};