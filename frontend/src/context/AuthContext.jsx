import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser, loginUser } from "../api/auth";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from "../api/tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken && !refreshToken) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function login(credentials) {
    await loginUser(credentials);

    const currentUser = await getCurrentUser();
    setUser(currentUser);

    return currentUser;
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAuthLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}