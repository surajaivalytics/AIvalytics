import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "react-hot-toast";
import apiService from "../services/api";
import {
  User,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
} from "../types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  const isAuthenticated = !!user;

  // Clear all authentication state
  const clearAuthState = useCallback(() => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token"); // Clean up any legacy tokens
    console.log("🔐 Auth state cleared");
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          console.log("🔐 No token found, skipping auth check");
          setIsLoading(false);
          setIsInitializing(false);
          return;
        }

        console.log("🔐 Verifying existing token...");
        const response = await apiService.verifyToken();

        if (response.success && response.user) {
          console.log("🔐 Token valid, setting user:", response.user);
          setUser(response.user);
        } else {
          console.log("🔐 Token invalid, clearing auth state");
          clearAuthState();
        }
      } catch (error) {
        console.error("🔐 Token verification failed:", error);
        clearAuthState();
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [clearAuthState]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("🔐 Attempting login...");

      // Clear any existing auth state before login
      clearAuthState();

      const response = await apiService.login(credentials);

      if (response.success && response.user && response.tokens) {
        console.log("🔐 Login successful, setting user:", response.user);
        setUser(response.user);
        localStorage.setItem("accessToken", response.tokens.accessToken);
        localStorage.setItem("refreshToken", response.tokens.refreshToken);
        toast.success(response.message || "Login successful!");
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("🔐 Login failed:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.register(data);

      if (response.success) {
        toast.success(response.message || "Registration successful!");
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (data: ForgotPasswordData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.forgotPassword(data);

      if (response.success) {
        toast.success(response.message || "Password reset instructions sent!");

        // In development, show the reset token
        if (import.meta.env.DEV && response.resetToken) {
          console.log("Reset Token (Development Only):", response.resetToken);
          toast.success(
            `Reset token (dev): ${response.resetToken.substring(0, 20)}...`
          );
        }
      } else {
        throw new Error(
          response.message || "Failed to send reset instructions"
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send reset instructions";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.resetPassword({
        token: data.token,
        password: data.newPassword,
      });

      if (response.success) {
        toast.success(response.message || "Password reset successfully!");
      } else {
        throw new Error(response.message || "Password reset failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Password reset failed";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("🔐 Logging out...");
      // Attempt to call logout API, but don't fail if it doesn't work
      try {
        await apiService.logout();
      } catch (error) {
        console.warn(
          "🔐 Logout API call failed, but continuing with local cleanup:",
          error
        );
      }
    } catch (error) {
      console.error("🔐 Logout error:", error);
    } finally {
      // Always clear local state regardless of API call success
      clearAuthState();
      toast.success("Logged out successfully");
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      console.log("🔐 Refreshing token...");
      const response = await apiService.refreshToken();

      if (response.success && response.tokens) {
        localStorage.setItem("accessToken", response.tokens.accessToken);
        localStorage.setItem("refreshToken", response.tokens.refreshToken);
        console.log("🔐 Token refreshed successfully");
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      console.error("🔐 Token refresh failed:", error);
      clearAuthState();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: isLoading || isInitializing,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken,
    clearAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
