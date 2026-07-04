const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/apiError');
const { getRedisClient } = require('../config/redis');
const { emailQueue } = require('../jobs/queue');

exports.create = async (req, res, next) => {
  try {
    const { shippingAddress, shippingMethod, notes, items: bodyItems } = req.body;

    let sourceItems;
    if (bodyItems && bodyItems.length > 0) {
      sourceItems = bodyItems;
    } else {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name slug images basePrice stock isActive');
      if (!cart || cart.items.length === 0) throw new ApiError(400, 'Cart is empty');
      sourceItems = cart.items;
    }

    const productIds = [...new Set(sourceItems.map((i) => i.product?._id || i.product))];
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const item of sourceItems) {
      const pid = item.product?._id || item.product;
      const product = productMap.get(pid.toString());
      if (!product || !product.isActive) {
        const name = item.product?.name || item.name || 'Unknown';
        throw new ApiError(400, `${name} is no longer available`);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }
    }

    const items = sourceItems.map((item) => {
      const pid = item.product?._id || item.product;
      const product = productMap.get(pid.toString());
      const price = item.price || item.unitPrice || product.basePrice;
      return {
        product: product._id,
        name: item.product?.name || item.name || product.name,
        sku: product.sku,
        variantSku: item.variantSku || null,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: price * item.quantity,
        image: product.images?.[0],
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const shippingCost = shippingMethod === 'express' ? 5000 : shippingMethod === 'standard' ? 2000 : 0;
    const totalAmount = subtotal + shippingCost;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      shippingMethod,
      shippingCost,
      subtotal,
      totalAmount,
      notes,
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.calculateTotals();
      await cart.save();
    }

    const populated = await Order.findById(order._id).populate('items.product', 'name slug images');

    const redis = await getRedisClient();
    await redis.del(`cart:${req.user._id}`);

    await emailQueue.add('order-confirmation', { orderId: order._id, userId: req.user._id });

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [orders, total] = await Promise.all([
      Order.find(filter).sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name slug images');
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ApiError(403, 'Access denied');
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.getByUser = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.params.userId || req.user._id }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.adminList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [orders, total] = await Promise.all([
      Order.find(filter).sort('-createdAt').populate('user', 'firstName lastName email').skip((pageNum - 1) * limitNum).limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, estimatedDelivery } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status, trackingNumber, estimatedDelivery }, { new: true });
    if (!order) throw new ApiError(404, 'Order not found');
    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { provider = 'stripe' } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.user.toString() !== req.user._id.toString()) throw new ApiError(403, 'Access denied');
    if (order.status !== 'pending') throw new ApiError(400, 'Payment already processed');

    const { paymentService } = require('../services/paymentService');
    const paymentProvider = paymentService.getProvider(provider);
    const result = await paymentProvider.createPayment(order);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
