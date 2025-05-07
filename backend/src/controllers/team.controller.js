import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Team } from "../models/team.model.js";
import { Organization } from "../models/organization.model.js";
import { User } from "../models/user.model.js";

// Create a new team
export const createTeam = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { name, description, members } = req.body;

  if (!name) {
    throw new ApiError(400, "Team name is required");
  }

  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  const team = await Team.create({
    name,
    description,
    organizationId: orgId,
    members, // Initialize the members array
    createdBy: req.user._id,
  });

  organization.teams.push(team._id);
  await organization.save();

  res.status(201).json(new ApiResponse(201, team, "Team created successfully"));
});

// Add a user to a team
export const addUserToTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { userId, role } = req.body;

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Check if the user is already in the team
  const isAlreadyInTeam = team.members.some(
    (member) => member.userId.toString() === userId
  );

  if (isAlreadyInTeam) {
    throw new ApiError(400, "User is already a member of the team");
  }

  team.members.push({ userId, role });
  await team.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "User added to team successfully"));
});

// Remove a user from a team
export const removeUserFromTeam = asyncHandler(async (req, res) => {
  const { teamId, userId } = req.params;

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Remove the user from the team
  team.members = team.members.filter(
    (member) => member.userId.toString() !== userId
  );
  await team.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "User removed from team successfully"));
});

// Fetch team details
export const fetchTeamDetails = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId).populate("members.userId");
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, team, "Team details fetched successfully"));
});

// Make a user a team leader
export const makeTeamLeader = asyncHandler(async (req, res) => {
  const { teamId, userId } = req.params;

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  const member = team.members.find(
    (member) => member.userId.toString() === userId
  );
  if (!member) {
    throw new ApiError(404, "User is not a member of the team");
  }

  if (member.role === "teamLeader") {
    throw new ApiError(400, "User is already a team leader");
  }

  member.role = "teamLeader";
  await team.save();

  const user = await User.findById(userId);
  const orgMembership = user.organizationMemberships.find(
    (membership) =>
      membership.organizationId.toString() === team.organizationId.toString()
  );

  if (orgMembership) {
    const teamMembership = orgMembership.teams.find(
      (teamMembership) => teamMembership.teamId.toString() === teamId
    );

    if (teamMembership) {
      teamMembership.role = "teamLeader";
      await user.save();
    }
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, {}, "User promoted to team leader successfully")
    );
});

// Update team details
export const updateTeamDetails = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const updates = req.body;

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  Object.assign(team, updates);
  await team.save();

  res
    .status(200)
    .json(new ApiResponse(200, team, "Team details updated successfully"));
});

// Fetch all teams in an organization
export const fetchAllTeamsInOrganization = asyncHandler(async (req, res) => {
  const { orgId } = req.params;

  const organization = await Organization.findById(orgId).populate("teams");
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, organization.teams, "Teams fetched successfully")
    );
});

// Fetch team members
export const fetchTeamMembers = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId).populate("members.userId");
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, team.members, "Team members fetched successfully")
    );
});

// Assign multiple users to a team
export const assignMultipleUsersToTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { users } = req.body; // Array of user IDs and roles

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Add users to the team if they are not already members
  users.forEach(({ userId, role }) => {
    if (!team.members.some((member) => member.userId.toString() === userId)) {
      team.members.push({ userId, role });
    }
  });

  await team.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Users assigned to team successfully"));
});

// Remove multiple users from a team
export const removeMultipleUsersFromTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { userIds } = req.body; // Array of user IDs

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Remove users from the team
  team.members = team.members.filter(
    (member) => !userIds.includes(member.userId.toString())
  );
  await team.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Users removed from team successfully"));
});

// Delete a team
export const deleteTeam = asyncHandler(async (req, res) => {
  const { orgId, teamId } = req.params;

  const team = await Team.findByIdAndRemove(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  const organization = await Organization.findById(orgId);
  if (organization) {
    organization.teams = organization.teams.filter(
      (id) => id.toString() !== teamId
    );
    await organization.save();
  }

  res.status(200).json(new ApiResponse(200, {}, "Team deleted successfully"));
});

// Fetch teams for a user
export const fetchTeamsForUser = asyncHandler(async (req, res) => {
  const { orgId, userId } = req.params;

  const teams = await Team.find({
    organizationId: orgId,
    "members.userId": userId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, teams, "User's teams fetched successfully"));
});
