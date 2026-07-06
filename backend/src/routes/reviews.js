const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/reviewController');

const router = Router();

router.get('/product/:slug', ctrl.getByProduct);

router.post(
  '/',
  authenticate,
  [
    body('productId').isMongoId(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('title').optional().trim().isLength({ max: 100 }),
    body('comment').optional().trim().isLength({ max: 2000 }),
  ],
  validate,
  ctrl.create
);

router.get('/admin', authenticate, authorize('admin', 'manager'), ctrl.adminList);
router.delete('/:id', authenticate, ctrl.remove);

module.exports = router;
