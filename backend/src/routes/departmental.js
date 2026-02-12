import express from 'express';
import Issue from '../models/Issue.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { uploadCompletionPhoto } from '../config/cloudinary.js';
import { uploadToCloudinary } from '../lib/uploadToCloudinary.js';
import { cloudinary } from '../config/cloudinary.js';

const router = express.Router();

// Departmental admin: Get all issues for my department
router.get('/issues', authenticate, requireRole('departmental_admin'), async (req, res) => {
  try {
    const deptId = req.user.department;
    if (!deptId) return res.status(403).json({ error: 'No department assigned' });

    const issues = await Issue.find({ department: deptId })
      .populate('department', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(issues.map((i) => ({ ...i, id: i._id })));
  } catch (err) {
    console.error('Department issues error:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// Departmental admin: Update status to IN_PROGRESS
router.patch('/issues/:id/status', authenticate, requireRole('departmental_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const deptId = req.user.department;

    if (!deptId) return res.status(403).json({ error: 'No department assigned' });
    if (!['PENDING', 'IN_PROGRESS'].includes(status)) {
      return res.status(400).json({ error: 'Status must be PENDING or IN_PROGRESS. Use complete endpoint for COMPLETED.' });
    }

    const issue = await Issue.findOneAndUpdate(
      { _id: id, department: deptId },
      { status },
      { new: true }
    )
      .populate('department', 'name')
      .populate('user', 'name email')
      .lean();

    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json({ ...issue, id: issue._id });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Multer middleware for completion photo
const maybeUploadCompletionPhoto = (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    uploadCompletionPhoto(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  } else {
    next();
  }
};

// Departmental admin: Mark issue COMPLETED (must include completion photo)
router.patch(
  '/issues/:id/complete',
  authenticate,
  requireRole('departmental_admin'),
  maybeUploadCompletionPhoto,
  async (req, res) => {
    try {
      const { id } = req.params;
      const deptId = req.user.department;

      if (!deptId) return res.status(403).json({ error: 'No department assigned' });

      let completionPhotoUrl = req.body.completionPhotoUrl;

      if (req.file?.buffer) {
        completionPhotoUrl = await uploadToCloudinary(
          req.file.buffer,
          req.file.mimetype,
          'civic-completions'
        );
      } else if (req.body.completionPhotoBase64) {
        const base64 = req.body.completionPhotoBase64;
        const mimetype = req.body.completionPhotoMimetype || 'image/jpeg';
        const dataUri = base64.startsWith('data:') ? base64 : `data:${mimetype};base64,${base64}`;
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(dataUri, { folder: 'civic-completions' }, (err, r) => {
            if (err) reject(err);
            else resolve(r?.secure_url);
          });
        });
        completionPhotoUrl = result;
      }

      if (!completionPhotoUrl) {
        return res.status(400).json({
          error: 'Completion photo required (upload file or send completionPhotoBase64)',
        });
      }

      const issue = await Issue.findOneAndUpdate(
        { _id: id, department: deptId },
        {
          status: 'COMPLETED',
          completionPhotoUrl,
          completedAt: new Date(),
          completedBy: req.user.id,
        },
        { new: true }
      )
        .populate('department', 'name')
        .populate('user', 'name email')
        .lean();

      if (!issue) return res.status(404).json({ error: 'Issue not found' });
      res.json({ ...issue, id: issue._id });
    } catch (err) {
      console.error('Complete issue error:', err);
      res.status(500).json({ error: 'Failed to complete issue' });
    }
  }
);

export default router;
