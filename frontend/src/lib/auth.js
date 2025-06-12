import jwt from "jsonwebtoken";
import { User } from "@/models/user.model";
import { ApiError } from "@/lib/api-utils";
import connectDB from "@/lib/db";

export async function verifyJWT(request) {
  try {
    const token =
      request.cookies.get("accessToken")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    await connectDB();
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    return user;
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
}

export function checkRoles(requiredRolesByScope) {
  return (user) => {
    // Check if the user is a site admin (bypass for all scopes)
    if (user.isSiteAdmin) {
      return true; // Site admin bypasses all role checks
    }

    // Extract roles for each scope
    const orgRoles = user.activeOrgRoles || []; // Organization roles
    const teamRoles = user.activeTeamRoles || []; // Team roles
    const siteRoles = user.siteLevelRoles || []; // Site-level roles

    // Check roles for each scope
    const hasOrgAccess = requiredRolesByScope.org
      ? requiredRolesByScope.org.some((role) => orgRoles.includes(role))
      : true; // Default to true if no org roles are required

    const hasTeamAccess = requiredRolesByScope.team
      ? requiredRolesByScope.team.some((role) => teamRoles.includes(role))
      : true; // Default to true if no team roles are required

    const hasSiteAccess = requiredRolesByScope.siteLevel
      ? requiredRolesByScope.siteLevel.some((role) => siteRoles.includes(role))
      : true; // Default to true if no site roles are required

    // Return true if any access is granted
    return hasOrgAccess || hasTeamAccess || hasSiteAccess;
  };
}

// Wrapper function for protected API routes
export function withAuth(handler, roleRequirements = null) {
  return async (request, context) => {
    try {
      const user = await verifyJWT(request);

      if (roleRequirements && !checkRoles(roleRequirements)(user)) {
        throw new ApiError(403, "Insufficient permissions");
      }

      // Add user to request context
      request.user = user;

      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(401, "Authentication failed");
    }
  };
}
