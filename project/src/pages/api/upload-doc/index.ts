import formidable, {errors as formidableErrors, IncomingForm} from 'formidable';
import { NextRequest, NextResponse } from 'next/server';
import {v2 as cloudinary} from 'cloudinary'
import ResourceModel from '../../../services/ai/resource';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const config = {
  api: {
    bodyParser: false, // Disable body parsing
  },
};

async function handler(req: any, res: any) {
  const method = req.method.toLowerCase();
  console.log('received', method, 'request.');

  if (method === 'post') {

  const form = formidable({
    // uploadDir: `./tempUploads`, //Holds file(s) temporarily
    keepExtensions: true,
    multiples: true,
  });

  // Formidable parser in action
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      console.log(files, '000');
      return res.status(500).json({ error: 'Error uploading file' });
    }

    // Get names of the files uploaded
    const fileKeys = Object.keys(files);

    console.log({ fileKeys });
    try {
        const filePath = Array.isArray(files) ? files[0]: files
        console.log({filePath})
        const uploadResult = await cloudinary.uploader.upload(filePath)
        const resourceModel = new ResourceModel(uploadResult.secure_url)
        await resourceModel.loadResources()
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Error uploading file' });
    }
  });
}

}

export default handler