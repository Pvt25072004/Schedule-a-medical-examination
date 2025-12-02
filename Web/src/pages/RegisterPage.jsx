import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Calendar,
  MapPin,
  Phone,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import { PAGES, CITIES } from "../utils/constants";
import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "../utils/helpers";

const RegisterPage = ({ navigate }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    // Phù hợp với UserEntity + RegisterDto
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    city: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate theo UserEntity + RegisterDto (1 form duy nhất)
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Họ tên quá ngắn";
    }

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // validatePassword hiện trả về boolean (true nếu >= 6 ký tự)
    if (!validatePassword(formData.password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    }

    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    if (!formData.phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
    }

    if (!formData.city) {
      newErrors.city = "Vui lòng chọn tỉnh/thành phố";
    }

    if (!formData.address) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Gửi đúng format backend cần (RegisterDto + UserEntity)
      await register(formData);
      setShowSuccess(true);
      setTimeout(() => {
        navigate(PAGES.LOGIN);
      }, 1500);
    } catch (error) {
      const errorMessage =
        error?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      setErrors({ general: errorMessage });
      console.error("Register error:", error);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(PAGES.WELCOME)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Trang chủ</span>
        </button>

        <Card className="shadow-xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Intro */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Đăng ký tài khoản
              </h1>
              <p className="text-gray-600">
                Tạo tài khoản để đặt lịch khám, quản lý hồ sơ sức khỏe và nhận
                thông báo từ phòng khám.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  Nhập thông tin cá nhân và tài khoản
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  Xác nhận thông tin liên hệ
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  Bắt đầu đặt lịch khám ngay
                </li>
              </ul>

              {/* Success Message */}
              {showSuccess && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm">
                    Đăng ký thành công! Đang chuyển hướng...
                  </p>
                </div>
              )}
            </div>

            {/* Right: Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <Input
                type="text"
                name="fullName"
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                icon={User}
                required
              />

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

              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    label="Mật khẩu"
                    placeholder="Tối thiểu 6 ký tự"
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

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    icon={Lock}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  name="dateOfBirth"
                  label="Ngày sinh"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  error={errors.dateOfBirth}
                  icon={Calendar}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.gender
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-600 text-sm mt-1">{errors.gender}</p>
                  )}
                </div>
              </div>

              <Input
                type="tel"
                name="phone"
                label="Số điện thoại"
                placeholder="0123456789"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={Phone}
                helperText="Số điện thoại 10-11 chữ số"
                required
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.city
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {CITIES.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <Input
                  type="text"
                  name="address"
                  label="Địa chỉ chi tiết"
                  placeholder="Số nhà, đường, phường/xã"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  icon={MapPin}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
                className="w-full mt-2"
              >
                Đăng ký
              </Button>

              <p className="text-center text-gray-600 text-sm mt-4">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => navigate(PAGES.LOGIN)}
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Đăng nhập ngay
                </button>
              </p>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
