import { Router } from "express";
import {
  createProgramRule,
  fetchRulesForProgram,
  fetchProgramRule,
  updateProgramRule,
  deleteProgramRule,
} from "../controllers/programRule.controller.js";
import { verifyJWT, checkRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/program-rules")
  .post(verifyJWT, checkRoles({ siteLevel: ["siteAdmin"] }), createProgramRule);

router
  .route("/compliance-programs/:id/rules")
  .get(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    fetchRulesForProgram
  );

router
  .route("/program-rules/:id")
  .get(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    fetchProgramRule
  )
  .patch(verifyJWT, checkRoles({ siteLevel: ["siteAdmin"] }), updateProgramRule)
  .delete(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin"] }),
    deleteProgramRule
  );

export default router;
