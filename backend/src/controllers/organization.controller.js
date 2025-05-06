import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Organization } from "../models/organization.model.js";
import { User } from "../models/user.model.js";

// Create organization
export const createOrganization = asyncHandler(async (req, res) => {
  const { name, description, logoUrl, billingInfo } = req.body;

  if (!name) {
    throw new ApiError(400, "Organization name is required");
  }

  const existingOrg = await Organization.findOne({ name });
  if (existingOrg) {
    throw new ApiError(400, "Organization with this name already exists");
  }

  const organization = await Organization.create({
    name,
    description,
    logoUrl,
    billingInfo,
    createdBy: req.user._id,
    users: [{ userId: req.user._id, roles: ["orgOwner"] }],
  });

  req.user.organizationMemberships.push({
    organizationId: organization._id,
    roles: ["orgOwner"],
  });
  await req.user.save();

  res
    .status(201)
    .json(
      new ApiResponse(201, organization, "Organization created successfully")
    );
});

// Fetch all organizations
export const fetchAllOrganizations = asyncHandler(async (req, res) => {
  let organizations;

  if (req.user.isSiteAdmin) {
    // If the user is a site admin, fetch all organizations
    organizations = await Organization.find();
  } else {
    // Otherwise, fetch only the organizations the user is part of
    const userOrgIds = req.user.organizationMemberships.map(
      (m) => m.organizationId
    );
    organizations = await Organization.find({ _id: { $in: userOrgIds } });
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, organizations, "Organizations fetched successfully")
    );
});

// Fetch organizations the current user is part of
export const fetchUserOrganizations = asyncHandler(async (req, res) => {
  const organizations = await Organization.find({
    _id: { $in: req.user.organizationMemberships.map((m) => m.organizationId) },
  });
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        organizations,
        "User's organizations fetched successfully"
      )
    );
});

// Fetch single organization
export const fetchSingleOrganization = asyncHandler(async (req, res) => {
  const { orgId } = req.params;

  const organization =
    await Organization.findById(orgId).populate("users.userId");
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, organization, "Organization fetched successfully")
    );
});

// Update organization
export const updateOrganization = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const updates = req.body;

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  Object.assign(organization, updates);
  await organization.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, organization, "Organization updated successfully")
    );
});

// Delete organization
export const deleteOrganization = asyncHandler(async (req, res) => {
  const { orgId } = req.params;

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  await organization.remove();
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Organization deleted successfully"));
});

// Add user to organization
export const addUserToOrganization = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { userId, roles } = req.body;

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  organization.users.push({ userId, roles });
  await organization.save();

  const user = await User.findById(userId);
  user.organizationMemberships.push({ organizationId: orgId, roles });
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "User added to organization successfully"));
});

// Remove user from organization
export const removeUserFromOrganization = asyncHandler(async (req, res) => {
  const { orgId, userId } = req.params;

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  organization.users = organization.users.filter(
    (u) => u.userId.toString() !== userId
  );
  await organization.save();

  const user = await User.findById(userId);
  user.organizationMemberships = user.organizationMemberships.filter(
    (m) => m.organizationId.toString() !== orgId
  );
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, {}, "User removed from organization successfully")
    );
});

// Fetch organization users
export const fetchOrganizationUsers = asyncHandler(async (req, res) => {
  const { orgId } = req.params;

  const organization =
    await Organization.findById(orgId).populate("users.userId");
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        organization.users,
        "Organization users fetched successfully"
      )
    );
});

// Fetch organization teams
export const fetchOrganizationTeams = asyncHandler(async (req, res) => {
  const { orgId } = req.params;

  const organization = await Organization.findById(orgId).populate("teams");
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        organization.teams,
        "Organization teams fetched successfully"
      )
    );
});

// Add existing user to organization
export const addExistingUserToOrganization = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { identifier, roles } = req.body; // identifier can be username or email

  if (!identifier) {
    throw new ApiError(
      400,
      "Username or email is required to add an existing user"
    );
  }

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if the user is already part of the organization
  const isAlreadyMember = organization.users.some(
    (u) => u.userId.toString() === user._id.toString()
  );

  if (isAlreadyMember) {
    throw new ApiError(400, "User is already a member of the organization");
  }

  // Add user to organization
  organization.users.push({ userId: user._id, roles });
  await organization.save();

  // Add organization to user's memberships
  user.organizationMemberships.push({ organizationId: orgId, roles });
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "User added to organization successfully"));
});

// Add new user to organization
export const addNewUserToOrganization = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { username, email, password, firstName, lastName, phoneNumber, roles } =
    req.body;

  if (
    [username, email, password, firstName, lastName, phoneNumber].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All user fields are required to add a new user");
  }

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  // Check if a user with the same email or username already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(
      400,
      "A user with this email or username already exists"
    );
  }

  // Create a new user
  const newUser = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
  });

  // Add the new user to the organization
  organization.users.push({ userId: newUser._id, roles });
  await organization.save();

  // Add organization to the new user's memberships
  newUser.organizationMemberships.push({ organizationId: orgId, roles });
  await newUser.save();

  res
    .status(201)
    .json(
      new ApiResponse(201, {}, "New user added to organization successfully")
    );
});
