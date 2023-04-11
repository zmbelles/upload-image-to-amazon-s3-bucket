import { S3 } from "aws-sdk";
import fs from "fs/promises";
// Create an S3 client object
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function uploadFileToS3(file: any): Promise<string> {
  try {
    // Read the contents of the file into a buffer
    console.log(`Uploading file: ${file}`);
    const data = await fs.readFile(file.filepath);
    // Upload the file to S3
    await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME || "default",
        Key: process.env.AWS_ACCESS_KEY_ID || "default",
        Body: data,
      })
      .promise(); 

    console.log(
      `File ${file.name} uploaded to S3 bucket ${process.env.AWS_BUCKET_NAME} with key ${process.env.AWS_ACCESS_KEY_ID}`
    );

    // Generate a signed URL for the file with no expiration
    const url = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: process.env.AWS_ACCESS_KEY_ID,
      Expires: 0,
    });

    console.log(`Signed URL for file ${process.env.AWS_ACCESS_KEY_ID}: ${url}`);

    return url;
  } catch (error) {
    console.error(
      `Failed to upload file ${file} to S3 bucket ${process.env.AWS_BUCKET_NAME} with key ${process.env.AWS_ACCESS_KEY_ID}: ${error}`
    );
    throw error;
  }
}
