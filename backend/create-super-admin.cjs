const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-issue', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  role: {
    type: String,
    enum: ['civic', 'super_admin', 'regional_admin', 'departmental_admin'],
    default: 'civic',
  },
  region: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

async function createSuperAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('super123', 10);
    
    // Create the super admin
    const superAdmin = new User({
      email: 'super@civic.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin'
    });
    
    await superAdmin.save();
    console.log('Super admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

// Check if super admin already exists
async function checkSuperAdmin() {
  try {
    const existingAdmin = await User.findOne({ 
      email: 'super@civic.com',
      role: 'super_admin' 
    });
    
    if (existingAdmin) {
      console.log('Super admin already exists');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking super admin:', error);
    return false;
  }
}

async function main() {
  console.log('Creating super admin...');
  
  // Check if already exists
  const exists = await checkSuperAdmin();
  if (exists) {
    console.log('Super admin already exists, skipping creation');
    process.exit(0);
  }
  
  // Create new super admin
  await createSuperAdmin();
}

main();
