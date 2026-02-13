import Notification from '../models/Notification.js';
import User from '../models/User.js';

function formatStatus(status) {
  if (!status) return '';
  return String(status)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export async function notifyIssueStatusChange(issue) {
  try {
    if (!issue) return;
    const issueId = issue._id || issue.id;
    const userId =
      (issue.user && (issue.user._id || issue.user.id)) || issue.user;
    if (!userId || !issueId) return;

    const prettyStatus = formatStatus(issue.status);
    const shortDescription =
      (issue.description || '').length > 80
        ? `${issue.description.slice(0, 77)}...`
        : issue.description || 'your reported issue';

    await Notification.create({
      user: userId,
      title: 'Issue status updated',
      message: `The status of "${shortDescription}" is now ${prettyStatus}.`,
      type: 'ISSUE_STATUS',
      issue: issueId,
    });
  } catch (err) {
    console.warn('notifyIssueStatusChange error:', err.message);
  }
}

export async function notifyDepartmentNewIssue(issue) {
  try {
    if (!issue) return;
    const issueId = issue._id || issue.id;
    const deptId =
      (issue.department && (issue.department._id || issue.department.id)) ||
      issue.department;
    if (!deptId || !issueId) return;

    const admins = await User.find({
      role: 'departmental_admin',
      department: deptId,
    })
      .select('_id')
      .lean();

    if (!admins.length) {
      // Fallback: Notify Regional Admin that this department has no admin
      await notifyRegionalAdminMissingDepartmentAdmin(issue);
      return;
    }

    const eligibleAdmins = [];
    for (const a of admins) {
      const exists = await Notification.exists({
        user: a._id,
        type: 'NEW_ISSUE_ASSIGNED',
        issue: issueId,
      });
      if (!exists) eligibleAdmins.push(a);
    }

    if (!eligibleAdmins.length) return;

    const shortDescription =
      (issue.description || '').length > 80
        ? `${issue.description.slice(0, 77)}...`
        : issue.description || 'a new issue';

    const docs = eligibleAdmins.map((a) => ({
      user: a._id,
      title: 'New issue assigned to your department',
      message: `A new issue has been assigned: "${shortDescription}".`,
      type: 'NEW_ISSUE_ASSIGNED',
      issue: issueId,
    }));

    await Notification.insertMany(docs);
  } catch (err) {
    console.warn('notifyDepartmentNewIssue error:', err.message);
  }
}

export async function notifyRegionalAdminMissingDepartmentAdmin(issue) {
  try {
    if (!issue) return;
    const issueId = issue._id || issue.id;
    const regionId = (issue.region && (issue.region._id || issue.region.id)) || issue.region;
    if (!regionId || !issueId) return;

    // Find regional admins for this region
    const admins = await User.find({
      role: 'regional_admin',
      region: regionId,
    }).select('_id');

    if (!admins.length) return;

    const shortDescription =
      (issue.description || '').length > 50
        ? `${issue.description.slice(0, 47)}...`
        : issue.description || 'Issue';

    const deptName = issue.department?.name || issue.requestedDepartmentName || 'Unknown Department';

    const docs = admins.map((a) => ({
      user: a._id,
      title: 'Missing Department Admin',
      message: `Issue "${shortDescription}" assigned to department "${deptName}" which has no Departmental Admin.`,
      type: 'MISSING_DEPARTMENT_ADMIN',
      issue: issueId,
    }));

    await Notification.insertMany(docs);
  } catch (err) {
    console.warn('notifyRegionalAdminMissingDepartmentAdmin error:', err.message);
  }
}


export async function notifyRegionalAdminMissingDepartment(issue) {
  try {
    if (!issue) return;
    const issueId = issue._id || issue.id;
    const regionId =
      (issue.region && (issue.region._id || issue.region.id)) || issue.region;
    if (!regionId || !issueId) return;

    // Find regional admins for this region
    const admins = await User.find({
      role: 'regional_admin',
      region: regionId,
    }).select('_id');

    if (!admins.length) return;

    const shortDescription =
      (issue.description || '').length > 50
        ? `${issue.description.slice(0, 47)}...`
        : issue.description || 'Issue';

    const docs = admins.map((a) => ({
      user: a._id,
      title: 'Missing Department for Issue',
      message: `Issue "${shortDescription}" needs department "${issue.requestedDepartmentName}" created in your region.`,
      type: 'MISSING_DEPARTMENT',
      issue: issueId,
    }));

    await Notification.insertMany(docs);
  } catch (err) {
    console.warn('notifyRegionalAdminMissingDepartment error:', err.message);
  }
}

export async function notifySuperAdminMissingRegion(issue) {
  try {
    if (!issue) return;
    const issueId = issue._id || issue.id;
    if (!issueId) return;

    // Find super admins
    const admins = await User.find({ role: 'super_admin' }).select('_id');

    if (!admins.length) return;

    const shortDescription =
      (issue.description || '').length > 50
        ? `${issue.description.slice(0, 47)}...`
        : issue.description || 'Issue';

    const docs = admins.map((a) => ({
      user: a._id,
      title: 'Missing Region for Issue',
      message: `Issue "${shortDescription}" requested unknown region "${issue.requestedRegionName}".`,
      type: 'MISSING_REGION',
      issue: issueId,
    }));

    await Notification.insertMany(docs);
  } catch (err) {
    console.warn('notifySuperAdminMissingRegion error:', err.message);
  }
}

export async function notifySuperAdminMissingRegionalAdmin(issue) {
  try {
    if (!issue) return;
    const issueId = issue._id || issue.id;
    if (!issueId) return;

    // Find super admins
    const admins = await User.find({ role: 'super_admin' }).select('_id');

    if (!admins.length) return;

    const shortDescription =
      (issue.description || '').length > 50
        ? `${issue.description.slice(0, 47)}...`
        : issue.description || 'Issue';

    const regionName = issue.region?.name || issue.requestedRegionName || 'Unknown Region';

    const docs = admins.map((a) => ({
      user: a._id,
      title: 'Missing Regional Admin',
      message: `Issue "${shortDescription}" reported in region "${regionName}" which has no Regional Admin assigned.`,
      type: 'MISSING_REGION',
      issue: issueId,
    }));

    await Notification.insertMany(docs);
  } catch (err) {
    console.warn('notifySuperAdminMissingRegionalAdmin error:', err.message);
  }
}
