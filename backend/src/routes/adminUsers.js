const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
