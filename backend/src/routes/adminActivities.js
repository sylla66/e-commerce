const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const activityController = require('../controllers/activityController');

const router = Router();

router.use(authenticate, authorize('admin', 'manager'));

router.get('/', activityController.listActivities);

module.exports = router;
