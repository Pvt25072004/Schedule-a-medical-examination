import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import { PAGES } from "../utils/constants";
import { validateEmail } from "../utils/helpers";

const LoginPage = ({ navigate }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await login(formData, rememberMe);
      setShowSuccess(true);

      setTimeout(() => {
        navigate(PAGES.HOME);
      }, 1000);
    } catch (error) {
      // Hiển thị error message chi tiết từ backend
      const errorMessage =
        error?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setErrors({ general: errorMessage });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">STL Clinic</h1>
                <p className="text-gray-600">Nền tảng y tế hàng đầu</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Chào mừng trở lại! 👋
              </h2>
              <p className="text-xl text-gray-600">
                Đăng nhập để tiếp tục quản lý sức khỏe của bạn
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-8">
              {[
                { icon: "✓", text: "Đặt lịch khám nhanh chóng" },
                { icon: "✓", text: "Quản lý hồ sơ bệnh án" },
                { icon: "✓", text: "Tư vấn online 24/7" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">
                      {feature.icon}
                    </span>
                  </div>
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Illustration */}
            <div className="relative pt-8">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80"
                alt="Medical"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div>
          {/* Mobile Back Button */}
          <button
            onClick={() => navigate(PAGES.WELCOME)}
            className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>

          <Card className="shadow-2xl">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-3">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
              <p className="text-gray-600 mt-1">Chào mừng bạn quay trở lại</p>
            </div>

            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Đăng nhập
              </h2>
              <p className="text-gray-600">Nhập thông tin để tiếp tục</p>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 text-sm">
                  Đăng nhập thành công! Đang chuyển hướng...
                </p>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={Mail}
                required
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={Lock}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Ghi nhớ đăng nhập
                  </span>
                </label>

                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 mb-1">
                    Demo: Đăng nhập nhanh
                  </p>
                  <p className="text-blue-700">Email: demo@stlclinic.com</p>
                  <p className="text-blue-700">Mật khẩu: 123456</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => alert("Tính năng đang phát triển")}
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-5 h-5"
                />
                Google
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => alert("Tính năng đang phát triển")}
              >
                <img
                  src="https://www.facebook.com/favicon.ico"
                  alt="Facebook"
                  className="w-5 h-5"
                />
                Facebook
              </Button>
            </div>

            {/* Register Link */}
            <p className="text-center text-gray-600 mt-6">
              Chưa có tài khoản?{" "}
              <button
                onClick={() => navigate(PAGES.REGISTER)}
                className="text-blue-600 font-semibold hover:text-blue-700 transition"
              >
                Đăng ký ngay
              </button>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
