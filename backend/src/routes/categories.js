const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/categoryController');

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:slug', ctrl.getBySlug);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  [body('name').trim().notEmpty(), body('slug').trim().notEmpty()],
  validate,
  ctrl.create
);

router.patch('/:id', authenticate, authorize('admin'), ctrl.update);
router.delete('/:id', authenticate, authorize('admin'), ctrl.remove);

module.exports = router;
