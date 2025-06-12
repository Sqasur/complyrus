import { withAuth } from "@/lib/auth";
import { Team } from "@/models/team.model";
import { Organization } from "@/models/organization.model";
import { User } from "@/models/user.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Create a new team
const createTeam = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { orgId } = await params;
  const body = await request.json();
  const { name, description, members } = body;

  if (!name) {
    throw new ApiError(400, "Team name is required");
  }

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  // Verify user has access to this organization
  const userInOrg = organization.users.find(
    (u) => u.userId.toString() === request.user._id.toString()
  );

  if (!userInOrg && !request.user.isSiteAdmin) {
    throw new ApiError(403, "Access denied to this organization");
  }

  const team = await Team.create({
    name,
    description,
    organizationId: orgId,
    members: members || [
      {
        userId: request.user._id,
        role: "teamLeader",
      },
    ],
    createdBy: request.user._id,
  });

  organization.teams.push(team._id);
  await organization.save();

  // Return populated team
  const populatedTeam = await Team.findById(team._id)
    .populate({
      path: "members.userId",
      select: "firstName lastName email username",
    })
    .populate({
      path: "createdBy",
      select: "firstName lastName email",
    });

  return successResponse(populatedTeam, "Team created successfully", 201);
});

// Fetch all teams in organization
const fetchAllTeamsInOrganization = asyncHandler(
  async (request, { params }) => {
    await connectDB();

    const { orgId } = await params;

    // Verify organization exists and user has access
    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw new ApiError(404, "Organization not found");
    }

    const userInOrg = organization.users.find(
      (u) => u.userId.toString() === request.user._id.toString()
    );

    if (!userInOrg && !request.user.isSiteAdmin) {
      throw new ApiError(403, "Access denied to this organization");
    }

    const teams = await Team.find({ organizationId: orgId })
      .populate({
        path: "members.userId",
        select: "firstName lastName email username",
      })
      .populate({
        path: "createdBy",
        select: "firstName lastName email",
      })
      .sort({ createdAt: -1 });

    return successResponse(teams, "Teams fetched successfully");
  }
);

// Export with auth protection
export const POST = withAuth(createTeam);
export const GET = withAuth(fetchAllTeamsInOrganization);
