import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Region from '../models/Region.js';
import Department from '../models/Department.js';
import Issue from '../models/Issue.js';
import Notification from '../models/Notification.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../lib/email.js';
import { notifyDepartmentNewIssue } from '../lib/notifications.js';

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
      // Check if region already exists (case-insensitive)
      const existingRegion = await Region.findOne({
        name: { $regex: new RegExp('^' + regionName.trim() + '$', 'i') }
      });

      if (existingRegion) {
        return res.status(400).json({ error: 'Region with this name already exists' });
      }

      region = await Region.create({ name: regionName.trim() });

      // Retroactively assign pending issues that were waiting for this region
      const updated = await Issue.updateMany(
        { status: 'PENDING_REGION', requestedRegionName: regionName },
        { $set: { region: region._id, status: 'PENDING_DEPARTMENT' }, $unset: { requestedRegionName: 1 } }
      );

      // CLEANUP: Remove "MISSING_REGION" notifications
      const issuesInRegion = await Issue.find({ region: region._id, status: 'PENDING_DEPARTMENT' }).select('_id');
      const issueIds = issuesInRegion.map(i => i._id);

      if (issueIds.length > 0) {
        await Notification.deleteMany({
          type: 'MISSING_REGION',
          issue: { $in: issueIds }
        });
      }
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

    // Notify this new regional admin about any issues that are waiting for departments in their region
    const pendingIssues = await Issue.find({
      region: region._id,
      status: 'PENDING_DEPARTMENT',
    })
      .limit(20)
      .lean();

    if (pendingIssues.length > 0) {
      const { notifyRegionalAdminMissingDepartment } = await import('../lib/notifications.js');

      // Group issues by department name to avoid duplicate notifications
      const issuesByDepartment = {};
      pendingIssues.forEach(issue => {
        const deptName = issue.requestedDepartmentName;
        if (!issuesByDepartment[deptName]) {
          issuesByDepartment[deptName] = issue;
        }
      });

      // Send one notification per unique department needed
      for (const issue of Object.values(issuesByDepartment)) {
        notifyRegionalAdminMissingDepartment(issue);
      }
    }

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

    // Check if region already exists (case-insensitive)
    const existingRegion = await Region.findOne({
      name: { $regex: new RegExp('^' + name.trim() + '$', 'i') }
    });

    if (existingRegion) {
      return res.status(400).json({ error: 'Region with this name already exists' });
    }

    const region = await Region.create({ name: name.trim() });

    // Retroactively assign pending issues that were waiting for this region
    const updated = await Issue.updateMany(
      { status: 'PENDING_REGION', requestedRegionName: name },
      { $set: { region: region._id, status: 'PENDING_DEPARTMENT' }, $unset: { requestedRegionName: 1 } }
    );

    // CLEANUP: Remove "MISSING_REGION" notifications for issues that have now been assigned a region
    // We need to find the issues that were updated. Since updateMany doesn't return docs, we should have found them first or just delete based on query.
    // Finding issues first is safer to ensure we target the right notifications.
    // However, for simplicity and performance, we can delete notifications where the issue is now in 'PENDING_DEPARTMENT' and region is this region.
    // Actually, simpler: Find issues that are now in this region and were just updated. 
    // But since we already updated them, we can't query by previous state.
    // Alternative: Delete notifications where type is MISSING_REGION and the linked issue has region = new region.

    // Efficient approach:
    // 1. Find IDs of issues in this region that are PENDING_DEPARTMENT (which we just set)
    // 2. Delete MISSING_REGION notifications for those IDs.
    const issuesInRegion = await Issue.find({ region: region._id, status: 'PENDING_DEPARTMENT' }).select('_id');
    const issueIds = issuesInRegion.map(i => i._id);

    if (issueIds.length > 0) {
      await Notification.deleteMany({
        type: 'MISSING_REGION',
        issue: { $in: issueIds }
      });
    }

    // Mark all related notifications as read since the region is now created
    console.log('Attempting to mark notifications as read for region:', name.trim());
    console.log('Looking for notifications with type: MISSING_REGION');

    // First, let's find all unread MISSING_REGION notifications for this super admin
    const allUnreadRegionNotifications = await Notification.find({
      type: 'MISSING_REGION',
      read: false,
      user: req.user._id
    }).lean();

    console.log('Found unread region notifications:', allUnreadRegionNotifications.length);
    console.log('Notification details:', allUnreadRegionNotifications.map(n => ({
      id: n._id,
      requestedRegionName: n.issue?.requestedRegionName,
      message: n.message
    })));

    // Try multiple approaches to mark notifications as read

    // Approach 1: Exact string matching
    const exactMatchResult = await Notification.updateMany(
      {
        type: 'MISSING_REGION',
        read: false,
        user: req.user._id,
        'issue.requestedRegionName': name.trim()
      },
      { $set: { read: true } }
    );

    console.log('Exact match result:', exactMatchResult);

    // Approach 2: Case-insensitive regex matching
    const regexMatchResult = await Notification.updateMany(
      {
        type: 'MISSING_REGION',
        read: false,
        user: req.user._id,
        'issue.requestedRegionName': { $regex: new RegExp('^' + name.trim() + '$', 'i') }
      },
      { $set: { read: true } }
    );

    console.log('Regex match result:', regexMatchResult);

    // Approach 3: If still unread, clear all MISSING_REGION notifications for this user
    const remainingUnread = await Notification.countDocuments({
      type: 'MISSING_REGION',
      read: false,
      user: req.user._id
    });

    console.log('Remaining unread after specific attempts:', remainingUnread);

    if (remainingUnread > 0) {
      const clearAllResult = await Notification.updateMany(
        {
          type: 'MISSING_REGION',
          read: false,
          user: req.user._id
        },
        { $set: { read: true } }
      );

      console.log('Clear all result:', clearAllResult);
    }

    // Find regional admins for this region
    const regionalAdmins = await User.find({
      role: 'regional_admin',
      region: region._id
    }).lean();

    // If there are pending department issues and regional admins, notify them
    if (updated.modifiedCount > 0 && regionalAdmins.length > 0) {
      const { notifyRegionalAdminMissingDepartment } = await import('../lib/notifications.js');
      const pendingIssues = await Issue.find({
        region: region._id,
        status: 'PENDING_DEPARTMENT'
      }).limit(20).lean();

      // Group issues by department name to avoid duplicate notifications
      const issuesByDepartment = {};
      pendingIssues.forEach(issue => {
        const deptName = issue.requestedDepartmentName;
        if (!issuesByDepartment[deptName]) {
          issuesByDepartment[deptName] = issue;
        }
      });

      // Send one notification per unique department needed
      for (const issue of Object.values(issuesByDepartment)) {
        notifyRegionalAdminMissingDepartment(issue);
      }
    }

    res.status(201).json({
      ...region.toObject(),
      id: region._id,
      issuesUpdated: updated.modifiedCount,
      regionalAdminsNotified: updated.modifiedCount > 0 && regionalAdmins.length > 0
    });
  } catch (err) {
    console.error('Create region error:', err);
    res.status(500).json({ error: 'Failed to create region' });
  }
});

// Super admin: System-wide reporting summary
router.get('/reports/system-summary', authenticate, requireRole('super_admin'), async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate({ path: 'department', populate: { path: 'region' } })
      .lean();

    const totalIssues = issues.length;
    const statusDistribution = issues.reduce(
      (acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1;
        return acc;
      },
      {}
    );

    // Region and department performance
    const regionStats = {};
    const deptStats = {};
    const SLA_HOURS = 72;

    issues.forEach((i) => {
      const dept = i.department;
      const region = dept?.region;
      const regionKey = region ? region._id.toString() : 'unassigned';
      const deptKey = dept ? dept._id.toString() : 'unassigned';

      if (!regionStats[regionKey]) {
        regionStats[regionKey] = {
          id: region?._id,
          name: region?.name || 'Unassigned',
          totalIssues: 0,
          completed: 0,
          totalResolutionHours: 0,
          resolutionCount: 0,
          slaBreaches: 0,
        };
      }
      if (!deptStats[deptKey]) {
        deptStats[deptKey] = {
          id: dept?._id,
          name: dept?.name || 'Unassigned',
          regionId: region?._id,
          regionName: region?.name || 'Unassigned',
          totalIssues: 0,
          completed: 0,
          totalResolutionHours: 0,
          resolutionCount: 0,
          slaBreaches: 0,
        };
      }

      const r = regionStats[regionKey];
      const d = deptStats[deptKey];
      r.totalIssues += 1;
      d.totalIssues += 1;

      if (i.status === 'COMPLETED' && i.createdAt && i.completedAt) {
        const hours =
          (new Date(i.completedAt).getTime() - new Date(i.createdAt).getTime()) /
          (1000 * 60 * 60);
        r.completed += 1;
        d.completed += 1;
        r.totalResolutionHours += hours;
        d.totalResolutionHours += hours;
        r.resolutionCount += 1;
        d.resolutionCount += 1;
        if (hours > SLA_HOURS) {
          r.slaBreaches += 1;
          d.slaBreaches += 1;
        }
      }
    });

    const regionPerformance = Object.values(regionStats).map((r) => ({
      id: r.id,
      name: r.name,
      totalIssues: r.totalIssues,
      completed: r.completed,
      averageResolutionHours:
        r.resolutionCount > 0
          ? r.totalResolutionHours / r.resolutionCount
          : null,
      slaBreaches: r.slaBreaches,
    }));

    const departmentEfficiency = Object.values(deptStats).map((d) => ({
      id: d.id,
      name: d.name,
      regionId: d.regionId,
      regionName: d.regionName,
      totalIssues: d.totalIssues,
      completed: d.completed,
      averageResolutionHours:
        d.resolutionCount > 0
          ? d.totalResolutionHours / d.resolutionCount
          : null,
      slaBreaches: d.slaBreaches,
    }));

    const totalCompleted = issues.filter((i) => i.status === 'COMPLETED').length;
    const totalBreaches = departmentEfficiency.reduce(
      (sum, d) => sum + d.slaBreaches,
      0
    );

    // Basic insights (most/least issues, fastest/slowest departments)
    const mostIssuesRegion = [...regionPerformance].sort(
      (a, b) => b.totalIssues - a.totalIssues
    )[0];
    const leastIssuesRegion = [...regionPerformance].sort(
      (a, b) => a.totalIssues - b.totalIssues
    )[0];

    const deptsWithAvg = departmentEfficiency.filter(
      (d) => d.averageResolutionHours != null && d.totalIssues > 0
    );
    const fastestDept =
      deptsWithAvg.length > 0
        ? [...deptsWithAvg].sort(
          (a, b) => a.averageResolutionHours - b.averageResolutionHours
        )[0]
        : null;
    const slowestDept =
      deptsWithAvg.length > 0
        ? [...deptsWithAvg].sort(
          (a, b) => b.averageResolutionHours - a.averageResolutionHours
        )[0]
        : null;

    const insightsText = [
      `There are ${totalIssues} issues in the system, with ${totalCompleted} completed and ${totalBreaches} SLA breaches (>${SLA_HOURS} hours).`,
      mostIssuesRegion
        ? `${mostIssuesRegion.name} has the highest volume with ${mostIssuesRegion.totalIssues} reported issues.`
        : null,
      leastIssuesRegion
        ? `${leastIssuesRegion.name} has the lowest volume with ${leastIssuesRegion.totalIssues} issues.`
        : null,
      fastestDept
        ? `The fastest department is ${fastestDept.name} in ${fastestDept.regionName}, resolving issues in an average of ${fastestDept.averageResolutionHours.toFixed(
          1
        )} hours.`
        : null,
      slowestDept && slowestDept.id !== fastestDept?.id
        ? `The slowest department is ${slowestDept.name} in ${slowestDept.regionName}, averaging ${slowestDept.averageResolutionHours.toFixed(
          1
        )} hours and ${slowestDept.slaBreaches} SLA breaches.`
        : null,
    ]
      .filter(Boolean)
      .join(' ');

    res.json({
      totalIssues,
      statusDistribution,
      regionPerformance,
      departmentEfficiency,
      sla: {
        thresholdHours: SLA_HOURS,
        totalCompleted,
        totalBreaches,
      },
      insightsText,
    });
  } catch (err) {
    console.error('System summary report error:', err);
    res.status(500).json({ error: 'Failed to generate report' });
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
      { status: 'PENDING_DEPARTMENT', requestedDepartmentName: department.name, region: regionId },
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

    // Notify this new departmental admin about any issues that were just
    // linked to their department because citizens had already reported them.
    const newlyAssignedIssues = await Issue.find({
      department: department._id,
      status: 'PENDING',
      requestedDepartmentName: { $exists: false },
    })
      .limit(20)
      .lean();

    for (const issue of newlyAssignedIssues) {
      notifyDepartmentNewIssue({ ...issue, department });
    }

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

// Regional admin: Reporting summary for my region
router.get('/reports/region-summary', authenticate, requireRole('regional_admin'), async (req, res) => {
  try {
    const regionId = req.user.region;
    if (!regionId) return res.status(403).json({ error: 'No region assigned' });
    const region = await Region.findById(regionId).select('name').lean();

    const departments = await Department.find({ region: regionId }).select('_id name').lean();
    const deptIds = departments.map((d) => d._id);

    const issues = await Issue.find({ department: { $in: deptIds } })
      .populate('department', 'name')
      .lean();

    const totalIssues = issues.length;
    const statusDistribution = issues.reduce(
      (acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1;
        return acc;
      },
      {}
    );

    const deptMap = {};
    const SLA_HOURS = 72;

    issues.forEach((i) => {
      const dept = i.department;
      const key = dept ? dept._id.toString() : 'unassigned';
      if (!deptMap[key]) {
        deptMap[key] = {
          id: dept?._id,
          name: dept?.name || 'Unassigned',
          totalIssues: 0,
          completed: 0,
          totalResolutionHours: 0,
          resolutionCount: 0,
          slaBreaches: 0,
        };
      }
      const d = deptMap[key];
      d.totalIssues += 1;
      if (i.status === 'COMPLETED' && i.createdAt && i.completedAt) {
        const hours =
          (new Date(i.completedAt).getTime() - new Date(i.createdAt).getTime()) /
          (1000 * 60 * 60);
        d.completed += 1;
        d.totalResolutionHours += hours;
        d.resolutionCount += 1;
        if (hours > SLA_HOURS) d.slaBreaches += 1;
      }
    });

    const departmentsPerformance = Object.values(deptMap).map((d) => ({
      id: d.id,
      name: d.name,
      totalIssues: d.totalIssues,
      completed: d.completed,
      averageResolutionHours:
        d.resolutionCount > 0
          ? d.totalResolutionHours / d.resolutionCount
          : null,
      slaBreaches: d.slaBreaches,
    }));

    const mostIssuesDept = [...departmentsPerformance].sort(
      (a, b) => b.totalIssues - a.totalIssues
    )[0];
    const leastIssuesDept = [...departmentsPerformance].sort(
      (a, b) => a.totalIssues - b.totalIssues
    )[0];
    const withAvg = departmentsPerformance.filter(
      (d) => d.averageResolutionHours != null && d.totalIssues > 0
    );
    const fastestDept =
      withAvg.length > 0
        ? [...withAvg].sort(
          (a, b) => a.averageResolutionHours - b.averageResolutionHours
        )[0]
        : null;
    const slowestDept =
      withAvg.length > 0
        ? [...withAvg].sort(
          (a, b) => b.averageResolutionHours - a.averageResolutionHours
        )[0]
        : null;

    const insightsText = [
      `Your region has ${totalIssues} issues across ${departmentsPerformance.length} departments.`,
      mostIssuesDept
        ? `${mostIssuesDept.name} has the highest load with ${mostIssuesDept.totalIssues} issues.`
        : null,
      leastIssuesDept
        ? `${leastIssuesDept.name} has the lowest load with ${leastIssuesDept.totalIssues} issues.`
        : null,
      fastestDept
        ? `${fastestDept.name} resolves issues fastest with an average of ${fastestDept.averageResolutionHours.toFixed(
          1
        )} hours.`
        : null,
      slowestDept && slowestDept.id !== fastestDept?.id
        ? `${slowestDept.name} is slowest, averaging ${slowestDept.averageResolutionHours.toFixed(
          1
        )} hours and ${slowestDept.slaBreaches} SLA breaches.`
        : null,
    ]
      .filter(Boolean)
      .join(' ');

    res.json({
      regionId,
      regionName: region?.name || null,
      totalIssues,
      statusDistribution,
      departments: departmentsPerformance,
      insightsText,
    });
  } catch (err) {
    console.error('Region summary report error:', err);
    res.status(500).json({ error: 'Failed to generate report' });
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
      { status: 'PENDING_DEPARTMENT', requestedDepartmentName: name, region: regionId },
      { $set: { department: department._id, status: 'PENDING', $unset: { requestedDepartmentName: 1 } } }
    );

    // Mark all related notifications as read since the department is now created
    console.log('Attempting to mark notifications as read for department:', name, 'region:', regionId);

    // Try specific matching first
    const specificUpdateResult = await Notification.updateMany(
      {
        type: 'MISSING_DEPARTMENT',
        'issue.requestedDepartmentName': { $regex: new RegExp('^' + name + '$', 'i') },
        'issue.region': regionId
      },
      { $set: { read: true } }
    );

    console.log('Specific department notification update result:', specificUpdateResult);

    // If no specific notifications were found, clear all unread MISSING_DEPARTMENT notifications for this user
    if (specificUpdateResult.modifiedCount === 0) {
      const regionalAdmins = await User.find({ role: 'regional_admin' }).select('_id').lean();
      const regionalAdminIds = regionalAdmins.map(admin => admin._id);

      const broadUpdateResult = await Notification.updateMany(
        {
          type: 'MISSING_DEPARTMENT',
          read: false,
          user: { $in: regionalAdminIds }
        },
        { $set: { read: true } }
      );

      console.log('Broad department notification update result:', broadUpdateResult);
    }

    // CLEANUP: Remove "MISSING_DEPARTMENT" notifications
    const issuesInDept = await Issue.find({ department: department._id, status: 'PENDING' }).select('_id');
    const issueIds = issuesInDept.map(i => i._id);

    if (issueIds.length > 0) {
      await Notification.deleteMany({
        type: 'MISSING_DEPARTMENT',
        issue: { $in: issueIds }
      });
    }

    // Notify departmental admins that new issues were assigned
    if (updated.modifiedCount > 0) {
      const affectedIssues = await Issue.find({
        department: department._id,
        status: 'PENDING',
      })
        .limit(20)
        .lean();
      for (const issue of affectedIssues) {
        notifyDepartmentNewIssue({ ...issue, department });
      }
    }

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
