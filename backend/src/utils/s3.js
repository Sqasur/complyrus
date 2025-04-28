// this utility function will be used to upload files to s3
// and return the url of the uploaded file
import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "aws-sdk";
import { Readable } from "stream";
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import { finished } from "stream/promises";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const bucketName = process.env.AWS_BUCKET_NAME;
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadFileToS3 = async (filePath, fileName) => {
  const fileStream = createReadStream(filePath);
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileStream,
  };
  try {
    const data = await s3.upload(uploadParams).promise();
    console.log("File uploaded successfully:", data.Location);
    return data.Location; // Return the URL of the uploaded file
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
