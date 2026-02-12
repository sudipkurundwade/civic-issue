import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './lib/db.js';
import User from './models/User.js';
import Issue from './models/Issue.js';
import authRoutes from './routes/auth.js';
import issuesRoutes from './routes/issues.js';
import adminRoutes from './routes/admin.js';
import departmentalRoutes from './routes/departmental.js';
import notificationRoutes from './routes/notifications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Predefined Super Admin credentials (change in production!)
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'super@civic.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'super123';

async function dropInvalidIssueIndex() {
  try {
    const indexes = await Issue.collection.indexes();
    if (indexes.some((i) => i.name === 'title_1')) {
      await Issue.collection.dropIndex('title_1');
      console.log('Dropped invalid title_1 index from issues');
    }
  } catch (err) {
    if (err.codeName !== 'IndexNotFound') console.warn('Index drop:', err.message);
  }
}

async function ensureSuperAdmin() {
  const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL });
  if (!existing) {
    await User.create({
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      name: 'Super Admin',
      role: 'super_admin',
    });
    console.log(`Super Admin created: ${SUPER_ADMIN_EMAIL} / ${SUPER_ADMIN_PASSWORD}`);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // For base64 images in JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files if using local (fallback - we use Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departmental', departmentalRoutes);
app.use('/api/notifications', notificationRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

connectDB()
  .then(() => dropInvalidIssueIndex())
  .then(() => ensureSuperAdmin())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Super Admin login: ${SUPER_ADMIN_EMAIL} / ${SUPER_ADMIN_PASSWORD}`);
    });
  });
