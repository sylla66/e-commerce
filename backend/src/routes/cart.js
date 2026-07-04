const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/cartController');

const router = Router();

router.get('/', optionalAuth, ctrl.getCart);

router.post(
  '/items',
  optionalAuth,
  [body('productId').isMongoId(), body('quantity').optional().isInt({ min: 1 })],
  validate,
  ctrl.addItem
);

router.post('/sync', optionalAuth, [body('items').isArray()], validate, ctrl.syncCart);

router.patch('/items/:itemId', optionalAuth, ctrl.updateItem);
router.delete('/items/:itemId', optionalAuth, ctrl.removeItem);

module.exports = router;
