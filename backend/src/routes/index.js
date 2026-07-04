const { Router } = require('express');
const authRoutes = require('./auth');
const categoryRoutes = require('./categories');
const productRoutes = require('./products');
const cartRoutes = require('./cart');
const uploadRoutes = require('./upload');

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
