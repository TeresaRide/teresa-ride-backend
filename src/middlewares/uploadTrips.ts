import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
const tripsDir = path.join(uploadsRoot, 'trips');

if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot);
if (!fs.existsSync(tripsDir)) fs.mkdirSync(tripsDir);

const storageTrips = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tripsDir),
  filename: (req, file, cb) => {
    const safeBase = String(req.body.origin || 'trip').replace(/[^\w-]/g, '_');
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${safeBase}-${Date.now()}${ext}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Solo se permiten imágenes') as unknown as null, false);
};

export const uploadTripImage = multer({
  storage: storageTrips,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});
