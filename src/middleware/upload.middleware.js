import {v2 as cloudinary } from 'cloudinary';
import CloudinaryStorage from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});

// 2. Configure the storage engine
// Multer needs to know where to put files. By default, it puts them on your hard drive (DiskStorage) or keeps them in RAM (MemoryStorage). Here, we are telling it to use CloudinaryStorage.
// This creates a new "Storage Engine" object that Multer will use later.
const storage = new CloudinaryStorage({
    // This tells the storage engine: "Here are the keys and connection details to my specific Cloudinary account." (You configured this earlier using cloudinary.config()).

    cloudinary : cloudinary,
    params : {
        folder : 'blogpulse', // Cloudinary will create a folder named this
        allowed_formats : [' jpg, jpeg, png, webp '],
        transformation: [{ width: 800, height: 600, crop: 'limit' }] // Auto-resize large images
    }
});

// 3. Create the multer upload middleware
const upload = multer({
    storage : storage, // This initializes the Multer middleware function.
    limits : {fileSize : 5*1024 * 1024} // 5MB limit
});

export default upload;