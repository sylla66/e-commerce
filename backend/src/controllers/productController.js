const Product = require('../models/Product');
const Category = require('../models/Category');
const StockMovement = require('../models/StockMovement');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/apiError');
const { useCloudinary } = require('../middleware/upload');
const { getRedisClient } = require('../config/redis');

const CACHE_TTL = 300;
const PRODUCT_DETAIL_TTL = 600;

async function bustProductCache(slug, id) {
  try {
    const redis = await getRedisClient();
    const keys = await redis.keys('products:*');
    if (keys.length) await redis.del(keys);
    if (slug) await redis.del(`product:slug:${slug}`);
    if (id) await redis.del(`product:id:${id}`);
  } catch (_) {}
}

exports.list = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      featured,
    } = req.query;

    const cacheKey = `products:list:${JSON.stringify(req.query)}`;

    let redis;
    try {
      redis = await getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    } catch (_) {}

    const filter = { isActive: true };

    if (category) {
      const cat = category.match(/^[0-9a-f]{24}$/i)
        ? await Category.findById(category)
        : await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (featured === 'true') filter.isFeatured = true;
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('category', 'name slug'),
      Product.countDocuments(filter),
    ]);

    const result = {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };

    try {
      if (redis) await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    } catch (_) {}

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const cacheKey = `product:slug:${req.params.slug}`;

    try {
      const redis = await getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    } catch (_) {}

    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug attributes');
    if (!product) throw new ApiError(404, 'Product not found');

    try {
      const redis = await getRedisClient();
      await redis.setEx(cacheKey, PRODUCT_DETAIL_TTL, JSON.stringify(product));
    } catch (_) {}

    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const cacheKey = `product:id:${req.params.id}`;

    try {
      const redis = await getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    } catch (_) {}

    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug attributes');
    if (!product) throw new ApiError(404, 'Product not found');

    try {
      const redis = await getRedisClient();
      await redis.setEx(cacheKey, PRODUCT_DETAIL_TTL, JSON.stringify(product));
    } catch (_) {}

    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    if (req.files?.length) {
      productData.images = req.files.map((f) =>
        useCloudinary ? f.path : `/uploads/${f.filename}`
      );
    }
    const product = await Product.create(productData);
    await bustProductCache(product.slug, product._id);

    if (req.user) {
      await ActivityLog.create({
        manager: req.user._id,
        action: 'product_created',
        product: product._id,
        description: `Création du produit "${product.name}" (${product.basePrice.toLocaleString()} CFA)`,
        metadata: new Map(Object.entries({ slug: product.slug, price: String(product.basePrice), stock: String(product.stock) })),
      }).catch(() => {});
    }

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    const existing = await Product.findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Product not found');

    if (req.files?.length) {
      const newImages = req.files.map((f) =>
        useCloudinary ? f.path : `/uploads/${f.filename}`
      );
      productData.images = [...(existing?.images || []), ...newImages];
    }

    let stockChanged = false;
    let prevStock = existing.stock;
    if (productData.stock !== undefined && Number(productData.stock) !== existing.stock) {
      const delta = Number(productData.stock) - existing.stock;
      await StockMovement.create({
        product: existing._id,
        previousStock: existing.stock,
        newStock: Number(productData.stock),
        delta,
        reason: 'admin_update',
        referenceType: 'Product',
        referenceId: existing._id,
        user: req.user?._id,
      });
      stockChanged = true;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, productData, {
      new: true,
      runValidators: true,
    });
    await bustProductCache(product.slug, product._id);

    if (req.user) {
      const changes = [];
      if (stockChanged) changes.push(`stock: ${prevStock} → ${product.stock}`);
      if (productData.basePrice && Number(productData.basePrice) !== existing.basePrice) changes.push(`prix: ${existing.basePrice} → ${productData.basePrice}`);
      await ActivityLog.create({
        manager: req.user._id,
        action: stockChanged ? 'stock_updated' : 'product_updated',
        product: product._id,
        description: changes.length
          ? `Modification de "${product.name}" : ${changes.join(', ')}`
          : `Mise à jour du produit "${product.name}"`,
        metadata: new Map(Object.entries({ slug: product.slug, changes: changes.join(', ') || 'informations' })),
      }).catch(() => {});
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found');

    const name = product.name;

    await Product.findByIdAndDelete(req.params.id);
    await bustProductCache(product.slug, product._id);

    if (req.user) {
      await ActivityLog.create({
        manager: req.user._id,
        action: 'product_deleted',
        description: `Suppression du produit "${name}"`,
      }).catch(() => {});
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

exports.removeImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, 'Product not found');
    product.images = product.images.filter((img) => img !== imageUrl);
    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};
