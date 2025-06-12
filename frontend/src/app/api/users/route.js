import { withAuth } from "@/lib/auth";
import { User } from "@/models/user.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Fetch all users (for admin)
const fetchAllUsers = asyncHandler(async (request) => {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");

  let query = {};

  if (organizationId) {
    query = { "organizationMemberships.organizationId": organizationId };
  }

  const users = await User.find(query)
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  return successResponse(users, "Users fetched successfully");
});

// Create new user (admin only)
const createUser = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json();
  const { username, email, password, firstName, lastName, phoneNumber } = body;

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

  return successResponse(createdUser, "User created successfully", 201);
});

// Export with auth protection
export const GET = withAuth(fetchAllUsers, {
  siteLevel: ["siteAdmin", "siteModerator"],
});

export const POST = withAuth(createUser, { siteLevel: ["siteAdmin"] });
