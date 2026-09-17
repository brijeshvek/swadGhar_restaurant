const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
  ];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, GIF, SVG, AVIF) are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Configure Cloudinary if credentials provided
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// @desc    Upload an image (multipart or base64)
// @route   POST /api/upload
// @access  Private (Admin or Manager)
router.post(
  '/',
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      // 1. If Multipart File Uploaded
      if (req.file) {
        const localPath = req.file.path;
        const relativeUrl = `/uploads/${req.file.filename}`;

        // If Cloudinary is configured, upload to Cloudinary
        if (isCloudinaryConfigured) {
          try {
            const result = await cloudinary.uploader.upload(localPath, {
              folder: 'swadghar_restaurant',
              resource_type: 'image',
            });
            return res.status(200).json({
              success: true,
              message: 'Image uploaded to Cloudinary successfully',
              url: result.secure_url || result.url,
              publicId: result.public_id,
            });
          } catch (cloudErr) {
            console.error('Cloudinary upload fallback to local:', cloudErr.message);
          }
        }

        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully to server storage',
          url: relativeUrl,
          filename: req.file.filename,
        });
      }

      // 2. If Base64 data URI passed in body
      if (req.body?.dataUri) {
        const base64Data = req.body.dataUri;
        const matches = base64Data.match(/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
          return res.status(400).json({ success: false, message: 'Invalid Base64 image format' });
        }

        const ext = matches[1] === 'jpeg' ? '.jpg' : `.${matches[1]}`;
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const targetPath = path.join(uploadDir, filename);

        fs.writeFileSync(targetPath, buffer);

        return res.status(200).json({
          success: true,
          message: 'Base64 image saved successfully',
          url: `/uploads/${filename}`,
          filename,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'No image file or dataUri received.',
      });
    } catch (error) {
      console.error('Upload handler error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while uploading image',
      });
    }
  }
);

module.exports = router;
