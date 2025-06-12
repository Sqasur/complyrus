import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import {
  ApiError,
  successResponse,
  errorResponse,
  asyncHandler,
} from "@/lib/api-utils";

const generateAccessAndRefreshTokens = async (
  userId,
  activeOrgId,
  activeOrgRoles,
  activeTeamId,
  activeTeamRoles
) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken(
      activeOrgId,
      activeOrgRoles,
      activeTeamId,
      activeTeamRoles
    );
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
      error
    );
  }
};

export const POST = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json();
  const { email, username, password } = body;

  if (!(email || username)) {
    throw new ApiError(400, "Email or username is required");
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Set cookies
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const response = successResponse(
    {
      user: loggedInUser,
      accessToken,
      refreshToken,
    },
    "User logged in successfully"
  );

  response.cookies.set("accessToken", accessToken, options);
  response.cookies.set("refreshToken", refreshToken, options);

  return response;
});
