const Room = require('../models/Room');
const Reservation = require('../models/Reserve');

// @desc    Get all rooms (populate reservations)
// @route   GET /api/v1/rooms
// @access  Private
exports.getRooms = async (req, res) => {
  try {
    let query;
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(p => delete reqQuery[p]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, m => `$${m}`);

    query = Room.find(JSON.parse(queryStr)).populate('reservations');

    if (req.query.select) {
      query = query.select(req.query.select.split(',').join(' '));
    }

    if (req.query.sort) {
      query = query.sort(req.query.sort.split(',').join(' '));
    } else {
      query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Room.countDocuments();

    query = query.skip(startIndex).limit(limit);
    const rooms = await query;

    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({
      success: true,
      count: rooms.length,
      pagination,
      data: rooms
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get single room
// @route   GET /api/v1/rooms/:id
// @access  Private
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('reservations');
    if (!room) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create room
// @route   POST /api/v1/rooms
// @access  Private (admin)
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Update room
// @route   PUT /api/v1/rooms/:id
// @access  Private (admin)
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!room) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete room (cascade reservations)
// @route   DELETE /api/v1/rooms/:id
// @access  Private (admin)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false });
    }

    await Reservation.deleteMany({ room: req.params.id });
    await room.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};