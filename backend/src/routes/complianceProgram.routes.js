// routes/complianceProgram.routes.js
import { Router } from "express";
import {
  createComplianceProgram,
  fetchAllCompliancePrograms,
  fetchComplianceProgram,
  updateComplianceProgram,
  deactivateComplianceProgram,
  activateComplianceProgram,
  deleteComplianceProgram,
  fetchProgramWithDetails,
} from "../controllers/complianceProgram.controller.js";
import { verifyJWT, checkRoles } from "../middlewares/auth.middleware.js";

import programRuleRouter from "./programRule.routes.js";
import programStandardRouter from "./programStandard.routes.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    createComplianceProgram
  )
  .get(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    fetchAllCompliancePrograms
  );

router
  .route("/:programId")
  .get(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    fetchComplianceProgram
  )
  .patch(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin"] }),
    updateComplianceProgram
  )
  .delete(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin"] }),
    deleteComplianceProgram
  );

router
  .route("/:programId/deactivate")
  .patch(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin"] }),
    deactivateComplianceProgram
  );

router
  .route("/:programId/activate")
  .patch(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin"] }),
    activateComplianceProgram
  );

// mount nested routers
router.use(
  "/:programId/rules",
  verifyJWT,
  checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
  programRuleRouter
);

router.use(
  "/:programId/standards",
  verifyJWT,
  checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
  programStandardRouter
);

router
  .route("/:programId/full")
  .get(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    fetchProgramWithDetails
  );

export default router;
