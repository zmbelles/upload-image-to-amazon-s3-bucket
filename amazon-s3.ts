import { S3 } from "aws-sdk";
import fs from "fs/promises";
// Create an S3 client object
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function updateFileOnS3(
  buffer: Buffer,
  originalFilename: string
): Promise<string> {
  try {
    // Read the contents of the file into a buffer
    // Upload the file to S3
    await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME || "default",
        Key: originalFilename || "default",
        Body: buffer,
      })
      .promise();

    // Generate a signed URL for the file with no expiration
    const url = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: originalFilename,
      Expires: 0,
    });

    return url;
  } catch (error) {
    throw error;
  }
}
export async function uploadFileToS3(
  buffer: Buffer,
  name: string
): Promise<string> {
  try {
    // Read the contents of the file into a buffer
    // Upload the file to S3
    await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME || "default",
        Key: name || "default",
        Body: buffer,
      })
      .promise();

    // Generate a signed URL for the file with no expiration
    const url = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: name,
      Expires: 0,
    });

    return url;
  } catch (error) {
    throw error;
  }
}
