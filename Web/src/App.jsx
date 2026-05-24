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
import { GoogleOAuthProvider } from "@react-oauth/google";

// Pages
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import BookingFlowPage from "./pages/BookingFlowPage";
import DoctorListPage from "./pages/DoctorListPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import BannerPage from "./pages/BannerPage";
import FanpagePage from "./pages/FanpagePage";
import FanpageDetailPage from "./pages/FanpageDetailPage";
import Header from "./components/common/Header";
import ScrollToTop from "./components/common/ScrollToTop";

import { PAGES } from "./utils/constants";
import "./index.css";

const AppRoutes = () => {
  const { isAuthenticated, user, isAuthReady } = useAuth();
  const navigate = useNavigate();

  const navigateTo = (page, options) => {
    navigate(page, options);
  };

  const RoleProtectedRoute = ({ roles, children }) => {
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
    <>
      <Header />
      <Routes>
        <Route
          path={PAGES.WELCOME}
          element={<WelcomePage navigate={navigateTo} />}
        />
        <Route
          path={PAGES.LOGIN}
          element={<LoginPage navigate={navigateTo} />}
        />
        <Route
          path={PAGES.REGISTER}
          element={<RegisterPage navigate={navigateTo} />}
        />
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
          path={PAGES.BANNER_MANAGEMENT}
          element={
            isAuthenticated ? (
              <BannerPage navigate={navigateTo} />
            ) : (
              <Navigate to={PAGES.WELCOME} replace />
            )
          }
        />
        <Route
          path={PAGES.BOOKING}
          element={
            isAuthenticated ? (
              <BookingFlowPage navigate={navigateTo} />
            ) : (
              <Navigate to={PAGES.WELCOME} replace />
            )
          }
        />
        <Route
          path={PAGES.BOOK_DOCTOR}
          element={
            isAuthenticated ? (
              <BookingPage navigate={navigateTo} />
            ) : (
              <Navigate to={PAGES.WELCOME} replace />
            )
          }
        />
        <Route
          path={PAGES.DOCTORS}
          element={<DoctorListPage navigate={navigateTo} />}
        />
        <Route
          path={PAGES.FANPAGE}
          element={<FanpagePage navigate={navigateTo} />}
        />
        <Route
          path={PAGES.FANPAGE_DETAIL}
          element={<FanpageDetailPage />}
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
        <Route path="/" element={<Navigate to={PAGES.WELCOME} replace />} />
        <Route path="*" element={<Navigate to={PAGES.WELCOME} replace />} />
      </Routes>
    </>
  );
};

const GOOGLE_CLIENT_ID =
  "359909618045-mvoc5piuvt19siurfk0bf8226sqicqb6.apps.googleusercontent.com";

const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppointmentProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="font-sans">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </AppointmentProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
