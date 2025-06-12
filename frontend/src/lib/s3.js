// Modern S3 utility for Next.js API routes
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const bucketName = process.env.AWS_BUCKET_NAME;
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload File object to S3 (for Next.js FormData uploads)
export const uploadToS3 = async (file, key) => {
  try {
    const buffer = await file.arrayBuffer();
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return { success: true, url: fileUrl, key };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return { success: false, error: error.message };
  }
};

// Delete object from S3
export const deleteFromS3 = async (key) => {
  try {
    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    return { success: false, error: error.message };
  }
};

// Generate signed URL for downloading
export const getSignedUrlFromS3 = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

// Upload buffer to S3 (for Next.js file uploads)
export const uploadBufferToS3 = async (buffer, fileName, contentType) => {
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log("File uploaded successfully:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Generate unique file name
export const generateFileName = (originalName, folder = "") => {
  const ext = originalName.split(".").pop();
  const uniqueName = `${uuidv4()}.${ext}`;
  return folder ? `${folder}/${uniqueName}` : uniqueName;
};
