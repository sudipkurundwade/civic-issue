import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Region from './models/Region.js';
import Department from './models/Department.js';

async function seed() {
  await mongoose.connect(process.env.DATABASE_URL);

  // Super admin
  const existingSuper = await User.findOne({ email: 'super@civic.com' });
  if (!existingSuper) {
    await User.create({
      email: 'super@civic.com',
      password: 'super123',
      name: 'Super Admin',
      role: 'super_admin',
    });
    console.log('Created super admin: super@civic.com / super123');
  }

  // Regions
  const regionNames = [
    'Kagal', 'Jaysingpur', 'Karvir', 'Gadhinglaj', 'Murgud', 'Panhala', 'Shirur'
  ];

  const regionsMap = {};

  for (const name of regionNames) {
    let region = await Region.findOne({ name });
    if (!region) {
      region = await Region.create({ name });
      console.log(`Created region: ${name}`);
    }
    regionsMap[name] = region;
  }

  // Departments
  const deptNames = [
    'Water Supply Department',
    'Electricity / Street Lighting Department',
    'Roads & Public Works Department',
    'Solid Waste Management Department'
  ];

  for (const name of deptNames) {
    let dept = await Department.findOne({ name, region: gokul._id });
    if (!dept) {
      await Department.create({ name, region: gokul._id });
      console.log(`Created department: ${name}`);
    }
  }

  // Regional admin for Gokulshigaon
  const existingRegional = await User.findOne({ email: 'regional@gokul.com' });
  if (!existingRegional) {
    await User.create({
      email: 'regional@gokul.com',
      password: 'regional123',
      name: 'Gokul Regional Admin',
      role: 'regional_admin',
      region: gokul._id,
    });
    console.log('Created regional admin: regional@gokul.com / regional123');
  }

  // Departmental admin for Road
  const existingDept = await User.findOne({ email: 'road@gokul.com' });
  if (!existingDept) {
    await User.create({
      email: 'road@gokul.com',
      password: 'road123',
      name: 'Road Dept Admin',
      role: 'departmental_admin',
      department: roadDept._id,
    });
    console.log('Created departmental admin: road@gokul.com / road123');
  }

  // Civic user
  const existingCivic = await User.findOne({ email: 'civic@test.com' });
  if (!existingCivic) {
    await User.create({
      email: 'civic@test.com',
      password: 'civic123',
      name: 'Test Civic User',
      role: 'civic',
    });
    console.log('Created civic user: civic@test.com / civic123');
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
