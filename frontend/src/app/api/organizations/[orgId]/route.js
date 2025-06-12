import { withAuth } from "@/lib/auth";
import { Organization } from "@/models/organization.model";
import { User } from "@/models/user.model";
import { Team } from "@/models/team.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Fetch single organization
const fetchSingleOrganization = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { orgId } = await params;

  const organization = await Organization.findById(orgId)
    .populate({
      path: "users.userId",
      select: "firstName lastName email username createdAt",
    })
    .populate({
      path: "teams",
      select: "name description members createdAt",
      populate: {
        path: "members.userId",
        select: "firstName lastName email",
      },
    });

  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  // Check if user has access to this organization
  const userInOrg = organization.users.find(
    (u) => u.userId._id.toString() === request.user._id.toString()
  );

  if (!userInOrg && !request.user.isSiteAdmin) {
    throw new ApiError(403, "Access denied to this organization");
  }

  return successResponse(organization, "Organization fetched successfully");
});

// Update organization
const updateOrganization = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { orgId } = await params;
  const body = await request.json();

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  Object.assign(organization, body);
  await organization.save();

  return successResponse(organization, "Organization updated successfully");
});

// Delete organization
const deleteOrganization = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { orgId } = await params;

  const organization = await Organization.findByIdAndDelete(orgId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  return successResponse({}, "Organization deleted successfully");
});

// Add user to organization
const addUserToOrganization = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { orgId } = await params;
  const body = await request.json();
  const { userId, roles } = body;

  if (!userId || !roles || !Array.isArray(roles)) {
    throw new ApiError(400, "User ID and roles array are required");
  }

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if user is already in organization
  const existingUser = organization.users.find(
    (u) => u.userId.toString() === userId
  );

  if (existingUser) {
    throw new ApiError(400, "User is already a member of this organization");
  }

  // Add user to organization
  organization.users.push({ userId, roles });
  await organization.save();

  return successResponse({}, "User added to organization successfully");
});

// Export with auth protection
export const GET = withAuth(fetchSingleOrganization, {
  siteLevel: ["siteAdmin", "siteModerator"],
  org: ["orgOwner", "orgAdmin", "teamLeader", "employee"],
});

export const PATCH = withAuth(updateOrganization, {
  siteLevel: ["siteAdmin"],
  org: ["orgOwner", "orgAdmin"],
});

export const DELETE = withAuth(deleteOrganization, {
  siteLevel: ["siteAdmin"],
});

export const POST = withAuth(addUserToOrganization, {
  siteLevel: ["siteAdmin"],
  org: ["orgOwner", "orgAdmin"],
});
