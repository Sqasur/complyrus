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
    members,
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

  const isAlreadyMember = team.members.some(
    (member) => member.userId.toString() === userId
  );
  if (isAlreadyMember) {
    throw new ApiError(400, "User is already a member of the team");
  }

  team.members.push({ userId, role });
  await team.save();

  const user = await User.findById(userId);
  const orgMembership = user.organizationMemberships.find(
    (membership) =>
      membership.organizationId.toString() === team.organizationId.toString()
  );

  if (orgMembership) {
    orgMembership.teams.push({ teamId: team._id, role });
    await user.save();
  }

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

  team.members = team.members.filter(
    (member) => member.userId.toString() !== userId
  );
  await team.save();

  const user = await User.findById(userId);
  const orgMembership = user.organizationMemberships.find(
    (membership) =>
      membership.organizationId.toString() === team.organizationId.toString()
  );

  if (orgMembership) {
    orgMembership.teams = orgMembership.teams.filter(
      (teamMembership) => teamMembership.teamId.toString() !== teamId
    );
    await user.save();
  }

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
