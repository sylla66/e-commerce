const Category = require('../models/Category');
const ApiError = require('../utils/apiError');

exports.getAll = async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter).populate('children').sort('name');
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).populate('children');
    if (!category) throw new ApiError(404, 'Category not found');
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) throw new ApiError(404, 'Category not found');
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found');
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
