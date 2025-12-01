import React, { createContext, useState, useContext } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  updateUser as apiUpdateUser,
} from "../services/api";

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

      // Chuẩn hóa dữ liệu user cho frontend (dùng fullName thay vì full_name)
      const normalizedUser = {
        ...userData,
        fullName: userData.fullName || userData.full_name || "",
      };

      setUser(normalizedUser);
      setIsAuthenticated(true);

      // Store token and user data
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(normalizedUser));
      }

      return { user: normalizedUser, token };
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
        address: userData.address || "",
        city: userData.city || "",
      };

      const response = await apiRegister(registerData);
      const userFromApi = response.user;
      const token = response.access_token;

      const normalizedUser = {
        ...userFromApi,
        fullName: userFromApi.fullName || userFromApi.full_name || "",
      };

      setUser(normalizedUser);
      setIsAuthenticated(true);

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      return { user: normalizedUser, token };
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user?.id) {
      // Không có id thì chỉ cập nhật local
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      const savedUser = sessionStorage.getItem("user");
      if (savedUser) {
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }
      return updatedUser;
    }

    // Map dữ liệu frontend sang backend (UserEntity)
    const payload = {
      full_name: updates.fullName ?? user.fullName ?? user.full_name,
      email: updates.email ?? user.email,
      phone: updates.phone ?? user.phone,
      date_of_birth:
        updates.dateOfBirth ?? user.dateOfBirth ?? user.date_of_birth,
      gender: updates.gender ?? user.gender,
      address: updates.address ?? user.address,
      // Bổ sung các trường CCCD + avatar
      id_card_number: updates.id_card_number ?? user.id_card_number ?? null,
      avatar_url: updates.avatar_url ?? user.avatar_url ?? null,
      id_card_front_url:
        updates.id_card_front_url ?? user.id_card_front_url ?? null,
      id_card_back_url:
        updates.id_card_back_url ?? user.id_card_back_url ?? null,
    };

    const updatedFromApi = await apiUpdateUser(user.id, payload);

    const normalizedUser = {
      ...updatedFromApi,
      fullName: updatedFromApi.fullName || updatedFromApi.full_name || "",
    };

    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      sessionStorage.setItem("user", JSON.stringify(normalizedUser));
    }

    return normalizedUser;
  };

  // Khôi phục session khi load lại trang
  React.useEffect(() => {
    const savedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    const savedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

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
