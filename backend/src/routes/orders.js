const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/orderController');
const invoiceCtrl = require('../controllers/invoiceController');
const ActivityLog = require('../models/ActivityLog');

const allowManager = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'manager') return next();
  return res.status(403).json({ message: 'Insufficient permissions' });
};

const logActivity = (action, descriptionFn) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async function (body) {
    try {
      await ActivityLog.create({
        manager: req.user._id,
        action,
        order: req.params.id,
        description: descriptionFn(req, body),
      });
    } catch (_) {}
    return originalJson(body);
  };
  next();
};

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('shippingAddress.street').trim().notEmpty(),
    body('shippingAddress.city').trim().notEmpty(),
    body('shippingAddress.country').trim().notEmpty(),
  ],
  validate,
  ctrl.create
);

router.get('/', authenticate, ctrl.list);
router.get('/custom-fields/active', authenticate, allowManager, ctrl.getCustomFields);
router.post('/confirm-payment', authenticate, ctrl.confirmPayment);
router.get('/admin', authenticate, allowManager, ctrl.adminList);
router.get('/:id', authenticate, ctrl.getById);
router.get('/:id/invoice', authenticate, invoiceCtrl.downloadInvoice);
router.patch('/:id/custom-fields', authenticate, allowManager, ctrl.updateOrderCustomFields);
router.patch(
  '/:id/status',
  authenticate,
  allowManager,
  logActivity('update_status', (req) => `Statut mis à jour vers "${req.body.status}"`),
  ctrl.updateStatus
);
router.post('/:id/pay', authenticate, ctrl.createPaymentIntent);

module.exports = router;
