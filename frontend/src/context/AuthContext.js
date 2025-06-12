"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount and when window gets focus
  useEffect(() => {
    checkAuth();

    // Re-check authentication when the user comes back to the tab/window
    const handleFocus = () => {
      if (Cookies.get("accessToken")) {
        checkAuth();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);
  const checkAuth = async () => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await api.get("/users/me");
      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      } else {
        // Token is invalid
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid tokens
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;

        // Store tokens
        Cookies.set("accessToken", accessToken, { expires: 1 }); // 1 day
        Cookies.set("refreshToken", refreshToken, { expires: 7 }); // 7 days

        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/users/register", userData);
      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear tokens and state
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const switchOrganization = async (organizationId) => {
    try {
      const response = await api.post("/users/switch-organization", {
        organizationId,
      });
      if (response.data.success) {
        // Update tokens with new organization context
        const { accessToken } = response.data.data;
        Cookies.set("accessToken", accessToken, { expires: 1 });
        await checkAuth(); // Refresh user data
        return { success: true };
      }
    } catch (error) {
      console.error("Organization switch failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to switch organization",
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    switchOrganization,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
