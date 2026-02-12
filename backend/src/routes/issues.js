import express from 'express';
import Issue from '../models/Issue.js';
import Department from '../models/Department.js';
import Region from '../models/Region.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { uploadPhoto } from '../config/cloudinary.js';
import { uploadToCloudinary } from '../lib/uploadToCloudinary.js';
import { cloudinary } from '../config/cloudinary.js';
import { notifyDepartmentNewIssue } from '../lib/notifications.js';

const router = express.Router();

// Multer middleware - only for multipart; otherwise next
const maybeUploadPhoto = (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    uploadPhoto(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  } else {
    next();
  }
};

// Civic: Submit new issue (photo via file upload OR base64 in body)
router.post('/', authenticate, requireRole('civic'), maybeUploadPhoto, async (req, res) => {
  try {
    let photoUrl = req.body.photoUrl;

    if (req.file?.buffer) {
      photoUrl = await uploadToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        'civic-issues'
      );
    } else if (req.body.photoBase64) {
      const base64 = req.body.photoBase64;
      const mimetype = req.body.photoMimetype || 'image/jpeg';
      const dataUri = base64.startsWith('data:') ? base64 : `data:${mimetype};base64,${base64}`;
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(dataUri, { folder: 'civic-issues' }, (err, r) => {
          if (err) reject(err);
          else resolve(r?.secure_url);
        });
      });
      photoUrl = result;
    }

    if (!photoUrl) {
      return res.status(400).json({ error: 'Issue photo required (upload file or send photoBase64)' });
    }

    const { latitude, longitude, address, description, departmentId, departmentName } = req.body;

    if (!latitude || !longitude || !description) {
      return res.status(400).json({
        error: 'latitude, longitude, and description are required',
      });
    }

    let deptId = departmentId;
    let status = 'PENDING';
    let requestedDepartmentName = null;
    if (!deptId && departmentName) {
      const dept = await Department.findOne({ name: departmentName });
      if (!dept) {
        deptId = null;
        status = 'PENDING_DEPARTMENT';
        requestedDepartmentName = departmentName;
      } else {
        deptId = dept._id;
      }
    }
    if (!deptId && !requestedDepartmentName) {
      return res.status(400).json({ error: 'departmentId or departmentName is required' });
    }

    const issue = await Issue.create({
      photoUrl,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || undefined,
      description,
      department: deptId || undefined,
      requestedDepartmentName: requestedDepartmentName || undefined,
      status,
      user: req.user.id,
    });

    const populated = await Issue.findById(issue._id)
      .populate('department', 'name')
      .populate('user', 'name email')
      .lean();

    // If the issue is already assigned to a department, notify its admins
    if (populated.department) {
      notifyDepartmentNewIssue(populated);
    }

    res.status(201).json({ ...populated, id: populated._id });
  } catch (err) {
    console.error('Submit issue error:', err);
    res.status(500).json({ error: 'Failed to submit issue' });
  }
});

// All authenticated users: Get all issues (public feed)
router.get('/', authenticate, async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate({ path: 'department', select: 'name', populate: { path: 'region', select: 'name' } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const userId = req.user?.id?.toString();
    res.json(
      issues.map((i) => ({
        ...i,
        id: i._id,
        likesCount: Array.isArray(i.likes) ? i.likes.length : 0,
        commentsCount: Array.isArray(i.comments) ? i.comments.length : 0,
        likedByMe: userId ? Array.isArray(i.likes) && i.likes.some((u) => u.toString() === userId) : false,
      }))
    );
  } catch (err) {
    console.error('All issues error:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// Civic: Get my submitted issues
router.get('/my', authenticate, requireRole('civic'), async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user.id })
      .populate({ path: 'department', select: 'name', populate: { path: 'region', select: 'name' } })
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      issues.map((i) => ({
        ...i,
        id: i._id,
        likesCount: Array.isArray(i.likes) ? i.likes.length : 0,
        commentsCount: Array.isArray(i.comments) ? i.comments.length : 0,
        likedByMe: Array.isArray(i.likes) && i.likes.some((u) => u.toString() === req.user.id),
      }))
    );
  } catch (err) {
    console.error('My issues error:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// Toggle like on an issue
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const liked = Array.isArray(issue.likes) && issue.likes.some((u) => u.toString() === userId);
    if (liked) {
      issue.likes = issue.likes.filter((u) => u.toString() !== userId);
    } else {
      issue.likes = [...(issue.likes || []), userId];
    }
    await issue.save();

    res.json({
      id: issue._id,
      liked: !liked,
      likesCount: issue.likes.length,
    });
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({ error: 'Failed to update like' });
  }
});

// Get comments for an issue
router.get('/:id/comments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id)
      .populate('comments.user', 'name email')
      .lean();
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const comments = (issue.comments || []).map((c) => ({
      id: c._id,
      text: c.text,
      createdAt: c.createdAt,
      user: c.user
        ? { id: c.user._id, name: c.user.name, email: c.user.email }
        : null,
    }));

    res.json(comments);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a comment to an issue
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const comment = {
      user: req.user.id,
      text: String(text).trim(),
      createdAt: new Date(),
    };
    issue.comments = [...(issue.comments || []), comment];
    await issue.save();

    res.status(201).json({
      id: issue.comments[issue.comments.length - 1]._id,
      text: comment.text,
      createdAt: comment.createdAt,
      user: { id: req.user.id, name: req.user.name, email: req.user.email },
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
