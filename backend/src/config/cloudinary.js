import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = (file.originalname || '').split('.').pop()?.toLowerCase();
  if (allowed.test(ext) || file.mimetype?.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('photo');

export const uploadCompletionPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('completionPhoto');

export { cloudinary };
