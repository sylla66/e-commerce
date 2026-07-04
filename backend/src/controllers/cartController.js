const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/apiError');

exports.getCart = async (req, res, next) => {
  try {
    const filter = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };
    const cart = await Cart.findOne(filter).populate('items.product', 'name slug images basePrice isActive');
    res.json(cart || { items: [], totalQuantity: 0, totalAmount: 0 });
  } catch (error) {
    next(error);
  }
};

exports.syncCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!items?.length) throw new ApiError(400, 'Cart items required');

    const productIds = [...new Set(items.map((i) => i.product))];
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const validItems = items
      .filter((i) => productMap.has(i.product))
      .map((i) => {
        const product = productMap.get(i.product);
        return {
          product: product._id,
          variantSku: i.variantSku || null,
          quantity: Math.min(i.quantity, product.stock),
          price: product.basePrice,
        };
      });

    const filter = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };
    const update = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };

    let cart = await Cart.findOne(filter);
    if (!cart) {
      cart = new Cart(update);
    }

    cart.items = validItems;
    cart.calculateTotals();
    await cart.save();

    const populated = await cart.populate('items.product', 'name slug images basePrice');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

exports.addItem = async (req, res, next) => {
  try {
    const { productId, variantSku, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
    if (product.stock < quantity) throw new ApiError(400, 'Insufficient stock');

    const filter = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };
    const update = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };

    let cart = await Cart.findOne(filter);
    if (!cart) {
      cart = new Cart(update);
    }

    const existing = cart.items.find(
      (i) => i.product.toString() === productId && i.variantSku === (variantSku || null)
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        variantSku: variantSku || null,
        quantity,
        price: product.basePrice,
      });
    }

    cart.calculateTotals();
    await cart.save();

    const populated = await cart.populate('items.product', 'name slug images basePrice');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const filter = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };
    const cart = await Cart.findOne(filter);
    if (!cart) throw new ApiError(404, 'Cart not found');

    const item = cart.items.id(itemId);
    if (!item) throw new ApiError(404, 'Item not found');

    item.quantity = quantity;
    cart.calculateTotals();
    await cart.save();

    const populated = await cart.populate('items.product', 'name slug images basePrice');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const filter = req.user ? { user: req.user._id } : { sessionId: req.headers['x-session-id'] };
    const cart = await Cart.findOne(filter);
    if (!cart) throw new ApiError(404, 'Cart not found');

    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    cart.calculateTotals();
    await cart.save();

    const populated = await cart.populate('items.product', 'name slug images basePrice');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};
