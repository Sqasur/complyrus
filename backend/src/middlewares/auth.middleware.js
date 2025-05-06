import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

const checkRoles = (requiredRolesByScope) => {
  return asyncHandler((req, res, next) => {
    // Check if the user is a site admin (bypass for all scopes)
    if (req.user.isSiteAdmin) {
      return next(); // Site admin bypasses all role checks
    }

    // Extract roles for each scope
    const orgRoles = req.user.activeOrgRoles || []; // Organization roles
    const teamRoles = req.user.activeTeamRoles || []; // Team roles
    const siteRoles = req.user.siteLevelRoles || []; // Site-level roles

    // Check roles for each scope
    const hasOrgAccess = requiredRolesByScope.org
      ? requiredRolesByScope.org.some((role) => orgRoles.includes(role))
      : true; // Default to true if no org roles are required

    const hasTeamAccess = requiredRolesByScope.team
      ? requiredRolesByScope.team.some((role) => teamRoles.includes(role))
      : true; // Default to true if no team roles are required

    const hasSiteAccess = requiredRolesByScope.siteLevel
      ? requiredRolesByScope.siteLevel.some((role) => siteRoles.includes(role))
      : true; // Default to true if no site-level roles are required

    // Grant access only if the user satisfies at least one scope's requirements
    if (!hasOrgAccess && !hasTeamAccess && !hasSiteAccess) {
      throw new ApiError(
        403,
        `You need one of the following roles to access this resource: 
        Organization: ${requiredRolesByScope.org?.join(", ") || "None"}, 
        Team: ${requiredRolesByScope.team?.join(", ") || "None"}, 
        Site: ${requiredRolesByScope.siteLevel?.join(", ") || "None"}`
      );
    }

    next(); // Proceed to the next middleware or controller
  });
};

export { verifyJWT, checkRoles };
