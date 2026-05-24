import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PAGES } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import Button from "./Button";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Ẩn Header ở các trang auth hoặc dashboard của admin/doctor
  const hideOnRoutes = [
    PAGES.LOGIN,
    PAGES.REGISTER,
    PAGES.ADMIN_DASHBOARD,
    PAGES.DOCTOR_DASHBOARD,
  ];

  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  const handleScrollTo = (id) => {
    if (location.pathname !== PAGES.WELCOME) {
      navigate(PAGES.WELCOME);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(PAGES.WELCOME)}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">STL Clinic</h1>
              <p className="text-xs text-gray-500">Chăm sóc sức khỏe toàn diện</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => {
                navigate(PAGES.WELCOME);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Trang chủ
            </button>
            <button
              onClick={() => handleScrollTo("doctors")}
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Bác sĩ
            </button>
            <button
              onClick={() => handleScrollTo("specialties")}
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Chuyên khoa
            </button>
            <button
              onClick={() => handleScrollTo("contact")}
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Liên hệ
            </button>
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-medium transition flex items-center gap-1">
                Tin tức
              </button>
              <div className="absolute top-full left-0 mt-4 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-2">
                  <button 
                    onClick={() => navigate(PAGES.FANPAGE)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Bảng tin Fanpage
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <img
                    src={
                      user?.avatar_url ||
                      "https://ui-avatars.com/api/?name=" +
                        (user?.fullName || "User")
                    }
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                  <span className="font-medium text-gray-700">
                    {user?.fullName || "Người dùng"}
                  </span>
                </button>
                <div className="absolute top-full right-0 mt-4 w-56 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-2">
                    <button
                      onClick={() => navigate(PAGES.HOME)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                    >
                      Bảng điều khiển / Đặt lịch
                    </button>
                    <button
                      onClick={() => navigate(PAGES.APPOINTMENTS)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Lịch hẹn của tôi
                    </button>
                    <button
                      onClick={() => navigate(PAGES.SETTINGS)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Thông tin cá nhân
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        navigate(PAGES.WELCOME);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(PAGES.LOGIN)}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(PAGES.REGISTER)}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
