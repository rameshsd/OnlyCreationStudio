
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
// This ensures that the environment variable is read and applied before the export.
cloudinary.config({ 
  cloud_name: 'dkmgby1tc', 
  api_key: '866268445612429', 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true 
});

export { cloudinary };
