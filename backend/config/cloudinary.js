// config/cloudinary.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('☁️ Cloudinary configured with cloud name:', process.env.CLOUDINARY_CLOUD_NAME);

// Upload file to Cloudinary
const uploadFile = async (file, options = {}) => {
  try {
    // Determine resource type based on file
    let resourceType = 'auto';
    if (options.resourceType) {
      resourceType = options.resourceType;
    } else if (file.mimetype?.startsWith('video/')) {
      resourceType = 'video';
    } else if (file.mimetype === 'application/pdf') {
      resourceType = 'raw';
    } else if (file.mimetype?.startsWith('image/')) {
      resourceType = 'image';
    }

    const result = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: options.folder || 'uploads',
        resource_type: resourceType,
        public_id: options.publicId,
        use_filename: true,
        unique_filename: true,
        ...options
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      type: resourceType,
      size: result.bytes,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Delete file from Cloudinary
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Export BOTH the cloudinary instance and helper functions
module.exports = { 
  cloudinary, 
  uploadFile, 
  deleteFile 
};