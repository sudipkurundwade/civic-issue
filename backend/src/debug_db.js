import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Department from './models/Department.js';

async function debug() {
    await mongoose.connect(process.env.DATABASE_URL);

    console.log("--- Departments ---");
    const departments = await Department.find({});
    for (const d of departments) {
        console.log(`Dept: ${d.name} (_id: ${d._id}, region: ${d.region})`);
    }

    console.log("\n--- Departmental Admins ---");
    const admins = await User.find({ role: 'departmental_admin' });
    for (const u of admins) {
        console.log(`User: ${u.email} (dept: ${u.department})`);

        // Check if matches any department
        const match = departments.find(d => d._id.toString() === (u.department ? u.department.toString() : 'null'));
        if (match) {
            console.log(`   -> Matches Dept: ${match.name}`);
        } else {
            console.log(`   -> NO MATCHING DEPARTMENT`);
        }
    }

    console.log("\nDone");
    process.exit(0);
}

debug().catch(console.error);
