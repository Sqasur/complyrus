import { Router } from "express";
import {
  createTeam,
  addUserToTeam,
  removeUserFromTeam,
  fetchTeamDetails,
  makeTeamLeader,
} from "../controllers/team.controller.js";
import { verifyJWT, checkOrgRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/:orgId/teams")
  .post(verifyJWT, checkOrgRoles(["orgOwner", "orgAdmin"]), createTeam);

router.route("/:orgId/teams/:teamId").get(verifyJWT, fetchTeamDetails);

router
  .route("/:orgId/teams/:teamId/users")
  .post(
    verifyJWT,
    checkOrgRoles(["orgOwner", "orgAdmin", "teamLeader"]),
    addUserToTeam
  );

router
  .route("/:orgId/teams/:teamId/users/:userId")
  .delete(
    verifyJWT,
    checkOrgRoles(["orgOwner", "orgAdmin", "teamLeader"]),
    removeUserFromTeam
  );

router
  .route("/:orgId/teams/:teamId/users/:userId/make-leader")
  .patch(verifyJWT, checkOrgRoles(["orgOwner", "orgAdmin"]), makeTeamLeader);

export default router;
