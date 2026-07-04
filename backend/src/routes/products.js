const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const ctrl = require('../controllers/productController');

const router = Router();

router.get('/', ctrl.list);
router.get('/:slug', ctrl.getBySlug);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  upload.array('images', 10),
  [
    body('name').trim().notEmpty(),
    body('slug').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category').isMongoId(),
    body('basePrice').isFloat({ min: 0 }),
  ],
  validate,
  ctrl.create
);

router.patch('/:id', authenticate, authorize('admin'), upload.array('images', 10), ctrl.update);
router.delete('/:id', authenticate, authorize('admin'), ctrl.remove);
router.delete('/:id/images', authenticate, authorize('admin'), ctrl.removeImage);

module.exports = router;
