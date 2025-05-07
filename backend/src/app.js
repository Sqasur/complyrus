import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import userRouter from "./routes/user.routes.js";
import organizationRouter from "./routes/organization.routes.js";
import teamRouter from "./routes/team.routes.js";
import complianceProgramRouter from "./routes/complianceProgram.routes.js";
import programRuleRouter from "./routes/programRule.routes.js";
import programStandardRouter from "./routes/programStandard.routes.js";

// Use routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/organizations", teamRouter);
app.use("/api/v1", complianceProgramRouter);
app.use("/api/v1", programRuleRouter);
app.use("/api/v1", programStandardRouter);

export { app };
