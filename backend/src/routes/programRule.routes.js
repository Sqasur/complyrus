// routes/programRule.routes.js
import { Router } from "express";
import {
  createProgramRule,
  fetchRulesForProgram,
  fetchProgramRule,
  updateProgramRule,
  deleteProgramRule,
} from "../controllers/programRule.controller.js";
import { verifyJWT, checkRoles } from "../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });
// now router.params.programId will be available

router
  .route("/")
  .post(verifyJWT, checkRoles({ siteLevel: ["siteAdmin"] }), createProgramRule)
  .get(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    fetchRulesForProgram
  );

router
  .route("/:ruleId")
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
