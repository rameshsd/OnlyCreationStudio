
import { v2 as cloudinary } from 'cloudinary';

// This configuration now happens once when the module is loaded by the server.
// Next.js handles loading the .env.local file automatically.
cloudinary.config({ 
  cloud_name: 'dkmgby1tc', 
  api_key: '866268445612429', 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true 
});

export { cloudinary };
