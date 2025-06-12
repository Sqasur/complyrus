"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const withAuth = (WrappedComponent, allowedRoles = []) => {
  return function AuthComponent(props) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push("/login");
          return;
        }

        // Check role-based access if roles are specified
        if (allowedRoles.length > 0) {
          const hasRequiredRole = allowedRoles.some((role) => {
            // Check site-level roles
            if (user.siteRoles?.includes(role)) return true;

            // Check organization-level roles
            if (user.activeOrgRoles?.includes(role)) return true;

            // Check team-level roles
            if (user.activeTeamRoles?.includes(role)) return true;

            return false;
          });

          if (!hasRequiredRole) {
            router.push("/unauthorized");
            return;
          }
        }
      }
    }, [loading, isAuthenticated, user, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
