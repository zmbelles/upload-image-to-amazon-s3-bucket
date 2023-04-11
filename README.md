# upload-image-to-amazon-s3-bucket: using Typescript and Next.js, upload an image to an amazon S3 bucket
# This is part of a larger project and may not work in its entirety as a stand alone. 
##### This is mostly for boiler plate in the future and for others to use to try and get to work themselves
## Assumptions
#### accessKeyId: process.env.AWS_ACCESS_KEY_ID: your access key for your amazon s3 bucket
#### secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY: your secret access key for your amazon s3 bucket
#### region: process.env.AWS_REGION: region for your amazon s3 bucket i.e. us-east-1
#### Bucket: process.env.AWS_BUCKET_NAME || "default": the name of your amazon s3 bucket
## Files
### index.ts
##### This function is used to take the incoming NextApiRequest and pass it along to parse-form-file.ts to then be taken to amazon-s3.ts to be parsed
### parse-form-file.ts
##### uses the formidable library to parse the file from the request along with the fs library to get the data to then pass back to the caller
### amazon-s3.ts
##### using the data buffer from parse-form-file.ts, upload the image to amazon s3
