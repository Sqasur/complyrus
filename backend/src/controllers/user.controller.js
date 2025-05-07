import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Organization } from "../models/organization.model.js";
import { Team } from "../models/team.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

const registerUser = asyncHandler(async (req, res) => {
  console.log("Request body:", req.body);

  const { username, email, password, firstName, lastName, phoneNumber } =
    req.body || {};

  if (
    [username, email, password, firstName, lastName, phoneNumber].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

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

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body || {};

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

  // Fetch the user's first organization and team
  const firstOrganization = await Organization.findOne({
    "users.userId": user._id,
  }).populate("teams");

  const activeOrgId = firstOrganization?._id || null;
  const activeOrgRoles =
    firstOrganization?.users.find(
      (orgUser) => orgUser.userId.toString() === user._id.toString()
    )?.roles || [];

  const firstTeam = firstOrganization?.teams[0];
  const activeTeamId = firstTeam?._id || null;
  const activeTeamRoles =
    firstTeam?.members.find(
      (teamMember) => teamMember.userId.toString() === user._id.toString()
    )?.role || [];

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
    activeOrgId,
    activeOrgRoles,
    activeTeamId,
    activeTeamRoles
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken ||
    req.body.refreshToken ||
    req.headers("Authorization")?.replace("Bearer ", "");

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

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: refreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const switchOrganization = asyncHandler(async (req, res) => {
  const { orgId, teamId } = req.body;
  const userId = req.user._id;

  const organization = await Organization.findById(orgId).populate("teams");
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  // Check if the user is part of the organization
  const orgMembership = organization.users.find(
    (orgUser) => orgUser.userId.toString() === userId.toString()
  );

  if (!orgMembership) {
    throw new ApiError(403, "Access denied to the specified organization");
  }

  const activeOrgRoles = orgMembership.roles || [];

  let activeTeamRoles = [];
  if (teamId) {
    const team = organization.teams.find(
      (team) => team._id.toString() === teamId
    );

    if (!team) {
      throw new ApiError(404, "Team not found in the specified organization");
    }

    const teamMembership = team.members.find(
      (member) => member.userId.toString() === userId.toString()
    );

    if (!teamMembership) {
      throw new ApiError(403, "Access denied to the specified team");
    }

    activeTeamRoles = teamMembership.role ? [teamMembership.role] : [];
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    userId,
    orgId,
    activeOrgRoles,
    teamId,
    activeTeamRoles
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Switched organization and updated tokens successfully"
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body || {};

  if (!firstName || !lastName) {
    throw new ApiError(400, "First name and last name are required");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { firstName, lastName },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  switchOrganization,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
};
