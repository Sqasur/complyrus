// routes/programStandard.routes.js
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

const router = Router({ mergeParams: true });

router
  .route("/")
  .post(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin"] }),
    createProgramStandard
  )
  .get(
    verifyJWT,
    checkRoles({ siteLevel: ["siteAdmin", "siteModerator"] }),
    fetchStandardsForProgram
  );

router
  .route("/:standardId")
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
