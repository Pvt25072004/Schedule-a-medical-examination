import React, { createContext, useState, useContext } from "react";
import { login as apiLogin, register as apiRegister } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials, rememberMe = false) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(credentials);
      const userData = response.user;
      const token = response.access_token;

      setUser(userData);
      setIsAuthenticated(true);
      
      // Store token and user data
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(userData));
      }
      
      return { user: userData, token };
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      // Transform frontend data to backend format
      const registerData = {
        full_name: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        date_of_birth: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address || '',
        city: userData.city || '',
      };

      const response = await apiRegister(registerData);
      const user = response.user;
      const token = response.access_token;

      setUser(user);
      setIsAuthenticated(true);
      
      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Khôi phục session khi load lại trang
  React.useEffect(() => {
    const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    const savedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        logout();
      }
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
