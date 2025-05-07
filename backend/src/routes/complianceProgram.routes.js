import { Router } from "express";
import {
  createComplianceProgram,
  fetchAllCompliancePrograms,
  fetchComplianceProgram,
  updateComplianceProgram,
  deleteComplianceProgram,
  fetchProgramWithDetails,
} from "../controllers/complianceProgram.controller.js";
import { verifyJWT, checkRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/compliance-programs")
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
  .route("/compliance-programs/:id")
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
  .route("/compliance-programs/:id/full")
  .get(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    fetchProgramWithDetails
  );

export default router;
