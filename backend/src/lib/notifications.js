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

    if (!admins.length) return;

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

