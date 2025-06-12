import { withAuth } from "@/lib/auth";
import { User } from "@/models/user.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Fetch user profile
const fetchUserProfile = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  // Users can only fetch their own profile unless they're admin
  if (id !== request.user._id.toString() && !request.user.isSiteAdmin) {
    throw new ApiError(403, "Access denied");
  }

  const user = await User.findById(id)
    .select("-password -refreshToken")
    .populate("organizationMemberships.organizationId", "name")
    .populate("organizationMemberships.teams.teamId", "name");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return successResponse(user, "User profile fetched successfully");
});

// Update user profile
const updateUserProfile = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;
  const body = await request.json();

  // Users can only update their own profile unless they're admin
  if (id !== request.user._id.toString() && !request.user.isSiteAdmin) {
    throw new ApiError(403, "Access denied");
  }

  // Remove sensitive fields from updates
  delete body.password;
  delete body.refreshToken;
  delete body.isSiteAdmin;

  const user = await User.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return successResponse(user, "User profile updated successfully");
});

// Delete user (admin only)
const deleteUser = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  // Prevent self-deletion
  if (id === request.user._id.toString()) {
    throw new ApiError(400, "Cannot delete your own account");
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return successResponse({}, "User deleted successfully");
});

// Export with auth protection
export const GET = withAuth(fetchUserProfile);

export const PATCH = withAuth(updateUserProfile);

export const DELETE = withAuth(deleteUser, { siteLevel: ["siteAdmin"] });
