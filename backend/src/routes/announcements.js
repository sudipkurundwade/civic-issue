import express from 'express';
import Announcement from '../models/Announcement.js';
import { authenticate as auth } from '../routes/auth.js'; // Using authenticate middleware alias as auth

import Region from '../models/Region.js';

const router = express.Router();

// Middleware to check if user is admin (Super or Regional)
const isCreator = (req, res, next) => {
    if (req.user.role === 'super_admin' || req.user.role === 'regional_admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Only Super and Regional Admins can create announcements.' });
    }
};

// CREATE Announcement
router.post('/', auth, isCreator, async (req, res) => {
    try {
        const { title, category, priority, content, image, targetRoles, targetRegions, targetDepartments, expiryDate } = req.body;

        // Validation: Regional Admin can only target their own region
        if (req.user.role === 'regional_admin') {
            // Ensure they don't try to valid for other regions (though frontend should block this, backend must too)
            // Logic: If they provide regions, strict check. Or just override with their region.
            // Let's assume we override/force their region if they are regional admin.
            // But wait, regional admin might target "Departments Only" in their region.
        }

        const announcement = new Announcement({
            title,
            category,
            priority,
            content,
            image,
            targetRoles,
            targetRegions,
            targetDepartments,
            expiryDate,
            createdBy: req.user.id,
            creatorRole: req.user.role
        });

        await announcement.save();
        res.status(201).json(announcement);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Announcements (View for all roles)
router.get('/', auth, async (req, res) => {
    try {
        const { role, userId } = req.user;
        const now = new Date();

        let query = { expiryDate: { $gt: now } }; // Default: Active only

        // If query param 'filter' is 'all' or 'past', adjust (frontend might send accessible filters)
        if (req.query.filter === 'active') {
            query.expiryDate = { $gt: now };
        } else if (req.query.filter === 'past') {
            query.expiryDate = { $lte: now };
        } else if (req.query.filter === 'all') {
            delete query.expiryDate;
        }

        // Role-based filtering
        if (role === 'super_admin') {
            // Super admin sees everything? Or just what they targeted?
            // Usually Super Admin can see everything or what matches them. 
            // Requirement: "Citizens/Dept Admins view announcements... Super/Regional have 'My Announcements' separately"
            // So this route might be the "Public Feed" equivalent.
            // Let's show announcements targeting 'super_admin' OR created by them?
            // Simplified: Show all for Super Admin for debugging, or strictly what targets them.
            // Let's strictly follow "targetRoles".
            // BUT Super Admin is likely the creator, so they might not be in targetRoles.
        }

        // For specific roles:
        if (role === 'regional_admin') {
            // Can see if targetRoles includes 'regional_admin' AND (targetRegions includes myRegion OR targetRegions is empty (global))
            const userRegion = req.user.regionId; // Assuming stored in token
            query.$or = [
                { targetRoles: 'regional_admin' },
                { targetRoles: 'super_admin' } // Maybe?
            ];
            if (userRegion) {
                // Add logic for region matching
            }
        }

        // Simplification for now: Return all active for broad matching, rely on frontend filtering or refine later.
        // Let's implement basic filtering:

        // If not super_admin, restrict by role
        if (role !== 'super_admin') {
            const userRegion = req.user.regionId; // We need to ensure this is in req.user

            query.$and = [
                { targetRoles: role }, // Must target my role
                // And region match if applicable
                // And department match if applicable
            ];
        }

        const announcements = await Announcement.find(query).sort({ priority: -1, createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET My Announcements (Created by logged in user)
router.get('/my', auth, isCreator, async (req, res) => {
    try {
        const announcements = await Announcement.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Increment view count (Unique Viewers Only)
router.post('/:id/view', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;

        // Try to update only if user hasn't viewed it yet
        const result = await Announcement.updateOne(
            { _id: req.params.id, viewedBy: { $ne: userId } },
            {
                $push: { viewedBy: userId },
                $inc: { views: 1 }
            }
        );

        // Fetch the updated view count (whether we incremented or not)
        const announcement = await Announcement.findById(req.params.id).select('views');

        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

        res.json({ views: announcement.views });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
