import { withAuth } from "@/lib/auth";
import { User } from "@/models/user.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

const logoutUser = asyncHandler(async (request) => {
  await connectDB();

  await User.findByIdAndUpdate(
    request.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const response = successResponse({}, "User logged out successfully");

  // Clear cookies
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
});

export const POST = withAuth(logoutUser);
