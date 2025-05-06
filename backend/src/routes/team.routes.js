import { Router } from "express";
import {
  createTeam,
  addUserToTeam,
  removeUserFromTeam,
  fetchTeamDetails,
  makeTeamLeader,
  updateTeamDetails,
  deleteTeam,
  fetchAllTeamsInOrganization,
  fetchTeamMembers,
  assignMultipleUsersToTeam,
  removeMultipleUsersFromTeam,
  transferTeamLeadership,
  fetchTeamsForUser,
} from "../controllers/team.controller.js";
import { verifyJWT, checkRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/:orgId/teams")
  .post(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
    }),
    createTeam
  )
  .get(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
      team: ["teamLeader", "employee"],
    }),
    fetchAllTeamsInOrganization
  );

router
  .route("/:orgId/teams/:teamId")
  .get(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
      team: ["teamLeader", "employee"],
    }), // Site-level roles have full access
    fetchTeamDetails
  )
  .patch(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
      team: ["teamLeader"],
    }),
    updateTeamDetails
  )
  .delete(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
    }),
    deleteTeam
  );

router.route("/:orgId/teams/:teamId/users").post(
  verifyJWT,
  checkRoles({
    siteLevel: ["siteAdmin", "siteModerator"],
    org: ["orgOwner", "orgAdmin"],
    team: ["teamLeader"],
  }),
  addUserToTeam
);

router.route("/:orgId/teams/:teamId/users/:userId").delete(
  verifyJWT,
  checkRoles({
    siteLevel: ["siteAdmin", "siteModerator"],
    org: ["orgOwner", "orgAdmin"],
    team: ["teamLeader"],
  }),
  removeUserFromTeam
);

router.route("/:orgId/teams/:teamId/users/:userId/make-leader").patch(
  verifyJWT,
  checkRoles({
    siteLevel: ["siteAdmin", "siteModerator"],
    org: ["orgOwner", "orgAdmin"],
  }),
  makeTeamLeader
);

router
  .route("/:orgId/teams/:teamId/members")
  .get(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
      team: ["teamLeader"],
    }),
    fetchTeamMembers
  )
  .post(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
      team: ["teamLeader"],
    }),
    assignMultipleUsersToTeam
  )
  .delete(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
      team: ["teamLeader"],
    }),
    removeMultipleUsersFromTeam
  );

router.route("/:orgId/teams/:teamId/transfer-leadership").patch(
  verifyJWT,
  checkRoles({
    siteLevel: ["siteAdmin", "siteModerator"],
    org: ["orgOwner", "orgAdmin"],
  }),
  transferTeamLeadership
);

router.route("/:orgId/users/:userId/teams").get(
  verifyJWT,
  checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }), // Site-level roles have full access
  fetchTeamsForUser
);

export default router;
