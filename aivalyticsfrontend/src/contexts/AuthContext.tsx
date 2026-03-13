import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "react-hot-toast";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
  signInWithGoogle: () => Promise<void>;
  clearAuthState: () => void;
  refreshUser: () => Promise<void>;
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

  const isAuthenticated = !!user;

  // Clear all authentication state
  const clearAuthState = useCallback(() => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    console.log("🔐 Auth state cleared");
  }, []);

  // Sync user data from Firestore
  const syncUserFromFirestore = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      
      // Get ID token for backend authentication
      const idToken = await firebaseUser.getIdToken();
      localStorage.setItem("accessToken", idToken);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // Update profile pic if it changed or is missing
        if (firebaseUser.photoURL && userData.profilePic !== firebaseUser.photoURL) {
          await setDoc(doc(db, "users", firebaseUser.uid), { profilePic: firebaseUser.photoURL }, { merge: true });
          userData.profilePic = firebaseUser.photoURL;
        }
        setUser(userData);
        return userData.role ? true : false;
      } else {
        console.warn("🔐 User document not found in Firestore. New social user detected.");
        // Create initial skeleton for social user
        const userData: User = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "user",
          email: firebaseUser.email || "",
          firstName: firebaseUser.displayName?.split(' ')[0] || "",
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || "",
          profilePic: firebaseUser.photoURL || "",
          createdAt: new Date().toISOString(),
          // role will be set by the RoleSelection page
        };
        await setDoc(doc(db, "users", firebaseUser.uid), userData);
        setUser(userData);
        return false; // Role not set
      }
    } catch (error) {
      console.error("🔐 Error syncing user data:", error);
      return false;
    }
  };

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setIsLoading(true);
        if (firebaseUser) {
          console.log("🔐 Firebase User detected:", firebaseUser.email);
          await syncUserFromFirestore(firebaseUser);
        } else {
          console.log("🔐 No Firebase User found");
          clearAuthState();
        }
      } catch (error) {
        console.error("🔐 Error in onAuthStateChanged:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [clearAuthState]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("🔐 Attempting Firebase login...");

      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.username,
        credentials.password
      );

      if (userCredential.user) {
        console.log("🔐 Firebase Login successful");
        await syncUserFromFirestore(userCredential.user);
        toast.success("Login successful!");
      }
    } catch (error: any) {
      console.error("🔐 Login failed:", error);
      let errorMessage = "Login failed";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password";
      }
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("🔐 Attempting Google Login...");
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      if (userCredential.user) {
        console.log("🔐 Google Login successful");
        const hasRole = await syncUserFromFirestore(userCredential.user);
        if (hasRole) {
          toast.success("Login successful!");
        } else {
          toast.success("Please select your role to continue.");
        }
      }
    } catch (error: any) {
      console.error("🔐 Google Login failed:", error);
      toast.error("Google login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("🔐 Attempting Firebase registration...");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email || "",
        data.password
      );

      if (userCredential.user) {
        // Create user document in Firestore
        const userData: User = {
          id: userCredential.user.uid,
          username: data.username,
          email: data.email,
          rollNumber: data.rollNumber || "",
          role: data.role || 'teacher',
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", userCredential.user.uid), userData);

        console.log("🔐 Registration and Firestore profile creation successful");
        toast.success("Registration successful!");
      }
    } catch (error: any) {
      console.error("🔐 Registration failed:", error);
      let errorMessage = "Registration failed";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email already in use";
      }
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (data: ForgotPasswordData): Promise<void> => {
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, data.email);
      toast.success("Password reset instructions sent!");
    } catch (error: any) {
      console.error("🔐 Forgot password failed:", error);
      toast.error(error.message || "Failed to send reset instructions");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData): Promise<void> => {
    toast.error("Manual password reset not implemented. Please use the link sent to your email.");
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("🔐 Logging out from Firebase...");
      await signOut(auth);
      clearAuthState();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("🔐 Logout error:", error);
      toast.error("Logout failed");
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken(true);
        localStorage.setItem("accessToken", idToken);
        console.log("🔐 Token refreshed via Firebase");
      }
    } catch (error) {
      console.error("🔐 Token refresh failed:", error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (auth.currentUser) {
      await syncUserFromFirestore(auth.currentUser);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken,
    signInWithGoogle,
    clearAuthState,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
