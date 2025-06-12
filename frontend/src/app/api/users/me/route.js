import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import { withAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-utils";

// GET /api/users/me - Get current user profile
export const GET = withAuth(async (request) => {
  try {
    await connectDB();

    // The withAuth middleware adds the decoded user info to the request
    const userId = request.user.userId;

    const user = await User.findById(userId)
      .select("-password -refreshToken")
      .populate({
        path: "organizations.organizationId",
        select: "name description logoUrl",
      });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse("User profile retrieved successfully", {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        isSiteAdmin: user.isSiteAdmin,
        siteLevelRoles: user.siteLevelRoles,
        organizations: user.organizations,
        activeOrganization: request.user.activeOrgId,
        activeTeam: request.user.activeTeamId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return errorResponse("Failed to get user profile", 500);
  }
});

// PATCH /api/users/me - Update current user profile
export const PATCH = withAuth(async (request) => {
  try {
    await connectDB();

    const userId = request.user.userId;
    const updates = await request.json();

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email; // Email changes should go through a separate verification process
    delete updates.isSiteAdmin;
    delete updates.siteLevelRoles;
    delete updates.organizations;
    delete updates.refreshToken;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse("Profile updated successfully", { user });
  } catch (error) {
    console.error("Update user profile error:", error);
    return errorResponse("Failed to update profile", 500);
  }
});
