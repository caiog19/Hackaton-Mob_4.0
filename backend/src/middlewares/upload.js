const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'reports',                
    resource_type: 'image',
    format: async () => 'webp',
    transformation: [{ width: 1600, height: 1600, crop: 'limit' }],
  },
});

const fileFilter = (_req, file, cb) => {
  if (/image\/(png|jpe?g|webp)/i.test(file.mimetype)) cb(null, true);
  else cb(new Error('Arquivo de imagem inválido (use PNG, JPG ou WEBP).'));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});
