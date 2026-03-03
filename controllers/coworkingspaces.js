const CoworkingSpace = require('../models/CoworkingSpace');
const Reservation = require('../models/Reserve');

const getPopulateOptions = (dateString) => {
  let populateOptions = {
    path: 'rooms.reservations',
    select: 'date',
    transform: (doc) => {
      if (!doc) return doc;
      const reservation = doc.toJSON();
      if (reservation.date) {
        reservation.date = reservation.date.toISOString().split('T')[0];
      }
      return reservation;
    }
  };

  if (dateString) {
    const targetDate = new Date(dateString);
    const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

    populateOptions.match = {
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    };
  }

  return populateOptions;
};

// @desc    Get all coworking spaces
// @route   GET /api/v1/coworkings
// @access  Private
exports.getCoworkingSpaces = async (req, res) => {
  try {
    let query;

    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit', 'date']; // Added 'date' to removeFields
    removeFields.forEach(p => delete reqQuery[p]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, m => `$${m}`);

    query = CoworkingSpace.find(JSON.parse(queryStr));

    if (req.query.select) {
      query = query.select(req.query.select.split(',').join(' '));
    }

    if (req.query.sort) {
      query = query.sort(req.query.sort.split(',').join(' '));
    } else {
      query = query.sort('-createdAt');
    }

    // ✅ Use the helper function here!
    const populateOptions = getPopulateOptions(req.query.date);
    query = query.populate(populateOptions);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await CoworkingSpace.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    const coworkings = await query;

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: coworkings.length,
      pagination,
      data: coworkings
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single coworking space
// @route   GET /api/v1/coworkings/:id
// @access  Private
exports.getCoworkingSpace = async (req, res) => {
  try {
    const { date } = req.query;

    let populateOptions = getPopulateOptions(date);

    // ✅ แก้ไข: ตรวจสอบก่อนว่า match มีค่าหรือยัง ถ้าไม่มีให้สร้างเป็น {} ก่อน
    if (!populateOptions.match) {
      populateOptions.match = {};
    }
    populateOptions.match.coworkingSpace = req.params.id;

    const coworking = await CoworkingSpace.findById(req.params.id)
      .populate(populateOptions);

    if (!coworking) {
      return res.status(404).json({ success: false, message: 'Coworking space not found' });
    }

    res.status(200).json({
      success: true,
      data: coworking
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create coworking space
// @route   POST /api/v1/coworkings
// @access  Private (admin)
exports.createCoworkingSpace = async (req, res) => {
  try {
    const coworking = await CoworkingSpace.create(req.body);
    res.status(201).json({
      success: true,
      data: coworking
    });
  } catch (err) {
    res.status(400).json({ success: false , message: err.message});
  }
};

// @desc    Update coworking space
// @route   PUT /api/v1/coworkings/:id
// @access  Private (admin)
exports.updateCoworkingSpace = async (req, res) => {
  try {
    const coworking = await CoworkingSpace.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!coworking) {
      return res.status(404).json({ success: false, message: 'Coworking space not found' });
    }

    res.status(200).json({
      success: true,
      data: coworking
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete coworking space
// @route   DELETE /api/v1/coworkings/:id
// @access  Private (admin)
exports.deleteCoworkingSpace = async (req, res) => {
  try {
    const coworking = await CoworkingSpace.findById(req.params.id);
    if (!coworking) {
      return res.status(404).json({ success: false });
    }

    // ลบ reservation ที่ผูกกับ coworking นี้
    await Reservation.deleteMany({
      coworkingSpace: req.params.id
    });

    await coworking.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};