import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import {
  ApiError,
  successResponse,
  errorResponse,
  asyncHandler,
} from "@/lib/api-utils";

export const POST = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json();
  const { username, email, password, firstName, lastName, phoneNumber } = body;

  // Validation
  if (
    [username, email, password, firstName, lastName, phoneNumber].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check for existing users
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ApiError(400, "Email already exists");
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new ApiError(400, "Username already exists");
  }

  // Create user
  const newUser = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return successResponse(createdUser, "User registered successfully", 201);
});
