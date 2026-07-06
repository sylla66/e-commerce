const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { sendNewReviewNotification } = require('../services/emailService');

exports.getByProduct = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) throw new ApiError(404, 'Product not found');

    const [reviews, total] = await Promise.all([
      Review.find({ product: product._id })
        .populate('user', 'firstName lastName avatar')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Review.countDocuments({ product: product._id }),
    ]);

    res.json({ reviews, total, average: product.averageRating });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) throw new ApiError(404, 'Product not found');

    const hasOrdered = await Order.findOne({
      user: req.user._id,
      'items.product': product._id,
      status: { $in: ['delivered', 'shipped'] },
    });
    if (!hasOrdered) throw new ApiError(403, 'Vous devez avoir acheté ce produit pour laisser un avis');

    const existing = await Review.findOne({ product: product._id, user: req.user._id });
    if (existing) throw new ApiError(409, 'Vous avez déjà laissé un avis sur ce produit');

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      isVerified: true,
    });

    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length) {
      await Product.findByIdAndUpdate(product._id, {
        averageRating: Math.round(stats[0].avg * 10) / 10,
        reviewCount: stats[0].count,
      });
    }

    const populated = await Review.findById(review._id).populate('user', 'firstName lastName avatar');

    sendNewReviewNotification(populated, product);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

exports.adminList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [reviews, total] = await Promise.all([
      Review.find()
        .populate('product', 'name slug images')
        .populate('user', 'firstName lastName email')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Review.countDocuments(),
    ]);

    res.json({ reviews, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) throw new ApiError(404, 'Review not found');

    const userId = req.user._id.toString();
    const isOwner = review.user.toString() === userId;
    const isStaff = req.user.role === 'admin' || req.user.role === 'manager';
    if (!isOwner && !isStaff) throw new ApiError(403, 'Access denied');

    await Review.findByIdAndDelete(req.params.id);

    const stats = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    await Product.findByIdAndUpdate(review.product, {
      averageRating: stats.length ? Math.round(stats[0].avg * 10) / 10 : 0,
      reviewCount: stats.length ? stats[0].count : 0,
    });

    res.json({ message: 'Avis supprimé' });
  } catch (error) {
    next(error);
  }
};
