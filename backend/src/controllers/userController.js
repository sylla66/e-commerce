const User = require('../models/User');
const ApiError = require('../utils/apiError');

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      users,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'role', 'isActive'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) throw new ApiError(404, 'User not found');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};
