const fs = require('fs');
const path = require('path');
const config = require('../config');
const { useCloudinary } = require('../middleware/upload');

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const urls = req.files.map((f) =>
      useCloudinary ? f.path : `/uploads/${f.filename}`
    );
    res.json({ urls });
  } catch (error) {
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'url required' });

    if (useCloudinary) {
      const cloudinary = require('cloudinary').v2;
      const publicId = url.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`ecommerce/products/${publicId}`);
    } else {
      const filename = path.basename(url);
      const filepath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    res.json({ message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
};
