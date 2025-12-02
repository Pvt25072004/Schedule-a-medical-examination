import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppointmentProvider } from "./contexts/AppointmentContext";

// Pages
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";

import { PAGES } from "./utils/constants";
import "./index.css";

// Component chứa toàn bộ routes, sử dụng React Router
const AppRoutes = () => {
  const { isAuthenticated, user, isAuthReady } = useAuth();
  const navigate = useNavigate();

  // Giữ API navigate(page) như cũ để không phải sửa các page
  const navigateTo = (page) => {
    navigate(page);
  };

  const RoleProtectedRoute = ({ roles, children }) => {
    // Chờ khởi tạo Auth (đọc từ localStorage / sessionStorage) xong rồi mới quyết định redirect
    if (!isAuthReady) {
      return null;
    }

    if (!isAuthenticated) {
      return <Navigate to={PAGES.WELCOME} replace />;
    }

    if (!roles || roles.length === 0) {
      return children;
    }

    const normalizedRole =
      (
        user?.role ||
        user?.userRole ||
        user?.user_role ||
        user?.roles?.[0] ||
        "patient"
      )?.toLowerCase() ?? "patient";

    if (!roles.map((r) => r.toLowerCase()).includes(normalizedRole)) {
      return <Navigate to={PAGES.HOME} replace />;
    }

    return children;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path={PAGES.WELCOME}
        element={
          isAuthenticated ? (
            <Navigate to={PAGES.HOME} replace />
          ) : (
            <WelcomePage navigate={navigateTo} />
          )
        }
      />
      <Route path={PAGES.LOGIN} element={<LoginPage navigate={navigateTo} />} />
      <Route
        path={PAGES.REGISTER}
        element={<RegisterPage navigate={navigateTo} />}
      />

      {/* Protected routes - yêu cầu đã đăng nhập */}
      <Route
        path={PAGES.HOME}
        element={
          isAuthenticated ? (
            <HomePage navigate={navigateTo} />
          ) : (
            <Navigate to={PAGES.WELCOME} replace />
          )
        }
      />
      <Route
        path={PAGES.BOOKING}
        element={
          isAuthenticated ? (
            <BookingPage navigate={navigateTo} />
          ) : (
            <Navigate to={PAGES.WELCOME} replace />
          )
        }
      />
      <Route
        path={PAGES.APPOINTMENTS}
        element={
          isAuthenticated ? (
            <AppointmentsPage navigate={navigateTo} />
          ) : (
            <Navigate to={PAGES.WELCOME} replace />
          )
        }
      />
      <Route
        path={PAGES.CHAT}
        element={
          isAuthenticated ? (
            <ChatPage navigate={navigateTo} />
          ) : (
            <Navigate to={PAGES.WELCOME} replace />
          )
        }
      />
      <Route
        path={PAGES.SETTINGS}
        element={
          isAuthenticated ? (
            <SettingsPage navigate={navigateTo} />
          ) : (
            <Navigate to={PAGES.WELCOME} replace />
          )
        }
      />

      {/* Role-based routes */}
      <Route
        path={PAGES.ADMIN_DASHBOARD}
        element={
          <RoleProtectedRoute roles={["admin"]}>
            <AdminDashboardPage navigate={navigateTo} />
          </RoleProtectedRoute>
        }
      />
      <Route
        path={PAGES.DOCTOR_DASHBOARD}
        element={
          <RoleProtectedRoute roles={["doctor"]}>
            <DoctorDashboardPage navigate={navigateTo} />
          </RoleProtectedRoute>
        }
      />

      {/* Redirect root "/" về WELCOME (hoặc HOME nếu đã login) */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={PAGES.HOME} replace />
          ) : (
            <Navigate to={PAGES.WELCOME} replace />
          )
        }
      />

      {/* Catch-all: về trang welcome */}
      <Route path="*" element={<Navigate to={PAGES.WELCOME} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <BrowserRouter>
          <div className="font-sans">
            <AppRoutes />
          </div>
        </BrowserRouter>
      </AppointmentProvider>
    </AuthProvider>
  );
}

export default App;
