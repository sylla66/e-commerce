const { Router } = require('express');
const authRoutes = require('./auth');
const categoryRoutes = require('./categories');
const productRoutes = require('./products');
const cartRoutes = require('./cart');
const uploadRoutes = require('./upload');
const orderRoutes = require('./orders');
const adminUsersRoutes = require('./adminUsers');
const adminActivityRoutes = require('./adminActivities');
const customFieldRoutes = require('./customFields');

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/upload', uploadRoutes);
router.use('/orders', orderRoutes);
router.use('/admin/users', adminUsersRoutes);
router.use('/admin/activities', adminActivityRoutes);
router.use('/admin/custom-fields', customFieldRoutes);

module.exports = router;
