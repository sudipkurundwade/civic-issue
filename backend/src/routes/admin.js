import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Region from '../models/Region.js';
import Department from '../models/Department.js';
import { authenticate, requireRole } from '../middleware/auth.js';

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
      department = await Department.create({ name: departmentName, region: regionId });
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

    const u = await User.findById(user._id)
      .select('-password')
      .populate('department', 'name')
      .populate({ path: 'department', populate: { path: 'region', select: 'name' } })
      .lean();

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
    const { name } = req.body;
    const regionId = req.user.region;

    if (!regionId) return res.status(403).json({ error: 'No region assigned' });
    if (!name) return res.status(400).json({ error: 'name required' });

    const department = await Department.create({ name, region: regionId });
    const d = await Department.findById(department._id).populate('region', 'name').lean();
    res.status(201).json({ ...d, id: d._id });
  } catch (err) {
    console.error('Create department error:', err);
    res.status(500).json({ error: 'Failed to create department' });
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
