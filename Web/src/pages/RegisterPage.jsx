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
  HeartPulse,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import { PAGES, REGIONS } from "../utils/constants";
import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "../utils/helpers";
import { sendRegistrationOtp } from "../services/api";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import logo from "../assets/LOGOmain.jpg";

const FACEBOOK_APP_ID = "963479733091448";

const RegisterPage = ({ navigate }) => {
  const { register, loginWithSocial } = useAuth();
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

  // States cho OTP
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    let timer;
    if (countdown > 0 && step === 2) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, step]);

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
      newErrors.city = "Vui lòng chọn khu vực";
    }

    if (!formData.address) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    return newErrors;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      await sendRegistrationOtp(formData.email);
      setStep(2);
      setCountdown(60);
      window.scrollTo(0, 0);
    } catch (error) {
      setErrors({ general: error.message || "Gửi mã OTP thất bại" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendRegistrationOtp(formData.email);
      setCountdown(60);
      setErrors({});
    } catch (error) {
      setErrors({ general: error.message || "Gửi lại OTP thất bại" });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrors({ otp: "Mã OTP phải gồm 6 chữ số" });
      return;
    }

    setIsLoading(true);
    try {
      await register({ ...formData, otp });
      setShowSuccess(true);
      setTimeout(() => {
        navigate(PAGES.LOGIN);
      }, 1500);
    } catch (error) {
      setErrors({
        general: error.message || "Đăng ký thất bại. Vui lòng thử lại.",
      });
      console.error("Register error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (token, provider) => {
    setIsLoading(true);
    try {
      await loginWithSocial(token, provider);
      setShowSuccess(true);
      setTimeout(() => {
        navigate(PAGES.WELCOME);
      }, 1000);
    } catch (error) {
      setErrors({
        general: error?.message || `Đăng nhập ${provider} thất bại`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const googleLoginRef = useGoogleLogin({
    onSuccess: (credentialResponse) =>
      handleSocialLogin(credentialResponse.access_token, "google"),
  });

  return (
    <div className="min-h-screen bg-[#f4f8fb] font-sans text-gray-800 selection:bg-[#48a1f3]/30 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-7xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(20,50,80,0.08)] overflow-hidden flex flex-col lg:flex-row border border-white/60 relative">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-4/12 bg-gradient-to-br from-[#143250] to-[#1e4a77] relative p-10 flex-col text-white overflow-hidden">
          {/* Decorative Blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-96 h-96 bg-[#48a1f3]/20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#f99b1c]/10 rounded-full blur-[80px]"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/10 border border-white/20 overflow-hidden shrink-0">
                  <img src={logo} alt="STL Clinic Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight drop-shadow-md">STL Clinic</h1>
                  <p className="text-[#48a1f3] font-medium text-lg">Nền tảng y tế hàng đầu</p>
                </div>
              </div>
              <h1 className="text-4xl font-black text-white leading-tight">
                Đăng ký <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48a1f3] to-[#fbc374]">Tài khoản mới</span>
              </h1>
              <p className="text-blue-100/80 font-medium mt-4 text-lg">
                Tham gia nền tảng y tế để quản lý sức khỏe thông minh và tiện lợi nhất.
              </p>

              <ul className="space-y-6 pt-8 text-sm font-medium">
                <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="w-8 h-8 rounded-full bg-[#48a1f3] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg shadow-[#48a1f3]/30">
                    1
                  </span>
                  <span className="pt-1.5 text-white/90 text-base">Khai báo thông tin cá nhân bảo mật</span>
                </li>
                <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="w-8 h-8 rounded-full bg-[#f99b1c] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg shadow-[#f99b1c]/30">
                    2
                  </span>
                  <span className="pt-1.5 text-white/90 text-base">Xác thực OTP qua email nhanh chóng</span>
                </li>
                <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg shadow-[#10b981]/30">
                    3
                  </span>
                  <span className="pt-1.5 text-white/90 text-base">Sẵn sàng đặt lịch khám mọi lúc mọi nơi</span>
                </li>
              </ul>
            </div>

            <div className="mt-auto pt-8">
              {/* Social Login */}
              <div className="pt-6 border-t border-white/10 mb-6">
                <p className="text-sm text-blue-200/80 font-medium mb-4">Hoặc đăng ký nhanh bằng mạng xã hội</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => googleLoginRef()}
                    className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm !justify-center"
                  >
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="w-5 h-5 mr-2 bg-white rounded-full p-0.5"
                    />
                    Google
                  </Button>
                  <FacebookLogin
                    appId={FACEBOOK_APP_ID}
                    fields="name,email,picture"
                    callback={(response) => {
                      if (response?.accessToken) {
                        handleSocialLogin(response.accessToken, "facebook");
                      } else {
                        setErrors({
                          general: "Đăng nhập Facebook bị hủy hoặc thất bại",
                        });
                      }
                    }}
                    render={(renderProps) => (
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={renderProps.onClick}
                        className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm !justify-center"
                      >
                        <img
                          src="https://www.facebook.com/favicon.ico"
                          alt="Facebook"
                          className="w-5 h-5 mr-2 rounded-full"
                        />
                        Facebook
                      </Button>
                    )}
                  />
                </div>
              </div>

              <div className="text-sm text-blue-200/60 font-medium">
                &copy; 2026 STL Clinic. All rights reserved.
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-8/12 p-8 md:p-12 bg-white relative">

          {/* Top Bar: Back Button & Step */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
            <button
              onClick={() => navigate(PAGES.WELCOME)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl transition-all font-bold shadow-sm hover:shadow active:scale-95 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại Trang chủ</span>
            </button>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f4f8fb] border border-blue-100 text-[#143250] rounded-xl font-bold text-sm shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#48a1f3] animate-pulse"></span>
              Bước {step}/2
            </div>
          </div>
          {/* Mobile Header Intro (Only shows on mobile since left side is hidden) */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 border border-gray-100 overflow-hidden">
              <img src={logo} alt="STL Clinic Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black text-[#143250] leading-tight mb-2">
              Đăng ký tài khoản
            </h1>
            <p className="text-gray-500 font-medium">
              Tham gia nền tảng y tế để quản lý sức khỏe thông minh và tiện lợi nhất.
            </p>
          </div>

          {showSuccess && (
            <div className="mb-6 bg-[#ebfbf5] border border-[#10b981]/30 text-[#047857] px-5 py-4 rounded-xl flex items-center gap-3 font-medium shadow-sm">
              <CheckCircle className="w-6 h-6 text-[#10b981] flex-shrink-0" />
              <p>Đăng ký thành công! Đang chuyển hướng...</p>
            </div>
          )}
          {step === 1 ? (
            <form className="space-y-4" onSubmit={handleSendOtp}>
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
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
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
                    <p className="text-red-600 text-sm mt-1">
                      {errors.gender}
                    </p>
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
                    Khu vực <span className="text-red-500">*</span>
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
                    <option value="">Chọn khu vực</option>
                    {REGIONS.map((region) => (
                      <option key={region.value} value={region.label}>
                        {region.label}
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#48a1f3] to-[#3da3f5] hover:from-[#3da3f5] hover:to-[#48a1f3] shadow-lg shadow-[#48a1f3]/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xử lý..." : "Tiếp tục"}
              </button>



              <p className="text-center text-gray-500 text-sm mt-6 font-medium">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => navigate(PAGES.LOGIN)}
                  className="text-[#f99b1c] font-bold hover:text-[#e08915] transition-colors"
                >
                  Đăng nhập ngay
                </button>
              </p>
            </form>
          ) : (
            <form className="space-y-8" onSubmit={handleRegister}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fff4e5] text-[#f99b1c] rounded-full mb-4 shadow-sm border border-[#f99b1c]/20">
                  <Mail className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-[#143250] mb-3">
                  Xác thực Email
                </h2>
                <p className="text-gray-500 font-medium">
                  Mã OTP gồm 6 chữ số đã được gửi đến
                  <br />
                  <span className="font-bold text-[#48a1f3] text-lg mt-1 block">{formData.email}</span>
                </p>
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-[#143250] mb-3 text-center uppercase tracking-wider">
                  Nhập mã OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full text-center text-4xl font-black tracking-[0.5em] px-4 py-4 bg-[#fbfbfb] border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#48a1f3]/10 focus:border-[#48a1f3] outline-none transition-all shadow-inner text-[#143250]"
                  placeholder="------"
                />
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-3 text-center font-medium">
                    {errors.otp}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#10b981] shadow-lg shadow-[#10b981]/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận & Hoàn tất"}
              </button>

              <div className="text-center pt-2">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500 font-medium">
                    Gửi lại mã sau{" "}
                    <span className="font-bold text-[#f99b1c]">
                      {countdown}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-[#48a1f3] hover:text-[#3da3f5] font-bold transition"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
                <p className="mt-6 text-sm text-gray-500 font-medium">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-400 hover:text-[#143250] transition-colors"
                  >
                    &larr; Quay lại sửa email
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
