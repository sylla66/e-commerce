const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const adminCtrl = require('../controllers/adminController');
const stockCtrl = require('../controllers/stockController');
const inventoryCtrl = require('../controllers/inventoryController');

const router = Router();

router.use(authenticate, authorize('admin', 'manager'));

router.get('/stats', adminCtrl.getStats);
router.get('/orders/export', adminCtrl.exportOrdersCSV);
router.get('/stock/movements', stockCtrl.getMovements);
router.get('/inventory', inventoryCtrl.getHistory);

module.exports = router;
