const StockMovement = require('../models/StockMovement');

exports.getMovements = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, productId, reason } = req.query;
    const filter = {};
    if (productId) filter.product = productId;
    if (reason) filter.reason = reason;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));

    const [movements, total] = await Promise.all([
      StockMovement.find(filter)
        .populate('product', 'name slug sku images')
        .populate('user', 'firstName lastName email')
        .sort('-createdAt')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      StockMovement.countDocuments(filter),
    ]);

    res.json({
      movements,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};
