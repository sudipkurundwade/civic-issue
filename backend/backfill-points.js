import 'dotenv/config';
import { connectDB } from './src/lib/db.js';
import User from './src/models/User.js';
import Issue from './src/models/Issue.js';

/**
 * Migration script to backfill points for existing users
 * Awards 10 points for each issue a user has reported
 */
async function backfillUserPoints() {
    try {
        console.log('Starting points backfill migration...\n');

        await connectDB();

        // Get all civic users
        const users = await User.find({ role: 'civic' });
        console.log(`Found ${users.length} civic users\n`);

        let totalPointsAwarded = 0;
        let usersUpdated = 0;

        for (const user of users) {
            // Count issues reported by this user
            const issueCount = await Issue.countDocuments({ user: user._id });

            if (issueCount > 0) {
                // Calculate points (10 per issue)
                const points = issueCount * 10;

                // Update user's points
                await User.findByIdAndUpdate(user._id, {
                    $set: { points: points }
                });

                console.log(`✓ ${user.name} (${user.email}): ${issueCount} issues → ${points} points`);
                totalPointsAwarded += points;
                usersUpdated++;
            } else {
                console.log(`- ${user.name} (${user.email}): No issues reported`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('Migration completed successfully!');
        console.log('='.repeat(60));
        console.log(`Users updated: ${usersUpdated}`);
        console.log(`Total points awarded: ${totalPointsAwarded}`);
        console.log('='.repeat(60) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

backfillUserPoints();
