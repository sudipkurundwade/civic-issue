# Civic Issue Reporter - Backend

Node.js + Express + MongoDB + Cloudinary backend for civic issue reporting.

## Setup

1. Install dependencies: `npm install`
2. Create `.env` with:

```
PORT=3001
DATABASE_URL=mongodb://localhost:27017/civic-issue-reporter
JWT_PASSWORD=super_secret_jwt_key_change_me
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

3. Ensure MongoDB is running locally
4. Seed data: `npm run seed`
5. Start: `npm run dev`

## API Endpoints

### Auth
- `POST /api/auth/register` - Civic signup `{ email, password, name, phone? }`
- `POST /api/auth/login` - Login `{ email, password }` → `{ user, token }`
- `GET /api/auth/me` - Current user (Bearer token)

### Civic - Issue Submission
- `POST /api/issues` (auth, civic) - Submit issue
  - **Option A - Multipart:** `photo` (file), `latitude`, `longitude`, `address?`, `description`, `departmentId`
  - **Option B - JSON:** `photoBase64`, `photoMimetype?`, `latitude`, `longitude`, `address?`, `description`, `departmentId`

- `GET /api/issues/my` (auth, civic) - My submitted issues

### Public (no auth)
- `GET /api/admin/regions/public` - List regions
- `GET /api/admin/departments/public` - List departments (with region)

### Super Admin
- `POST /api/admin/regions` - Create region `{ name }`
- `GET /api/admin/regions` - List regions
- `POST /api/admin/regional-admin` - Create regional admin  
  `{ email, password, name, regionId? | regionName? }`

### Regional Admin
- `POST /api/admin/departments` - Create department `{ name }`
- `GET /api/admin/departments` - My region's departments
- `POST /api/admin/departmental-admin` - Create departmental admin  
  `{ email, password, name, departmentId? | departmentName? }`

### Departmental Admin
- `GET /api/departmental/issues` - Issues for my department
- `PATCH /api/departmental/issues/:id/status` - Set status `{ status: "PENDING" | "IN_PROGRESS" }`
- `PATCH /api/departmental/issues/:id/complete` - Mark completed (requires completion photo)
  - Multipart: `completionPhoto` (file)
  - JSON: `completionPhotoBase64`, `completionPhotoMimetype?`

## Seed Accounts
- Super admin: `super@civic.com` / `super123`
- Regional admin: `regional@gokul.com` / `regional123`
- Dept admin (Road): `road@gokul.com` / `road123`
- Civic: `civic@test.com` / `civic123`
