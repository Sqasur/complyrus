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

const checkRoles = (requiredRoles, scope = "org") => {
  return asyncHandler((req, res, next) => {
    // Check if the user is a site admin
    if (req.user.isSiteAdmin) {
      return next(); // Site admin bypasses all role checks
    }

    // Otherwise, check roles in the specified scope
    const roles =
      scope === "org"
        ? req.user.activeOrgRoles || [] // Organization roles
        : req.user.activeTeamRoles || []; // Team roles

    // Check if the user has at least one of the required roles
    const hasAccess = requiredRoles.some((role) => roles.includes(role));

    if (!hasAccess) {
      throw new ApiError(
        403,
        `You need one of the following roles to access this resource: ${requiredRoles.join(", ")}`
      );
    }

    next(); // Proceed to the next middleware or controller
  });
};

const checkOrgRoles = (requiredRoles) => {
  return asyncHandler((req, res, next) => {
    const orgId = req.params.orgId || req.body.orgId;

    const membership = req.user.organizationMemberships.find(
      (m) => m.organizationId.toString() === orgId
    );

    if (!membership) {
      throw new ApiError(403, "Access denied to the specified organization");
    }

    const hasAccess = requiredRoles.some((role) =>
      membership.roles.includes(role)
    );
    if (!hasAccess) {
      throw new ApiError(
        403,
        `You need one of the following roles to access this resource: ${requiredRoles.join(", ")}`
      );
    }

    next();
  });
};

export { verifyJWT, checkRoles, checkOrgRoles };
