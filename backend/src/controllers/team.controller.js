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

  const teams = await Team.find({ organizationId: orgId });
  res
    .status(200)
    .json(new ApiResponse(200, teams, "Teams fetched successfully"));
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
  const { users } = req.body; // users: [{ userId, role }]

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  users.forEach(({ userId, role }) => {
    const isAlreadyMember = team.members.some(
      (member) => member.userId.toString() === userId
    );
    if (!isAlreadyMember) {
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
  const { userIds } = req.body; // userIds: [userId1, userId2, ...]

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  team.members = team.members.filter(
    (member) => !userIds.includes(member.userId.toString())
  );

  await team.save();
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Users removed from team successfully"));
});

// Transfer team leadership
export const transferTeamLeadership = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { newLeaderId } = req.body;

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  const currentLeader = team.members.find(
    (member) => member.role === "teamLeader"
  );
  const newLeader = team.members.find(
    (member) => member.userId.toString() === newLeaderId
  );

  if (!newLeader) {
    throw new ApiError(404, "New leader is not a member of the team");
  }

  if (currentLeader) {
    currentLeader.role = "employee";
  }
  newLeader.role = "teamLeader";

  await team.save();
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Team leadership transferred successfully"));
});

// Delete a team
export const deleteTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  await team.remove();
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
