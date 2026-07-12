import cloudinary from '../config/cloudinary';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Sube un buffer (req.file.buffer con multer.memoryStorage) a Cloudinary
 * y devuelve la URL segura y el public_id.
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto' = 'image'
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

/**
 * Extrae el public_id de una URL de Cloudinary para poder borrar el archivo.
 * Ej: https://res.cloudinary.com/demo/image/upload/v123/teresaride/vehicles/abc.jpg
 *  -> teresaride/vehicles/abc
 */
export const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
};

/**
 * Borra un archivo de Cloudinary a partir de su URL. No lanza si no existe.
 */
export const deleteFromCloudinary = async (
  url: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<void> => {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('No se pudo borrar archivo de Cloudinary:', err);
  }
};
