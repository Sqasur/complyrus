import { withAuth } from "@/lib/auth";
import { Folder } from "@/models/folder.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Create a new folder
const createFolder = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json();
  const { name, description, teamId } = body;
  const organizationId = request.user.activeOrgId;

  if (!name || !teamId) {
    throw new ApiError(400, "Folder name and team ID are required");
  }

  const folder = await Folder.create({
    name,
    description,
    organizationId,
    teamId,
    createdBy: request.user._id,
  });

  return successResponse(folder, "Folder created successfully", 201);
});

// Fetch folders
const fetchFolders = asyncHandler(async (request) => {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const organizationId = searchParams.get("organizationId");

  let query = {};

  if (teamId) {
    query.teamId = teamId;
  } else if (organizationId) {
    query.organizationId = organizationId;
  } else {
    // Return folders for user's active organization
    query.organizationId = request.user.activeOrgId;
  }

  const folders = await Folder.find(query)
    .populate("createdBy", "firstName lastName email")
    .populate("teamId", "name")
    .sort({ createdAt: -1 });

  return successResponse(folders, "Folders fetched successfully");
});

// Export with auth protection
export const POST = withAuth(createFolder, {
  org: ["orgOwner", "orgAdmin", "teamLeader"],
});

export const GET = withAuth(fetchFolders, {
  org: ["orgOwner", "orgAdmin", "teamLeader", "employee"],
});
