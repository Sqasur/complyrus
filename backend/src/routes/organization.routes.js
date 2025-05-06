import { Router } from "express";
import {
  createOrganization,
  fetchAllOrganizations,
  fetchUserOrganizations,
  fetchSingleOrganization,
  updateOrganization,
  deleteOrganization,
  addUserToOrganization,
  removeUserFromOrganization,
  fetchOrganizationUsers,
  fetchOrganizationTeams,
  addExistingUserToOrganization,
  addNewUserToOrganization,
} from "../controllers/organization.controller.js";
import { verifyJWT, checkOrgRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-organization").post(verifyJWT, createOrganization);
router.route("/organizations").get(verifyJWT, fetchAllOrganizations);
router.route("/your-organizations").get(verifyJWT, fetchUserOrganizations);
router
  .route("/:orgId")
  .get(verifyJWT, fetchSingleOrganization)
  .put(verifyJWT, checkOrgRoles(["orgOwner", "orgAdmin"]), updateOrganization)
  .delete(verifyJWT, checkOrgRoles(["orgOwner"]), deleteOrganization);
router
  .route("/:orgId/users")
  .get(
    verifyJWT,
    checkOrgRoles(["orgOwner", "orgAdmin"]),
    fetchOrganizationUsers
  )
  .post(
    verifyJWT,
    checkOrgRoles(["orgOwner", "orgAdmin"]),
    addUserToOrganization
  );
router
  .route("/:orgId/users/:userId")
  .delete(
    verifyJWT,
    checkOrgRoles(["orgOwner", "orgAdmin"]),
    removeUserFromOrganization
  );
router.route("/:orgId/teams").get(verifyJWT, fetchOrganizationTeams);

router
  .route("/:orgId/users/add-existing")
  .post(
    verifyJWT,
    checkOrgRoles(["orgOwner", "orgAdmin"]),
    addExistingUserToOrganization
  );

router
  .route("/:orgId/users/add-new")
  .post(
    verifyJWT,
    checkOrgRoles(["orgOwner", "orgAdmin"]),
    addNewUserToOrganization
  );

export default router;
