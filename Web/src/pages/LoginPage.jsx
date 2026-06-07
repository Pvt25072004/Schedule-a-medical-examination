import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  HeartPulse,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import { PAGES, USER_ROLES } from "../utils/constants";
import { validateEmail } from "../utils/helpers";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import logo from "../assets/LOGOmain.jpg";
import { requestReset, verifyReset } from "../services/api";

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

const LoginPage = ({ navigate }) => {
  const { login, loginWithSocial } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Forgot password states
  const [forgotStep, setForgotStep] = useState(0); // 0: login, 1: enter email, 2: enter otp
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
      const { user: loggedInUser } = await login(formData, true);
      setShowSuccess(true);

      setTimeout(() => {
        const role = (loggedInUser?.role || "").toLowerCase();
        if (role === USER_ROLES.DOCTOR) {
          navigate(PAGES.DOCTOR_DASHBOARD);
        } else if (location.state?.from) {
          navigate(location.state.from, location.state.options);
        } else {
          navigate(PAGES.WELCOME);
        }
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

  const handleSocialLogin = async (token, provider) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await loginWithSocial(token, provider);
      setShowSuccess(true);
      setTimeout(() => {
        const role = (loggedInUser?.role || "").toLowerCase();
        if (role === USER_ROLES.DOCTOR) {
          navigate(PAGES.DOCTOR_DASHBOARD);
        } else if (location.state?.from) {
          navigate(location.state.from, location.state.options);
        } else {
          navigate(PAGES.WELCOME);
        }
      }, 1000);
    } catch (error) {
      setErrors({
        general: error?.message || `Đăng nhập ${provider} thất bại`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      // access_token từ useGoogleLogin có thể được verify bởi Google Auth Library nếu cấu hình đúng,
      // nhưng thường backend verify id_token. Tuy nhiên thư viện @react-oauth/google trả về access_token ở Implicit flow
      // Nên tốt nhất ta dùng luồng implicit trả id_token hoặc gọi userInfo trên FE r đẩy lên BE.
      // Do BE mong đợi "token" và gọi verifyIdToken, ta cần trả về id_token.
      console.log(codeResponse);
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  const googleLoginRef = useGoogleLogin({
    onSuccess: (credentialResponse) =>
      handleSocialLogin(credentialResponse.access_token, "google"),
  });

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) {
      setErrors({ general: "Email không hợp lệ" });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      await requestReset(forgotEmail);
      setSuccessMsg("Mã OTP đã được gửi đến email của bạn");
      setForgotStep(2);
    } catch (err) {
      setErrors({ general: err.message || "Gửi mã thất bại" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyReset = async (e) => {
    e.preventDefault();
    if (!forgotOtp || newPassword.length < 6) {
      setErrors({ general: "Vui lòng nhập đủ OTP và Mật khẩu mới (ít nhất 6 ký tự)" });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      await verifyReset({ email: forgotEmail, otp: forgotOtp, newPassword });
      setSuccessMsg("Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.");
      setForgotStep(0);
      setFormData(prev => ({ ...prev, email: forgotEmail, password: newPassword }));
      setForgotEmail("");
      setForgotOtp("");
      setNewPassword("");
    } catch (err) {
      setErrors({ general: err.message || "Xác thực thất bại" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fb] font-sans text-gray-800 selection:bg-[#48a1f3]/30 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(20,50,80,0.08)] overflow-hidden flex flex-col lg:flex-row min-h-[700px] border border-white/60 relative">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#143250] to-[#1e4a77] relative p-12 flex-col justify-between text-white overflow-hidden">
          {/* Decorative Blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-96 h-96 bg-[#48a1f3]/20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#f99b1c]/10 rounded-full blur-[80px]"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/10 border border-white/20 overflow-hidden shrink-0">
                <img src={logo} alt="STL Clinic Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight drop-shadow-md">STL Clinic</h1>
                <p className="text-[#48a1f3] font-medium text-lg">Nền tảng y tế hàng đầu</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-black leading-tight drop-shadow-lg">
                Chào mừng <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48a1f3] to-[#fbc374]">trở lại! 👋</span>
              </h2>
              <p className="text-xl text-blue-100/80 font-light">
                Đăng nhập để tiếp tục quản lý sức khỏe của bạn
              </p>
            </div>

            {/* Features */}
            <div className="space-y-5 pt-6">
              {[
                { icon: "✓", text: "Đặt lịch khám nhanh chóng" },
                { icon: "✓", text: "Quản lý hồ sơ bệnh án" },
                { icon: "✓", text: "Tư vấn online 24/7" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#48a1f3]/20 rounded-full flex items-center justify-center border border-[#48a1f3]/30">
                    <span className="text-[#fbc374] font-bold">
                      {feature.icon}
                    </span>
                  </div>
                  <span className="text-blue-50 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Social Login */}
            <div className="pt-8 mt-8 border-t border-white/10">
              <p className="text-sm text-blue-200/80 font-medium mb-4">Hoặc đăng nhập nhanh bằng mạng xã hội</p>
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
          </div>
          
          <div className="relative z-10 text-sm text-blue-200/60 font-medium">
            &copy; 2026 STL Clinic. All rights reserved.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 xl:p-16 flex flex-col bg-white relative">
          
          {/* Top Bar: Back Button */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
            <button
              onClick={() => {
                if (forgotStep > 0) {
                  setForgotStep(0);
                  setErrors({});
                  setSuccessMsg("");
                } else {
                  navigate(PAGES.WELCOME);
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl transition-all font-bold shadow-sm hover:shadow active:scale-95 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{forgotStep > 0 ? "Quay lại Đăng nhập" : "Quay lại Trang chủ"}</span>
            </button>
          </div>

          <div className="max-w-md w-full mx-auto my-auto">
            
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 border border-gray-100 overflow-hidden">
                <img src={logo} alt="STL Clinic Logo" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-3xl font-black text-[#143250]">Đăng nhập</h2>
              <p className="text-gray-500 mt-2 font-medium">Chào mừng bạn quay trở lại</p>
            </div>

            <div className="hidden lg:block mb-10">
              <h2 className="text-4xl font-black text-[#143250] mb-3 tracking-tight">
                {forgotStep === 0 ? "Đăng nhập" : "Quên mật khẩu"}
              </h2>
              <p className="text-gray-500 font-medium text-lg">
                {forgotStep === 0 ? "Chào mừng bạn quay trở lại hệ thống." : "Khôi phục tài khoản của bạn"}
              </p>
            </div>

            {/* Success Message */}
            {showSuccess && forgotStep === 0 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 text-sm">
                  Đăng nhập thành công! Đang chuyển hướng...
                </p>
              </div>
            )}
            
            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 text-sm">{successMsg}</p>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            {forgotStep === 0 ? (
              <>
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

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep(1);
                        setErrors({});
                        setSuccessMsg("");
                      }}
                      className="text-sm text-[#48a1f3] hover:text-[#f99b1c] font-semibold transition-colors"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#48a1f3] to-[#3da3f5] hover:from-[#3da3f5] hover:to-[#48a1f3] shadow-lg shadow-[#48a1f3]/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
                  </button>
                </form>

                <p className="text-center text-gray-500 mt-10 font-medium text-base">
                  Chưa có tài khoản?{" "}
                  <button
                    onClick={() => navigate(PAGES.REGISTER)}
                    className="text-[#f99b1c] font-bold hover:text-[#e08915] transition-colors"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </>
            ) : forgotStep === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-6">
                <Input
                  type="email"
                  name="forgotEmail"
                  label="Email của bạn"
                  placeholder="Nhập email đã đăng ký"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    setErrors({});
                  }}
                  icon={Mail}
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading || !forgotEmail}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#f99b1c] to-[#fbc374] hover:from-[#fbc374] hover:to-[#f99b1c] shadow-lg shadow-[#f99b1c]/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyReset} className="space-y-6">
                <Input
                  type="text"
                  name="forgotOtp"
                  label="Mã xác nhận (OTP)"
                  placeholder="Nhập mã 6 số"
                  value={forgotOtp}
                  onChange={(e) => {
                    setForgotOtp(e.target.value);
                    setErrors({});
                  }}
                  icon={CheckCircle}
                  required
                />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    label="Mật khẩu mới"
                    placeholder="Ít nhất 6 ký tự"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors({});
                    }}
                    icon={Lock}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !forgotOtp || !newPassword}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#10b981] to-[#34d399] hover:from-[#34d399] hover:to-[#10b981] shadow-lg shadow-[#10b981]/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
