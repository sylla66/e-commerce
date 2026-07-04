const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiError = require('../utils/apiError');

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

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug attributes');
    if (!product) throw new ApiError(404, 'Product not found');
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug attributes');
    if (!product) throw new ApiError(404, 'Product not found');
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    if (req.files?.length) {
      productData.images = req.files.map((f) => f.path);
    }
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    if (req.files?.length) {
      const existing = await Product.findById(req.params.id);
      productData.images = [...(existing?.images || []), ...req.files.map((f) => f.path)];
    }
    const product = await Product.findByIdAndUpdate(req.params.id, productData, {
      new: true,
      runValidators: true,
    });
    if (!product) throw new ApiError(404, 'Product not found');
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found');
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
