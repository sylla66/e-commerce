const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/customFieldController');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

router.post(
  '/',
  [body('name').trim().notEmpty(), body('label').trim().notEmpty()],
  validate,
  ctrl.create
);

router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
