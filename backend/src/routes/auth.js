const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

const router = Router();

router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).trim(),
    body('firstName').trim().isLength({ min: 1, max: 50 }).escape(),
    body('lastName').trim().isLength({ min: 1, max: 50 }).escape(),
    body('phone').optional().trim().isMobilePhone('any'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().trim(),
  ],
  validate,
  authController.login
);

router.post(
  '/admin/create',
  authenticate,
  authorize('admin'),
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).trim(),
    body('firstName').trim().isLength({ min: 1, max: 50 }).escape(),
    body('lastName').trim().isLength({ min: 1, max: 50 }).escape(),
    body('role').isIn(['customer', 'manager', 'admin']),
    body('phone').optional().trim().isMobilePhone('any'),
  ],
  validate,
  authController.adminCreateUser
);

router.post('/refresh', authController.refreshToken);

router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, authController.updateProfile);

module.exports = router;
