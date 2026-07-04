const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const ctrl = require('../controllers/uploadController');

const router = Router();

router.post('/', authenticate, authorize('admin'), upload.array('images', 10), ctrl.uploadImages);
router.delete('/', authenticate, authorize('admin'), ctrl.deleteImage);

module.exports = router;
