const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Cloudinary using your .env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'brain-barter-uploads', // This will create a folder in Cloudinary to keep your files organized
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'zip', 'rar', 'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json', 'xml', 'csv'],
    resource_type: 'auto', // Automatically detect if it's an image, video, or raw file
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// This endpoint now uploads the file directly to Cloudinary
router.post('/file', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 'req.file.path' is now the public URL from Cloudinary
    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: req.file.path // This is the direct URL to the file on Cloudinary
    });
  } catch (error) {
    console.error('File upload failed:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// We no longer need the /download/:filename route because Cloudinary provides a direct URL.

module.exports = router;