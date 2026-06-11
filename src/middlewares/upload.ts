import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
const vehiclesDir = path.join(uploadsRoot, 'vehicles');

if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot);
if (!fs.existsSync(vehiclesDir)) fs.mkdirSync(vehiclesDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, vehiclesDir);
  },
  filename: (req, file, cb) => {
    const safeBase = String(req.body.license_plate || 'vehicle').replace(/[^\w-]/g, '_');
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${safeBase}-${Date.now()}${ext}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Solo se permiten imágenes') as unknown as null, false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});