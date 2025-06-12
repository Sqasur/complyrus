import { withAuth } from "@/lib/auth";
import { Document } from "@/models/document.model";
import { Folder } from "@/models/folder.model";
import { uploadBufferToS3, generateFileName } from "@/lib/s3";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Upload a new document
const uploadDocument = asyncHandler(async (request) => {
  await connectDB();

  const formData = await request.formData();
  const file = formData.get("file");
  const name = formData.get("name");
  const type = formData.get("type");
  const isPrivate = formData.get("isPrivate") === "true";
  const associatedPrograms = JSON.parse(
    formData.get("associatedPrograms") || "[]"
  );
  const associatedStandards = JSON.parse(
    formData.get("associatedStandards") || "[]"
  );
  const folderId = formData.get("folderId");

  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }

  if (!folderId) {
    throw new ApiError(400, "Folder ID is required");
  }

  const folder = await Folder.findById(folderId);
  if (!folder) {
    throw new ApiError(404, "Folder not found");
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate S3 key
  const s3Key = generateFileName(
    file.name,
    `${folder.organizationId}/${folder.teamId}/${folderId}`
  );

  // Upload to S3
  const fileUrl = await uploadBufferToS3(buffer, s3Key, file.type);

  const document = await Document.create({
    name: name || file.name,
    type,
    isPrivate,
    associatedPrograms,
    associatedStandards,
    createdBy: request.user._id,
    organizationId: folder.organizationId,
    teamId: folder.teamId,
    folderId,
    versions: [
      {
        versionNumber: "001",
        s3Key,
        fileUrl,
        isCurrent: true,
        uploadedBy: request.user._id,
        size: buffer.length,
        mimeType: file.type,
      },
    ],
  });

  return successResponse(document, "Document uploaded successfully", 201);
});

// Fetch documents
const fetchDocuments = asyncHandler(async (request) => {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");
  const teamId = searchParams.get("teamId");

  let query = {};

  if (folderId) {
    query.folderId = folderId;
  } else if (teamId) {
    query.teamId = teamId;
  }

  const documents = await Document.find(query)
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 });

  return successResponse(documents, "Documents fetched successfully");
});

// Export HTTP methods with auth protection
export const POST = withAuth(uploadDocument, {
  org: ["orgOwner", "orgAdmin", "teamLeader"],
});

export const GET = withAuth(fetchDocuments, {
  org: ["orgOwner", "orgAdmin", "teamLeader", "employee"],
});
