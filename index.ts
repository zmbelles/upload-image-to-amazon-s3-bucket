import type { NextApiRequest, NextApiResponse } from "next";
import multerS3 from 'multer-s3';
import multer from "multer";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { S3Client } from '@aws-sdk/client-s3';
import { parseFormFile } from "@/lib/parse-form-file";
import AWS from "aws-sdk";
import { uploadFileToS3 } from "@/lib/amazon-s3";

//s3 instance for getSignedUrl()
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
//s3 client to upload using multers3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "DEFAULT",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "DEFAULT",
  },
});

//function to parse form data
async function parseFormData(
  req: NextApiRequest & { files?: any },
  res: NextApiResponse
) {

	//create the storage instance
  const storage = multer.memoryStorage();
  console.log("storage created");
	//attempt to create the upload instance
  const multerUpload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.AWS_BUCKET_NAME || "DEFAULT",
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        cb(null, file.originalname);
      },
    }),
  });
  console.log("multerUpload instance created");
	//create the file instance from the upload object
  const multerFiles = multerUpload.any();
  console.log("multerFiles instance created");
	//create a promise to upload the file to the s3 bucket
  try{
    await new Promise((resolve, reject) => {
      multerFiles(req as any, res as any, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
    console.log("promise created");
    // Get the URL of the uploaded file
    const url = s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.files[0].key,
    });

    // Return the URL
    return {
      url: url,
    };
  }
  catch (err) {
    return null;
  }
}
// IMPORTANT: Prevents next from trying to parse the form
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await connectDB();

  switch (method) {
    case "GET": {
      const data = req.query.data;
      res.status(200).json({ success: true, httpStatus: "200", data: data });
    }
    case "POST":
    {
        const file = await parseFormFile(req, "file");
				if(file === null){
					res.status(400).json({ success: false, httpStatus: "Bad Request" });
				}
        console.log(file);
        const url = await uploadFileToS3(file);
          
				res.status(201).json({ success: true, httpStatus: "Accepted", data: url})
  	}
	}
}
