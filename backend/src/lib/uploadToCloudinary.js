import { cloudinary } from '../config/cloudinary.js';

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer from multer
 * @param {string} mimetype - e.g. 'image/jpeg'
 * @param {string} folder - Cloudinary folder (e.g. 'civic-issues', 'civic-completions')
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
export const uploadToCloudinary = (buffer, mimetype = 'image/jpeg', folder = 'civic-issues') => {
  const base64 = buffer.toString('base64');
  const dataUri = `data:${mimetype};base64,${base64}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(dataUri, { folder }, (err, result) => {
      if (err) return reject(err);
      if (!result?.secure_url) return reject(new Error('Upload failed'));
      resolve(result.secure_url);
    });
  });
};
