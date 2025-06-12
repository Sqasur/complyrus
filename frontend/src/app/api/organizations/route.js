import { withAuth } from "@/lib/auth";
import { Organization } from "@/models/organization.model";
import { Team } from "@/models/team.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Create organization
const createOrganization = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json();
  const { name, description, logoUrl, billingInfo } = body;

  if (!name) {
    throw new ApiError(400, "Organization name is required");
  }

  const existingOrg = await Organization.findOne({ name });
  if (existingOrg) {
    throw new ApiError(400, "Organization with this name already exists");
  }

  const organization = await Organization.create({
    name,
    description,
    logoUrl,
    billingInfo,
    createdBy: request.user._id,
    users: [{ userId: request.user._id, roles: ["orgOwner"] }],
  });

  return successResponse(
    organization,
    "Organization created successfully",
    201
  );
});

// Fetch all organizations
const fetchAllOrganizations = asyncHandler(async (request) => {
  await connectDB();

  let organizations;

  if (request.user.isSiteAdmin) {
    // If the user is a site admin, fetch all organizations
    organizations = await Organization.find()
      .populate({
        path: "users.userId",
        select: "firstName lastName email username createdAt",
      })
      .populate({
        path: "teams",
        select: "name description members",
      });
  } else {
    // Otherwise, fetch only the organizations the user is part of
    organizations = await Organization.find({
      "users.userId": request.user._id,
    })
      .populate({
        path: "users.userId",
        select: "firstName lastName email username createdAt",
      })
      .populate({
        path: "teams",
        select: "name description members",
      });
  }

  return successResponse(organizations, "Organizations fetched successfully");
});

// Export HTTP methods with auth protection
export const POST = withAuth(createOrganization);
export const GET = withAuth(fetchAllOrganizations);
