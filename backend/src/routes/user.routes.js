import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser); // Placeholder for login route

// secured routes
router.route("/logout").post(verifyJWT, logoutUser); // Placeholder for logout route
export default router;
