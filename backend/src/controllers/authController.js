const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const ApiError = require('../utils/apiError');

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    const user = await User.create({ email, password, firstName, lastName, phone });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      user,
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account deactivated');
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      user,
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      throw new ApiError(400, 'Refresh token required');
    }

    const jwt = require('jsonwebtoken');
    const config = require('../config');
    const decoded = jwt.verify(token, config.jwtSecret);

    if (decoded.type !== 'refresh') {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const newToken = generateToken(decoded.userId);
    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
};
