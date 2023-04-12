import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client } from '@aws-sdk/client-s3';
import { parseFormFile } from "@/parse-form-file";
import AWS from "aws-sdk";
import { uploadFileToS3 } from "@/amazon-s3";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
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
