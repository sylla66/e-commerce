const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

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
router.get('/admin', authenticate, authorize('admin'), ctrl.adminList);
router.get('/:id', authenticate, ctrl.getById);
router.patch('/:id/status', authenticate, authorize('admin'), ctrl.updateStatus);
router.post('/:id/pay', authenticate, ctrl.createPaymentIntent);

module.exports = router;
