import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Region from './src/models/Region.js';
import Department from './src/models/Department.js';
import Issue from './src/models/Issue.js';
import Notification from './src/models/Notification.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const cleanNotifications = async () => {
    try {
        console.log('CWD:', process.cwd());
        console.log('Env Path:', path.resolve(__dirname, '.env'));
        const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
        console.log('DB URI:', uri ? 'Defined' : 'Undefined');

        if (!uri) {
            throw new Error('Database URI is missing (checked DATABASE_URL and MONGODB_URI)');
        }
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // 1. Cleanup MISSING_REGION notifications for issues that HAVE a region
        // ... (keep logic if needed, but the main issue is unlinked ones)

        // BETTER LOGIC:
        // A. Find PENDING_REGION issues
        const pendingRegionIssues = await Issue.find({ status: 'PENDING_REGION' });
        console.log(`Found ${pendingRegionIssues.length} PENDING_REGION issues.`);

        for (const issue of pendingRegionIssues) {
            if (issue.requestedRegionName) {
                // Check if region actually exists now
                const region = await Region.findOne({
                    name: { $regex: new RegExp('^' + issue.requestedRegionName.trim() + '$', 'i') }
                });

                if (region) {
                    console.log(`Region '${issue.requestedRegionName}' found for issue ${issue._id}. Updating issue and removing notification.`);

                    // Update Issue
                    await Issue.updateOne(
                        { _id: issue._id },
                        { $set: { region: region._id, status: 'PENDING_DEPARTMENT' }, $unset: { requestedRegionName: 1 } }
                    );

                    // Delete Notification
                    await Notification.deleteMany({
                        type: 'MISSING_REGION',
                        issue: issue._id
                    });
                }
            }
        }

        // B. Find PENDING_DEPARTMENT issues
        const pendingDeptIssues = await Issue.find({ status: 'PENDING_DEPARTMENT' });
        console.log(`Found ${pendingDeptIssues.length} PENDING_DEPARTMENT issues.`);

        for (const issue of pendingDeptIssues) {
            if (issue.requestedDepartmentName && issue.region) { // Must have region to find dept uniquely ideally, but name check is ok
                // Check if department exists
                const dept = await Department.findOne({
                    name: { $regex: new RegExp('^' + issue.requestedDepartmentName.trim() + '$', 'i') }
                    // We could check region too, but name is often unique enough or we take first match
                });

                if (dept) {
                    console.log(`Department '${issue.requestedDepartmentName}' found for issue ${issue._id}. Updating issue and removing notification.`);

                    await Issue.updateOne(
                        { _id: issue._id },
                        { $set: { department: dept._id, status: 'PENDING' }, $unset: { requestedDepartmentName: 1 } }
                    );

                    await Notification.deleteMany({
                        type: 'MISSING_DEPARTMENT',
                        issue: issue._id
                    });
                }
            }
        }

        // C. Also run the previous cleanup for safety (issues that ARE linked but notification stuck)
        const issuesWithRegion = await Issue.find({ region: { $ne: null } }).select('_id');
        const issueIdsWithRegion = issuesWithRegion.map(i => i._id);
        if (issueIdsWithRegion.length > 0) {
            const res = await Notification.deleteMany({
                type: 'MISSING_REGION',
                issue: { $in: issueIdsWithRegion }
            });
            console.log(`Deleted ${res.deletedCount} linked MISSING_REGION notifications.`);
        }

        const issuesWithDept = await Issue.find({ department: { $ne: null } }).select('_id');
        const issueIdsWithDept = issuesWithDept.map(i => i._id);
        if (issueIdsWithDept.length > 0) {
            const res = await Notification.deleteMany({
                type: 'MISSING_DEPARTMENT',
                issue: { $in: issueIdsWithDept }
            });
            console.log(`Deleted ${res.deletedCount} linked MISSING_DEPARTMENT notifications.`);
        }

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup error:', err);
        process.exit(1);
    }
};

cleanNotifications();
