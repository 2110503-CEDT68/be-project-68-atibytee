const CoworkingSpace = require('../models/CoworkingSpace');
const Reservation = require('../models/Reserve');

// @desc    Get all coworking spaces
// @route   GET /api/v1/coworkings
// @access  Private
exports.getCoworkingSpaces = async (req, res) => {
  try {
    let query;
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
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

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await CoworkingSpace.countDocuments();

    query = query.skip(startIndex).limit(limit);
    const coworkings = await query;

    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({
      success: true,
      count: coworkings.length,
      pagination,
      data: coworkings
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get single coworking space
// @route   GET /api/v1/coworkings/:id
// @access  Private
exports.getCoworkingSpace = async (req, res) => {
  try {
    const coworking = await CoworkingSpace.findById(req.params.id);
    if (!coworking) {
      return res.status(404).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: coworking
    });
  } catch (err) {
    res.status(400).json({ success: false });
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
    res.status(400).json({ success: false });
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
      return res.status(404).json({ success: false });
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
    res.status(400).json({ success: false });
  }
};