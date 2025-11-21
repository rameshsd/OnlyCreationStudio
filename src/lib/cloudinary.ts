
'use server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: 'dkmgby1tc', 
  api_key: '866268445612429', 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true 
});

export { cloudinary };
