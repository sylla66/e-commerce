exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const urls = req.files.map((f) => f.path);
    res.json({ urls });
  } catch (error) {
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const cloudinary = require('cloudinary').v2;
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: 'publicId required' });
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
};
