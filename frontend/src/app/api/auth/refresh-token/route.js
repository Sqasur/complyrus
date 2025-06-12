import { User } from "@/models/user.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";

const refreshAccessToken = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json().catch(() => ({}));
  const incomingRefreshToken =
    request.cookies.get("refreshToken")?.value ||
    body.refreshToken ||
    request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Generate new tokens
    const accessToken = user.generateAccessToken(
      user.activeOrgId,
      user.activeOrgRoles,
      user.activeTeamId,
      user.activeTeamRoles
    );
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const response = successResponse(
      {
        accessToken,
        refreshToken,
      },
      "Access token refreshed successfully"
    );

    response.cookies.set("accessToken", accessToken, options);
    response.cookies.set("refreshToken", refreshToken, options);

    return response;
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export const POST = asyncHandler(refreshAccessToken);
