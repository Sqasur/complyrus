import { withAuth } from "@/lib/auth";
import { Team } from "@/models/team.model";
import { User } from "@/models/user.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Fetch teams for the current user
const fetchTeamsForUser = asyncHandler(async (request) => {
  await connectDB();

  const userId = request.user._id;

  const teams = await Team.find({
    "members.userId": userId,
  })
    .populate("organizationId", "name")
    .populate("members.userId", "firstName lastName email")
    .sort({ createdAt: -1 });

  return successResponse(teams, "User teams fetched successfully");
});

// Export with auth protection
export const GET = withAuth(fetchTeamsForUser);
