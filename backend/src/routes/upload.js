import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

// POST /api/v1/upload — admin only
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${backendUrl}/uploads/${filename}`;

    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

export default router;
