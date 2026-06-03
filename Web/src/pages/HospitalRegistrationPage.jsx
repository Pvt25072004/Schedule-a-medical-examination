import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PAGES } from "../utils/constants";
import {
  initHospitalRegistration,
  verifyHospitalRegistrationOtp,
  submitHospitalRegistration,
} from "../services/hospital.registration.api";
import { uploadUserImage } from "../services/api";
import { getCities } from "../services/cities.api";
import { getCategories } from "../services/admin.categories.api";
import {
  Building2, CheckCircle2, ChevronRight, FileCheck, Mail, ShieldCheck,
  Phone, MapPin, Clock, ArrowRight, Activity, Users, Calendar, Shield,
  UploadCloud, PlayCircle, X
} from "lucide-react";

export default function HospitalRegistrationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(-1); // -1: Intro, 0: Init, 1: OTP, 2: Info, 3: Docs, 4: Confirm, 5: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationId, setRegistrationId] = useState(null);

  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);

  const [formData, setFormData] = useState({
    admin_email: "",
    admin_name: "",
    admin_phone: "",
    admin_role: "Quản lý / Giám đốc",
    otp: "",

    hospital_name: "",
    hospital_type: "Phòng khám",
    business_license_number: "",
    scale: "<50 giường",
    founded_year: "",
    logo_url: "",

    address: "",
    city_id: "",
    district: "",
    ward: "",
    hotline: "",
    contact_email: "",
    open_hours: "07:00 - 17:00",

    operating_license_url: "",
    business_license_url: "",
    quality_certificate_url: "",

    doctor_count: "",
    specialties: [],

    accepts_online_payment: true,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesData, categoriesData] = await Promise.all([
          getCities(),
          getCategories()
        ]);
        setCities(citiesData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Failed to load cities/categories", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      setError("");
      const result = await uploadUserImage(file);
      setFormData((prev) => ({
        ...prev,
        [fieldName]: result.image_url,
      }));
    } catch (err) {
      setError("Không thể tải lên file. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleInit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await initHospitalRegistration({
        admin_email: formData.admin_email,
        admin_name: formData.admin_name,
        admin_phone: formData.admin_phone,
        admin_role: formData.admin_role,
      });
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await verifyHospitalRegistrationOtp({
        admin_email: formData.admin_email,
        otp: formData.otp,
      });
      setRegistrationId(res.registrationId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Mã OTP không đúng");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      await submitHospitalRegistration(registrationId, {
        ...formData,
        city_id: Number(formData.city_id) || undefined,
        founded_year: Number(formData.founded_year) || 2000,
        doctor_count: Number(formData.doctor_count) || 1,
      });
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("register-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const renderStepper = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((s, idx) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= s + 1
                ? "bg-green-500 text-white"
                : step === s
                  ? "bg-[#48a1f3] text-white"
                  : "bg-gray-100 text-gray-400"
                } transition-colors duration-300`}
            >
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
          </div>
          {idx < 3 && (
            <div
              className={`w-8 sm:w-12 h-1 mx-1 rounded-full ${step > s ? "bg-green-500" : "bg-gray-100"
                } transition-colors duration-300`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">

      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#eef6fd] to-white pt-24 pb-20 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Dành cho Đối tác Y tế
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
                Giải pháp <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-[#3da3f5]">Chuyển đổi số</span><br />
                Cho Cơ sở Y tế
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                Tham gia mạng lưới y tế thông minh cùng STL Clinic. Tối ưu hoá quy trình quản lý, tăng cường trải nghiệm bệnh nhân và mở rộng phạm vi tiếp cận dễ dàng.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={scrollToForm}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-[#3da3f5] text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  Đăng ký Đối tác Ngay <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white text-gray-700 rounded-full font-bold shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-100">
                  <PlayCircle className="w-5 h-5 text-blue-600" /> Xem Demo
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-indigo-100 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop"
                alt="Hospital Dashboard"
                className="rounded-3xl shadow-2xl object-cover h-[500px] w-full"
              />
              {/* Floating Cards */}
              <div className="absolute top-10 -left-10 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold">Bệnh nhân mới</p>
                  <p className="text-lg font-bold text-gray-900">+1,200/tháng</p>
                </div>
              </div>
              <div className="absolute bottom-10 -right-10 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold">Lịch hẹn hoàn thành</p>
                  <p className="text-lg font-bold text-gray-900">98.5%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS SECTION - REDESIGNED (BRAND COLORS) */}
      <section className="py-28 relative overflow-hidden bg-[#f8fbff]">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-[#48a1f3]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-[#f99b1c]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-[#143250] mb-6 tracking-tight">
              Vì sao chọn hợp tác cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48a1f3] to-[#3da3f5]">STL Clinic</span>?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Hệ sinh thái y tế toàn diện giúp cơ sở của bạn nâng tầm dịch vụ, bứt phá doanh thu và tối ưu hoá mọi quy trình vận hành.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Calendar,
                gradient: "from-[#48a1f3] to-[#3da3f5]",
                shadow: "shadow-[#48a1f3]/40",
                bgHover: "bg-[#ebf5ff]",
                tiltClass: "group-hover:rotate-6", // Nghiêng phải
                title: "Quản lý lịch hẹn thông minh",
                desc: "Hệ thống AI tự động phân bổ lịch hẹn, giảm thiểu tối đa thời gian trống và tối ưu hoá công suất phòng khám."
              },
              {
                icon: Activity,
                gradient: "from-[#f99b1c] to-[#fbc374]",
                shadow: "shadow-[#f99b1c]/40",
                bgHover: "bg-[#fff7ed]",
                tiltClass: "group-hover:-rotate-6", // Nghiêng trái cho khác biệt
                title: "Hồ sơ bệnh án điện tử (EMR)",
                desc: "Lưu trữ không giới hạn, truy xuất bệnh án chỉ trong 1 giây. Dữ liệu đồng bộ realtime và an toàn tuyệt đối."
              },
              {
                icon: Shield,
                gradient: "from-[#143250] to-[#2a5582]",
                shadow: "shadow-[#143250]/40",
                bgHover: "bg-[#f1f5f9]",
                tiltClass: "group-hover:rotate-12", // Bảo mật cho nghiêng mạnh hơn chút nhìn rất cá tính
                title: "Bảo mật chuẩn Y tế Quốc tế",
                desc: "Mã hoá dữ liệu đầu cuối (End-to-End Encryption) đạt chuẩn HIPAA, bảo vệ thông tin bệnh nhân tối đa."
              }
            ].map((benefit, i) => (
              <div key={i} className="group relative rounded-[2.5rem] bg-white p-8 md:p-10 transition-all duration-500 overflow-hidden transform hover:-translate-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col items-center text-center z-10">

                {/* Background color shift on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 ${benefit.bgHover}`}></div>

                {/* Floating Icon Container mang hiệu ứng nghiêng */}
                <div className={`relative mb-8 transform ${benefit.tiltClass} group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 ease-out`}>
                  {/* Lớp bóng mờ phía sau cũng chuyển động theo */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 rounded-full`}></div>

                  {/* Khung Icon chính */}
                  <div className={`relative w-20 h-20 rounded-[1.8rem] bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-xl ${benefit.shadow}`}>
                    <benefit.icon className="w-10 h-10 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-[#143250] mb-4 transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Quy trình hợp tác 4 bước</h2>
            <p className="text-gray-500">Đơn giản, minh bạch và nhanh chóng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Đăng ký thông tin", desc: "Điền đầy đủ thông tin vào form đăng ký bên dưới." },
              { step: "02", title: "Xét duyệt hồ sơ", desc: "Ban quản trị sẽ kiểm tra tính hợp lệ trong vòng 24h." },
              { step: "03", title: "Ký kết hợp đồng", desc: "Hai bên thống nhất các điều khoản và ký hợp đồng điện tử." },
              { step: "04", title: "Triển khai hệ thống", desc: "Nhận tài khoản quản trị và bắt đầu tiếp nhận bệnh nhân." }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                {idx < 3 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200"></div>}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white shadow-md border-4 border-gray-50 flex items-center justify-center text-xl font-black text-[#48a1f3] mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 px-4">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. REGISTRATION FORM SECTION */}
      <section id="register-form" className="py-20 bg-[#e8f2fc]">
        <div className="max-w-6xl w-full mx-auto px-4 md:px-8">

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#143250] mb-4">Đăng ký trở thành Đối tác</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vui lòng cung cấp chính xác các thông tin pháp lý của cơ sở y tế để chúng tôi có thể hỗ trợ bạn tốt nhất.
            </p>
          </div>

          {/* Outer Container for Form Layout */}
          <div className="bg-[#48a1f3] p-4 md:p-5 rounded-[2rem] flex flex-col lg:flex-row shadow-2xl">

            {/* Left Information Panel */}
            <div className="bg-[#3f9df0] rounded-[1.5rem] p-8 md:p-10 relative overflow-hidden shadow-[inset_0px_0px_20px_rgba(0,0,0,0.1)] border border-[#52abf8] w-full lg:w-[40%] flex flex-col justify-center mb-4 lg:mb-0">
              <div className="absolute -bottom-16 -left-16 w-48 h-48 border-[20px] border-white/20 rounded-full"></div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 border-[10px] border-white/10 rounded-full"></div>

              <h3 className="text-2xl font-bold text-white text-center mb-10 relative z-10">
                Thông tin hỗ trợ
              </h3>

              <div className="space-y-8 relative z-10 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <Phone className="text-[#3f9df0] w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Hotline Hỗ trợ Đối tác</p>
                    <p className="text-white/90">0867 773 047</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <MapPin className="text-[#3f9df0] w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Trụ sở STL Clinic</p>
                    <p className="text-white/90 leading-relaxed text-sm">
                      33 Xô Viết Nghệ Tĩnh, Hòa Cường, Hải Châu, Đà Nẵng 550000
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <Clock className="text-[#3f9df0] w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Thời gian làm việc</p>
                    <p className="text-white/90">Thứ 2 - Thứ 6: 08:00 - 17:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <Mail className="text-[#3f9df0] w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Email Liên hệ</p>
                    <p className="text-white/90">partner@stlclinic.vn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Multi-Step Form Panel */}
            <div className="bg-white rounded-[1.5rem] p-6 md:p-10 w-full lg:w-[60%] lg:ml-4 shadow-lg flex flex-col">

              {/* Stepper Header (Only show during steps 1 to 4) */}
              {step > 0 && step < 5 && renderStepper()}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* FORM RENDER BASED ON STEP */}
              <div className="flex-1 transition-all duration-500">

                {/* STEP -1: Start Button */}
                {step === -1 && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[350px] animate-in fade-in zoom-in duration-500 text-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                      <Building2 className="w-12 h-12 text-[#48a1f3]" />
                    </div>
                    <h3 className="text-3xl font-black text-[#143250] mb-3">Tham gia mạng lưới y tế</h3>
                    <p className="text-gray-500 mb-8 max-w-sm">Chuẩn bị thông tin pháp lý của cơ sở và nhấn bắt đầu để tiến hành đăng ký.</p>
                    <button
                      onClick={() => setStep(0)}
                      className="px-10 py-4 bg-gradient-to-r from-[#48a1f3] to-[#3da3f5] text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-2 text-lg"
                    >
                      Bắt đầu Đăng ký <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* STEP 0: Init Contact Info */}
                {step === 0 && (
                  <form onSubmit={handleInit} className="space-y-5 animate-slideUpFade">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-[#143250]">Người đại diện</h3>
                      <p className="text-gray-500 text-sm mt-1">Cung cấp email để nhận mã xác thực đăng ký</p>
                    </div>

                    <div>
                      <label className="block text-[14px] font-bold text-gray-700 mb-1.5">
                        Email Quản lý / Đại diện <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="admin_email"
                        required
                        value={formData.admin_email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-1 focus:ring-[#48a1f3] outline-none transition-colors bg-[#fbfbfb] focus:bg-white"
                        placeholder="manager@hospital.com"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Họ và tên</label>
                        <input
                          type="text"
                          name="admin_name"
                          required
                          value={formData.admin_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-1 focus:ring-[#48a1f3] outline-none transition-colors bg-[#fbfbfb] focus:bg-white"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div>
                        <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Số điện thoại</label>
                        <input
                          type="tel"
                          name="admin_phone"
                          required
                          value={formData.admin_phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-1 focus:ring-[#48a1f3] outline-none transition-colors bg-[#fbfbfb] focus:bg-white"
                          placeholder="0987654321"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#f99b1c] hover:bg-[#e88d15] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 uppercase text-sm tracking-wide disabled:opacity-70"
                      >
                        {loading ? "Đang xử lý..." : "Nhận Mã OTP Bắt đầu"} <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 1: OTP */}
                {step === 1 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fadeIn text-center">
                    <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-[#143250]">Xác thực Email</h3>
                    <p className="text-gray-500 text-sm">
                      Mã OTP 6 số đã được gửi đến <b>{formData.admin_email}</b>. Vui lòng kiểm tra hộp thư.
                    </p>

                    <div className="max-w-xs mx-auto mt-6">
                      <input
                        type="text"
                        name="otp"
                        required
                        maxLength={6}
                        value={formData.otp}
                        onChange={handleChange}
                        className="w-full px-4 py-4 text-center text-3xl tracking-[0.5em] rounded-xl border-2 border-gray-200 focus:border-[#48a1f3] outline-none font-bold text-gray-700 bg-[#fbfbfb] focus:bg-white"
                        placeholder="------"
                      />
                    </div>

                    <div className="flex gap-4 pt-6 justify-center">
                      <button type="button" onClick={() => setStep(0)} className="px-6 py-3 rounded-full font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                        Sửa Email
                      </button>
                      <button type="submit" disabled={loading} className="px-8 py-3 bg-[#48a1f3] text-white rounded-full font-bold hover:bg-[#3b8fd9] transition-colors shadow-md disabled:opacity-70">
                        {loading ? "Đang xác thực..." : "Xác thực OTP"}
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2: Basic Info */}
                {step === 2 && (
                  <div className="space-y-5 animate-fadeIn">
                    <h3 className="text-xl font-bold text-[#143250] mb-6 flex items-center gap-2">
                      <Building2 className="text-[#48a1f3] w-6 h-6" /> Thông tin cơ sở y tế
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Tên Bệnh viện / Phòng khám <span className="text-red-500">*</span></label>
                        <input type="text" name="hospital_name" value={formData.hospital_name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] outline-none bg-[#fbfbfb]" placeholder="Nhập tên cơ sở y tế..." />
                      </div>

                      <div>
                        <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Loại hình</label>
                        <select name="hospital_type" value={formData.hospital_type} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#48a1f3] outline-none bg-[#fbfbfb] appearance-none">
                          <option value="Phòng khám">Phòng khám đa/chuyên khoa</option>
                          <option value="Bệnh viện tư">Bệnh viện tư nhân</option>
                          <option value="Bệnh viện công">Bệnh viện công lập</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Số ĐKKD / Mã số thuế <span className="text-red-500">*</span></label>
                        <input type="text" name="business_license_number" value={formData.business_license_number} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] outline-none bg-[#fbfbfb]" />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                        <select name="city_id" value={formData.city_id} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#48a1f3] outline-none bg-[#fbfbfb] appearance-none">
                          <option value="">Chọn Tỉnh/Thành phố</option>
                          {cities.map((city) => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] outline-none bg-[#fbfbfb]" placeholder="Số nhà, đường, phường, quận..." />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Chuyên khoa khám <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input
                            type="text"
                            value={specialtySearch}
                            onChange={(e) => {
                              setSpecialtySearch(e.target.value);
                              setShowSpecialtyDropdown(true);
                            }}
                            onFocus={() => setShowSpecialtyDropdown(true)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] outline-none bg-[#fbfbfb]"
                            placeholder="Tìm kiếm chuyên khoa (VD: Nhi khoa, Nội tổng quát...)"
                          />
                          {showSpecialtyDropdown && specialtySearch && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                              {categories
                                .filter(c => c.name.toLowerCase().includes(specialtySearch.toLowerCase()) && !formData.specialties.includes(c.id.toString()))
                                .map(c => (
                                  <div
                                    key={c.id}
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, specialties: [...prev.specialties, c.id.toString()] }));
                                      setSpecialtySearch("");
                                      setShowSpecialtyDropdown(false);
                                    }}
                                  >
                                    {c.name}
                                  </div>
                                ))}
                                {categories.filter(c => c.name.toLowerCase().includes(specialtySearch.toLowerCase()) && !formData.specialties.includes(c.id.toString())).length === 0 && (
                                  <div className="px-4 py-2 text-gray-400 text-sm">Không tìm thấy chuyên khoa phù hợp</div>
                                )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.specialties.map(specId => {
                            const category = categories.find(c => c.id.toString() === specId);
                            if (!category) return null;
                            return (
                              <div key={specId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                {category.name}
                                <button type="button" onClick={() => {
                                  setFormData(prev => ({ ...prev, specialties: prev.specialties.filter(id => id !== specId) }));
                                }} className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Hotline phòng khám <span className="text-red-500">*</span></label>
                        <input type="tel" name="hotline" value={formData.hotline} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] outline-none bg-[#fbfbfb]" />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 mt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          if (!formData.hospital_name || !formData.address || !formData.business_license_number || !formData.hotline || !formData.city_id || formData.specialties.length === 0) {
                            setError("Vui lòng điền đủ các trường bắt buộc (*)");
                            return;
                          }
                          setError("");
                          setStep(3);
                        }}
                        className="px-6 py-2.5 bg-[#48a1f3] text-white rounded-full font-bold flex items-center gap-2 hover:bg-[#3b8fd9] transition-colors"
                      >
                        Tiếp tục <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Docs */}
                {step === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-xl font-bold text-[#143250] mb-2 flex items-center gap-2">
                      <FileCheck className="text-[#48a1f3] w-6 h-6" /> Giấy tờ pháp lý
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
                      Vui lòng tải lên ảnh chụp bản gốc hoặc bản sao y công chứng (JPG/PNG).
                    </p>

                    <div className="space-y-5">
                      <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#48a1f3] transition-colors bg-gray-50">
                        <UploadCloud className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <label className="block font-bold text-gray-700 mb-1 cursor-pointer">
                          Giấy phép hoạt động (Sở Y tế) <span className="text-red-500">*</span>
                          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileUpload(e, "operating_license_url")} className="hidden" />
                        </label>
                        <p className="text-xs text-gray-400">Click để chọn file</p>
                        {formData.operating_license_url && <p className="mt-2 text-sm text-green-600 font-medium">✓ Đã tải lên thành công</p>}
                      </div>

                      <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#48a1f3] transition-colors bg-gray-50">
                        <UploadCloud className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <label className="block font-bold text-gray-700 mb-1 cursor-pointer">
                          Giấy phép đăng ký kinh doanh <span className="text-red-500">*</span>
                          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileUpload(e, "business_license_url")} className="hidden" />
                        </label>
                        <p className="text-xs text-gray-400">Click để chọn file</p>
                        {formData.business_license_url && <p className="mt-2 text-sm text-green-600 font-medium">✓ Đã tải lên thành công</p>}
                      </div>
                    </div>

                    <div className="flex justify-between pt-6 mt-4 border-t border-gray-100">
                      <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                        Quay lại
                      </button>
                      <button
                        disabled={loading}
                        onClick={() => {
                          if (!formData.operating_license_url || !formData.business_license_url) {
                            setError("Vui lòng tải lên đầy đủ các giấy tờ bắt buộc");
                            return;
                          }
                          setError("");
                          setStep(4);
                        }}
                        className="px-6 py-2.5 bg-[#48a1f3] text-white rounded-full font-bold flex items-center gap-2 hover:bg-[#3b8fd9] transition-colors"
                      >
                        {loading ? "Đang tải..." : "Tiếp tục"} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Confirm */}
                {step === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-xl font-bold text-[#143250] mb-2 flex items-center gap-2">
                      <ShieldCheck className="text-[#48a1f3] w-6 h-6" /> Hoàn tất & Cam kết
                    </h3>

                    <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-[14px] text-[#143250] leading-relaxed">
                      <p className="font-bold mb-2">Quy trình sau khi gửi hồ sơ:</p>
                      <ul className="list-decimal pl-5 space-y-1.5 text-gray-600">
                        <li>Hồ sơ của bạn sẽ được ban quản trị xét duyệt trong vòng 24 - 48h làm việc.</li>
                        <li>Kết quả duyệt và thông tin tài khoản quản trị sẽ được gửi qua email <b>{formData.admin_email}</b>.</li>
                        <li>Đội ngũ CSKH sẽ liên hệ với bạn qua SĐT <b>{formData.admin_phone}</b> để hỗ trợ vận hành.</li>
                      </ul>
                    </div>

                    <div className="space-y-3 mt-6">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input type="checkbox" className="peer w-5 h-5 opacity-0 absolute cursor-pointer" required />
                          <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-[#48a1f3] peer-checked:border-[#48a1f3] transition-all"></div>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-[14px] text-gray-700 group-hover:text-gray-900 transition-colors">
                          Tôi cam kết các thông tin và giấy tờ cung cấp là hoàn toàn chính xác và hợp pháp theo pháp luật Việt Nam.
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input type="checkbox" className="peer w-5 h-5 opacity-0 absolute cursor-pointer" required id="chk2" />
                          <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-[#48a1f3] peer-checked:border-[#48a1f3] transition-all"></div>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-[14px] text-gray-700 group-hover:text-gray-900 transition-colors">
                          Tôi đồng ý với các <b>Điều khoản sử dụng</b> & <b>Chính sách bảo mật</b> của STL Clinic dành cho Đối tác.
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-between pt-6 mt-4 border-t border-gray-100">
                      <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                        Quay lại
                      </button>
                      <button
                        onClick={() => {
                          if (!document.getElementById('chk2').checked) {
                            setError("Vui lòng đồng ý với các cam kết trước khi gửi hồ sơ.");
                            return;
                          }
                          handleSubmit();
                        }}
                        disabled={loading}
                        className="px-8 py-3 bg-[#f99b1c] text-white rounded-full font-bold shadow-md hover:bg-[#e88d15] hover:shadow-lg transition-all disabled:opacity-70 transform hover:-translate-y-0.5"
                      >
                        {loading ? "Đang xử lý..." : "Gửi Đăng ký Hồ sơ"}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: Success */}
                {step === 5 && (
                  <div className="text-center py-10 animate-fadeIn">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#143250] mb-4">
                      Đăng ký thành công!
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
                      Cảm ơn bạn đã đăng ký đối tác cùng STL Clinic. Hồ sơ của cơ sở y tế đang được ban quản trị xét duyệt.
                      <br /><br />
                      Mọi thông báo sẽ được gửi qua email. Vui lòng theo dõi hộp thư đến.
                    </p>
                    <button
                      onClick={() => navigate(PAGES.WELCOME)}
                      className="px-8 py-3 bg-gray-100 text-gray-800 rounded-full font-bold hover:bg-gray-200 transition-colors"
                    >
                      Trở về Trang chủ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER - simple spacer if needed */}
      <div className="h-10 bg-[#e8f2fc]"></div>
      {/* Custom Styles for Animation */}
      <style jsx>{`
        @keyframes slideUpFade {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideUpFade {
          animation: slideUpFade 4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
