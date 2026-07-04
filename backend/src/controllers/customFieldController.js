const CustomField = require('../models/CustomField');
const ApiError = require('../utils/apiError');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.all !== 'true') filter.isActive = true;
    const fields = await CustomField.find(filter).sort('sortOrder');
    res.json(fields);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const field = await CustomField.findById(req.params.id);
    if (!field) throw new ApiError(404, 'Custom field not found');
    res.json(field);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const field = await CustomField.create(req.body);
    res.status(201).json(field);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const field = await CustomField.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!field) throw new ApiError(404, 'Custom field not found');
    res.json(field);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const field = await CustomField.findByIdAndDelete(req.params.id);
    if (!field) throw new ApiError(404, 'Custom field not found');
    res.json({ message: 'Custom field deleted' });
  } catch (error) {
    next(error);
  }
};
