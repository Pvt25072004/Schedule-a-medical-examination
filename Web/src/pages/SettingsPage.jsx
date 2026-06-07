import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  User,
  Bell,
  Lock,
  Globe,
  Moon,
  CreditCard,
  LogOut,
  ChevronRight,
  Check,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PAGES } from "../utils/constants";
import { changePassword, uploadUserImage } from "../services/api";

const SettingsPage = ({ navigate }) => {
  const { user, logout, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState("account");
  const [selectedFiles, setSelectedFiles] = useState({
    avatarUrl: null,
  });
  const [settings, setSettings] = useState({
    // Giá trị mặc định, sẽ được override từ localStorage (nếu có)
    theme: "light",
  });

  // Form thông tin user (có thể chỉnh sửa)
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth:
      user?.dateOfBirth ||
      (user?.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split("T")[0]
        : ""),
    gender: user?.gender || "",
    address: user?.address || "",
    // Thông tin bổ sung
    avatarUrl: user?.avatar_url || "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // File input refs để chọn ảnh thật từ máy
  const avatarFileInputRef = useRef(null);

  // Đọc theme từ localStorage khi load lần đầu
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setSettings((prev) => ({ ...prev, theme: savedTheme }));
    }
  }, []);

  // Đồng bộ theme vào documentElement + lưu localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("theme-dark");
      root.classList.remove("theme-light");
    } else {
      root.classList.add("theme-light");
      root.classList.remove("theme-dark");
    }
    localStorage.setItem("theme", settings.theme);
  }, [settings.theme]);

  const menuItems = [
    {
      id: "account",
      icon: User,
      label: "Tài khoản",
      desc: "Quản lý thông tin cá nhân",
    },
    {
      id: "security",
      icon: Lock,
      label: "Bảo mật",
      desc: "Mật khẩu và xác thực",
    },
    {
      id: "appearance",
      icon: Moon,
      label: "Giao diện",
      desc: "Chủ đề sáng tối",
    },
  ];

  // Đọc file ảnh và convert sang data URL để lưu vào profileForm (MySQL lưu text)
  const handleImageFileChange = (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFiles((prev) => ({ ...prev, [field]: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileForm((prev) => ({
        ...prev,
        [field]: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const renderAccountSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Thông tin cá nhân
          </h3>

          {/* Avatar preview */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer"
              title="Bấm để chọn ảnh đại diện từ máy"
              onClick={() => avatarFileInputRef.current?.click()}
            >
              {profileForm.avatarUrl ? (
                <img
                  src={profileForm.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-sm text-gray-500">No avatar</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  fullName: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày sinh
            </label>
            <input
              type="date"
              value={profileForm.dateOfBirth}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  dateOfBirth: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới tính
            </label>
            <select
              value={profileForm.gender}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, gender: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <input
              type="text"
              value={profileForm.address}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh đại diện
            </label>
            <div
              className="w-24 h-24 rounded-full border border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden"
              title="Bấm để chọn ảnh đại diện từ file"
              onClick={() => avatarFileInputRef.current?.click()}
            >
              {profileForm.avatarUrl ? (
                <img
                  src={profileForm.avatarUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-500 text-center px-2">
                  Chọn ảnh đại diện
                </span>
              )}
            </div>
          </div>

          {profileMessage && (
            <p className="text-sm text-green-600">{profileMessage}</p>
          )}

          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
            disabled={savingProfile}
            onClick={async () => {
              try {
                if (!user?.id) {
                  setProfileMessage(
                    "Không xác định được tài khoản để cập nhật"
                  );
                  return;
                }
                setSavingProfile(true);
                setProfileMessage(null);

                let finalAvatarUrl = profileForm.avatarUrl;

                if (selectedFiles.avatarUrl) {
                  const res = await uploadUserImage(selectedFiles.avatarUrl);
                  if (res?.image_url) finalAvatarUrl = res.image_url;
                }

                // Cập nhật qua AuthContext (tự gọi API + lưu localStorage)
                await updateProfile({
                  fullName: profileForm.fullName,
                  email: profileForm.email,
                  phone: profileForm.phone,
                  dateOfBirth: profileForm.dateOfBirth,
                  gender: profileForm.gender,
                  address: profileForm.address,
                  avatar_url: finalAvatarUrl,
                });

                setProfileMessage("Cập nhật thông tin thành công");
                setSelectedFiles({
                  avatarUrl: null,
                });
              } catch (e) {
                setProfileMessage(e.message || "Cập nhật thất bại");
              } finally {
                setSavingProfile(false);
              }
            }}
          >
            {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={avatarFileInputRef}
        className="hidden"
        onChange={(e) => handleImageFileChange(e, "avatarUrl")}
      />
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Đổi mật khẩu
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          {passwordMessage && (
            <p
              className={`text-sm ${passwordMessage.type === "error"
                ? "text-red-600"
                : "text-green-600"
                }`}
            >
              {passwordMessage.text}
            </p>
          )}
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
            disabled={savingPassword}
            onClick={async () => {
              if (!passwordForm.currentPassword || !passwordForm.newPassword) {
                setPasswordMessage({
                  type: "error",
                  text: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới",
                });
                return;
              }
              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setPasswordMessage({
                  type: "error",
                  text: "Mật khẩu mới và xác nhận không khớp",
                });
                return;
              }
              try {
                setSavingPassword(true);
                setPasswordMessage(null);
                await changePassword({
                  currentPassword: passwordForm.currentPassword,
                  newPassword: passwordForm.newPassword,
                });
                setPasswordMessage({
                  type: "success",
                  text: "Đổi mật khẩu thành công",
                });
                setPasswordForm({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              } catch (e) {
                setPasswordMessage({
                  type: "error",
                  text: e.message || "Đổi mật khẩu thất bại",
                });
              } finally {
                setSavingPassword(false);
              }
            }}
          >
            {savingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Chủ đề</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSettings((prev) => ({ ...prev, theme: "light" }))}
            className={`p-4 border-2 rounded-lg transition-all ${settings.theme === "light"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-gray-300"
              }`}
          >
            <div className="w-full h-20 bg-white rounded mb-2 border border-gray-200"></div>
            <p className="font-medium text-gray-800">Sáng</p>
            {settings.theme === "light" && (
              <Check className="w-5 h-5 text-green-500 mx-auto mt-2" />
            )}
          </button>
          <button
            onClick={() => setSettings((prev) => ({ ...prev, theme: "dark" }))}
            className={`p-4 border-2 rounded-lg transition-all ${settings.theme === "dark"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-gray-300"
              }`}
          >
            <div className="w-full h-20 bg-gray-800 rounded mb-2"></div>
            <p className="font-medium text-gray-800">Tối</p>
            {settings.theme === "dark" && (
              <Check className="w-5 h-5 text-green-500 mx-auto mt-2" />
            )}
          </button>
        </div>
      </div>
    </div>
  );


  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return renderAccountSection();
      case "security":
        return renderSecuritySection();
      case "appearance":
        return renderAppearanceSection();
      default:
        return renderAccountSection();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)]">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-all ${activeSection === item.id
                      ? "bg-green-50 border-l-4 border-green-500 text-green-700"
                      : "hover:bg-gray-50 text-gray-700 border-l-4 border-transparent"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
