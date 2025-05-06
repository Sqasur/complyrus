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

// Use routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/", organizationRouter);
app.use("/api/v1/", teamRouter);

export { app };
