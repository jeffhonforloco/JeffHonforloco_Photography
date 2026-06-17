import express from 'express';
import { getDatabase } from '../database/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/v1/settings/:key — public (used by frontend hero section)
router.get('/:key', (req, res) => {
  try {
    const { key } = req.params;
    const db = getDatabase();
    const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key);
    res.json({
      success: true,
      data: row ? JSON.parse(row.value) : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/settings/:key — admin only
router.put('/:key', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { key } = req.params;
    const value = JSON.stringify(req.body);
    const db = getDatabase();
    db.prepare(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(key, value);
    res.json({ success: true, message: 'Setting saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
