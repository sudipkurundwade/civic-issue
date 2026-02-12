import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Region from '../models/Region.js';
import Department from '../models/Department.js';
import Issue from '../models/Issue.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../lib/email.js';

const router = express.Router();

// ------ SUPER ADMIN ------

// Create regional admin (assign to existing region or create region)
router.post('/regional-admin', authenticate, requireRole('super_admin'), async (req, res) => {
  try {
    const { email, password, name, regionId, regionName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, name are required' });
    }

    let region;
    if (regionId) {
      region = await Region.findById(regionId);
      if (!region) return res.status(404).json({ error: 'Region not found' });
    } else if (regionName) {
      region = await Region.create({ name: regionName });
    } else {
      return res.status(400).json({ error: 'regionId or regionName required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({
      email,
      password,
      name,
      role: 'regional_admin',
      region: region._id,
    });

    const u = await User.findById(user._id)
      .select('-password')
      .populate('region', 'name')
      .lean();

    // Send email
    await sendWelcomeEmail({
      to: email,
      name,
      email,
      password,
      role: 'regional_admin',
      creatorName: req.user.name,
      creatorEmail: req.user.email,
      creatorRole: req.user.role
    });

    res.status(201).json({ ...u, id: u._id });
  } catch (err) {
    console.error('Create regional admin error:', err);
    res.status(500).json({ error: 'Failed to create regional admin' });
  }
});

// List all regions
router.get('/regions', authenticate, requireRole('super_admin'), async (req, res) => {
  try {
    const regions = await Region.find().sort({ name: 1 }).lean();
    res.json(regions.map((r) => ({ ...r, id: r._id })));
  } catch (err) {
    console.error('Regions error:', err);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

// Create region (super admin)
router.post('/regions', authenticate, requireRole('super_admin'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    const region = await Region.create({ name });
    res.status(201).json({ ...region.toObject(), id: region._id });
  } catch (err) {
    console.error('Create region error:', err);
    res.status(500).json({ error: 'Failed to create region' });
  }
});

// ------ REGIONAL ADMIN ------

// Create departmental admin
router.post('/departmental-admin', authenticate, requireRole('regional_admin'), async (req, res) => {
  try {
    const { email, password, name, departmentId, departmentName } = req.body;
    const regionId = req.user.region;

    if (!regionId) return res.status(403).json({ error: 'Regional admin has no region' });
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, name are required' });
    }

    let department;
    if (departmentId) {
      department = await Department.findOne({ _id: departmentId, region: regionId });
      if (!department) return res.status(404).json({ error: 'Department not found in your region' });
    } else if (departmentName) {
      const name = String(departmentName).trim();
      if (!name) return res.status(400).json({ error: 'departmentName required' });

      // Reuse existing department in this region if it already exists,
      // so we don't create the same department twice.
      department = await Department.findOne({ name, region: regionId });
      if (!department) {
        department = await Department.create({ name, region: regionId });
      }
    } else {
      return res.status(400).json({ error: 'departmentId or departmentName required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({
      email,
      password,
      name,
      role: 'departmental_admin',
      department: department._id,
    });

    // Assign any pending issues that were waiting for this department name
    await Issue.updateMany(
      { status: 'PENDING_DEPARTMENT', requestedDepartmentName: department.name },
      { $set: { department: department._id, status: 'PENDING' }, $unset: { requestedDepartmentName: 1 } }
    );

    const u = await User.findById(user._id)
      .select('-password')
      .populate('department', 'name')
      .populate({ path: 'department', populate: { path: 'region', select: 'name' } })
      .lean();

    // Send email
    await sendWelcomeEmail({
      to: email,
      name,
      email,
      password,
      role: 'departmental_admin',
      creatorName: req.user.name,
      creatorEmail: req.user.email,
      creatorRole: req.user.role,
      creatorRegion: u.department.region.name // We populated this
    });

    res.status(201).json({ ...u, id: u._id });
  } catch (err) {
    console.error('Create departmental admin error:', err);
    res.status(500).json({ error: 'Failed to create departmental admin' });
  }
});

// List departments in my region
router.get('/departments', authenticate, requireRole('regional_admin'), async (req, res) => {
  try {
    const regionId = req.user.region;
    if (!regionId) return res.status(403).json({ error: 'No region assigned' });

    const departments = await Department.find({ region: regionId })
      .populate('region', 'name')
      .sort({ name: 1 })
      .lean();

    // Fetch departmental admins for these departments
    const deptIds = departments.map(d => d._id);
    const admins = await User.find({
      role: 'departmental_admin',
      department: { $in: deptIds }
    }).select('email name department');

    // Create a map of departmentId -> admin details
    const adminMap = {};
    admins.forEach(admin => {
      adminMap[admin.department.toString()] = {
        email: admin.email,
        name: admin.name
      };
    });

    const result = departments.map((d) => ({
      ...d,
      id: d._id,
      assignedAdmin: adminMap[d._id.toString()] || null
    }));

    res.json(result);
  } catch (err) {
    console.error('Departments error:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Create department (regional admin)
router.post('/departments', authenticate, requireRole('regional_admin'), async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const regionId = req.user.region;

    if (!regionId) return res.status(403).json({ error: 'No region assigned' });
    if (!name) return res.status(400).json({ error: 'name required' });

    // Prevent duplicate departments with the same name in this region.
    let existing = await Department.findOne({ name, region: regionId });
    if (existing) {
      return res.status(400).json({ error: 'Department already exists in your region' });
    }

    const department = await Department.create({ name, region: regionId });
    const d = await Department.findById(department._id).populate('region', 'name').lean();
    res.status(201).json({ ...d, id: d._id });
  } catch (err) {
    console.error('Create department error:', err);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Regional admin: Get issues awaiting department creation (PENDING_DEPARTMENT)
router.get('/pending-department-issues', authenticate, requireRole('regional_admin'), async (req, res) => {
  try {
    const issues = await Issue.find({ status: 'PENDING_DEPARTMENT' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(issues.map((i) => ({ ...i, id: i._id })));
  } catch (err) {
    console.error('Pending department issues error:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// Regional admin: Create department and assign pending issues with that name
router.post('/create-department-and-assign', authenticate, requireRole('regional_admin'), async (req, res) => {
  try {
    const { departmentName } = req.body;
    const regionId = req.user.region;
    if (!regionId) return res.status(403).json({ error: 'No region assigned' });
    if (!departmentName || !String(departmentName).trim()) {
      return res.status(400).json({ error: 'departmentName required' });
    }
    const name = String(departmentName).trim();
    let department = await Department.findOne({ name, region: regionId });
    if (!department) {
      department = await Department.create({ name, region: regionId });
    }
    const updated = await Issue.updateMany(
      { status: 'PENDING_DEPARTMENT', requestedDepartmentName: name },
      { $set: { department: department._id, status: 'PENDING', $unset: { requestedDepartmentName: 1 } } }
    );
    res.json({
      department: { ...department.toObject(), id: department._id },
      issuesAssigned: updated.modifiedCount,
    });
  } catch (err) {
    console.error('Create department and assign error:', err);
    res.status(500).json({ error: 'Failed to create and assign' });
  }
});

// List departments (civic can see all - for dropdown when submitting)
router.get('/departments/public', async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('region', 'name')
      .sort({ name: 1 })
      .lean();

    res.json(departments.map((d) => ({ ...d, id: d._id })));
  } catch (err) {
    console.error('Public departments error:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// List regions (public - for civic to pick department by region)
router.get('/regions/public', async (req, res) => {
  try {
    const regions = await Region.find().sort({ name: 1 }).lean();
    res.json(regions.map((r) => ({ ...r, id: r._id })));
  } catch (err) {
    console.error('Public regions error:', err);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

export default router;
