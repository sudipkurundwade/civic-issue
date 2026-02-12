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
  let gokul = await Region.findOne({ name: 'Gokulshigaon' });
  if (!gokul) {
    gokul = await Region.create({ name: 'Gokulshigaon' });
    console.log('Created region: Gokulshigaon');
  }

  let karveer = await Region.findOne({ name: 'Karveer' });
  if (!karveer) {
    karveer = await Region.create({ name: 'Karveer' });
    console.log('Created region: Karveer');
  }

  // Departments
  let roadDept = await Department.findOne({ name: 'Road Department', region: gokul._id });
  if (!roadDept) {
    roadDept = await Department.create({ name: 'Road Department', region: gokul._id });
  }
  let lightDept = await Department.findOne({ name: 'Light Department', region: gokul._id });
  if (!lightDept) {
    lightDept = await Department.create({ name: 'Light Department', region: gokul._id });
  }
  console.log('Created/updated departments: Road, Light');

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
