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
import { verifyJWT, checkRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createOrganization);

router.route("/").get(verifyJWT, fetchAllOrganizations);

router.route("/your-organizations").get(verifyJWT, fetchUserOrganizations);

router
  .route("/:orgId")
  .get(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
      team: ["teamLeader", "employee"],
    }),
    fetchSingleOrganization
  )
  .put(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
    }),
    updateOrganization
  )
  .delete(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin"],
      org: ["orgOwner"],
    }),
    deleteOrganization
  );

router
  .route("/:orgId/users")
  .get(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
    }),
    fetchOrganizationUsers
  )
  .post(
    verifyJWT,
    checkRoles({
      siteLevel: ["siteAdmin", "siteModerator"],
      org: ["orgOwner", "orgAdmin"],
    }),
    addUserToOrganization
  );

router.route("/:orgId/users/:userId").delete(
  verifyJWT,
  checkRoles({
    siteLevel: ["siteAdmin", "siteModerator"],
    org: ["orgOwner", "orgAdmin"],
  }),
  removeUserFromOrganization
);

router.route("/:orgId/teams").get(
  verifyJWT,
  checkRoles({
    siteLevel: ["siteAdmin", "siteModerator"],
    org: ["orgOwner", "orgAdmin"],
    team: ["teamLeader", "employee"],
  }),
  fetchOrganizationTeams
);

router.route("/:orgId/users/add-existing").post(
  verifyJWT,
  checkRoles({
    siteLevel: ["siteAdmin", "siteModerator"],
    org: ["orgOwner", "orgAdmin"],
  }),
  addExistingUserToOrganization
);

router.route("/:orgId/users/add-new").post(
  verifyJWT,
  checkRoles({
    siteLevel: ["siteAdmin", "siteModerator"],
    org: ["orgOwner", "orgAdmin"],
  }),
  addNewUserToOrganization
);

export default router;
