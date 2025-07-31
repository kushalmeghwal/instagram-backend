import cloudinary from 'cloudinary'
import dotenv from 'dotenv';
dotenv.config(); 



// import { Files } from 'formidable';

const Cloudinary = cloudinary.v2;
Cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

export const FileUpload = async (file: string) => {
  try {
       

    const result = await Cloudinary.uploader.upload(file);

    return result.secure_url;
  } catch (err) {
     
    throw new Error('upload image error');
  }
}
