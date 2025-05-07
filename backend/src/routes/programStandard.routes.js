import { Router } from "express";
import {
  createProgramStandard,
  fetchStandardsForProgram,
  fetchStandardsForRule,
  fetchProgramStandard,
  updateProgramStandard,
  deleteProgramStandard,
} from "../controllers/programStandard.controller.js";
import { verifyJWT, checkRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/program-standards")
  .post(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin"] }),
    createProgramStandard
  );

router
  .route("/compliance-programs/:id/standards")
  .get(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    fetchStandardsForProgram
  );

router
  .route("/program-rules/:id/standards")
  .get(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    fetchStandardsForRule
  );

router
  .route("/program-standards/:id")
  .get(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    fetchProgramStandard
  )
  .patch(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin"] }),
    updateProgramStandard
  )
  .delete(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin"] }),
    deleteProgramStandard
  );

export default router;
