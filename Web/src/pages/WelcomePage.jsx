import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Calendar,
  MessageCircle,
  Users,
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { PAGES } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../services/appointments.api";
import { getTopRatedDoctors } from "../services/admin.doctors.api";
import { getCategories } from "../services/admin.categories.api";
import { getActiveHospitalBanners } from "../services/admin.hospital.banner.api";
import { getPopularServicePackages } from "../services/service-packages.api";
import { getCategoryIcon } from "../utils/helpers";
const DEFAULT_APPOINTMENT_FORM = Object.freeze({
  user_id: "",
  doctor_id: "",
  hospital_id: "",
  schedule_id: "",
  appointment_date: "",
  appointment_time: "",
  examination_type: "online",
  symptoms: "",
});

const WelcomePage = ({ navigate }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({ ...DEFAULT_APPOINTMENT_FORM });
  const [listLoading, setListLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [banners, setBanners] = useState([]);
  const [popularPackages, setPopularPackages] = useState([]);
  const packagesScrollRef = useRef(null);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [singleBannerIdx, setSingleBannerIdx] = useState(0);
  const featuresRef = useRef(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  // Auto-play for single banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setSingleBannerIdx((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Scroll reveal observer for features
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Đặt lịch Online",
      description: "Đặt lịch khám bệnh nhanh chóng, tiện lợi 24/7",
      color: "blue",
    },
    {
      icon: Users,
      title: "Đội ngũ Bác sĩ",
      description: "Bác sĩ giàu kinh nghiệm, tận tâm chuyên nghiệp",
      color: "green",
    },
    {
      icon: Shield,
      title: "An toàn - Bảo mật",
      description: "Thông tin bệnh nhân được bảo mật tuyệt đối",
      color: "purple",
    },
    {
      icon: MessageCircle,
      title: "Tư vấn Online",
      description: "Tư vấn sức khỏe từ xa qua video call",
      color: "orange",
    },
  ];

  const stats = [
    { number: "50K+", label: "Bệnh nhân tin tưởng" },
    { number: "100+", label: "Bác sĩ chuyên khoa" },
    { number: "20+", label: "Chuyên khoa" },
    { number: "4.8/5", label: "Đánh giá trung bình" },
  ];

  // Helper: yêu cầu đăng nhập trước khi dùng các dịch vụ
  const requireAuthAndNavigate = (page, options) => {
    if (!isAuthenticated) {
      // Có thể điều hướng sang LOGIN hoặc REGISTER, ở đây ưu tiên LOGIN
      navigate(PAGES.LOGIN);
    } else {
      navigate(page, options);
    }
  };

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert((current) => {
        if (current?.message === message) {
          return null;
        }
        return current;
      });
    }, 4000);
  }, []);

  const fetchAppointments = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert("error", error.message || "Đã xảy ra lỗi không xác định");
    } finally {
      setListLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {

    const loadData = async () => {
      try {
        const [docs, cats, bannerData, packagesData] = await Promise.all([
          getTopRatedDoctors(),
          getCategories(),
          getActiveHospitalBanners(),
          getPopularServicePackages()
        ]);
        setDoctorsList(Array.isArray(docs) ? docs : []);
        setCategoriesList(Array.isArray(cats) ? cats : []);
        setBanners(bannerData || []);
        setPopularPackages(Array.isArray(packagesData) ? packagesData : []);
      } catch (err) {
        console.error("Error loading welcome data:", err);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ ...DEFAULT_APPOINTMENT_FORM });
  };

  const formatDateForInput = (value) => {
    if (!value) return "";
    if (typeof value === "string" && value.length === 10) {
      return value;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const formatTimeForInput = (value) => {
    if (!value) return "";
    if (typeof value === "string" && value.length === 5) {
      return value;
    }
    return value?.split(":").slice(0, 2).join(":") ?? "";
  };

  const scrollPackages = (direction) => {
    if (packagesScrollRef.current) {
      const scrollAmount = direction === "left" ? -800 : 800;
      packagesScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const displayDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString("vi-VN");
  };

  const displayTime = (value) => {
    if (!value) return "—";
    return value.split(":").slice(0, 2).join(":");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const requiredFields = [
      "user_id",
      "doctor_id",
      "hospital_id",
      "schedule_id",
      "appointment_date",
      "appointment_time",
      "examination_type",
    ];
    const labels = {
      user_id: "ID bệnh nhân",
      doctor_id: "ID bác sĩ",
      hospital_id: "ID bệnh viện",
      schedule_id: "ID lịch làm việc",
      appointment_date: "Ngày khám",
      appointment_time: "Giờ khám",
      examination_type: "Hình thức khám",
    };
    const missingField = requiredFields.find((field) => !formData[field]);
    if (missingField) {
      showAlert("error", `Vui lòng nhập ${labels[missingField]}`);
      return;
    }

    const payload = {
      user_id: Number(formData.user_id),
      doctor_id: Number(formData.doctor_id),
      hospital_id: Number(formData.hospital_id),
      schedule_id: Number(formData.schedule_id),
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      examination_type: formData.examination_type,
    };

    if (formData.symptoms) {
      payload.symptoms = formData.symptoms;
    }

    setFormLoading(true);
    try {
      if (editingId) {
        await updateAppointment(editingId, payload);
      } else {
        await createAppointment(payload);
      }
      showAlert(
        "success",
        editingId ? "Cập nhật lịch hẹn thành công" : "Tạo lịch hẹn thành công"
      );
      resetForm();
      await fetchAppointments();
    } catch (error) {
      showAlert("error", error.message || "Đã xảy ra lỗi không xác định");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
    setFormData({
      user_id: String(appointment.user_id ?? ""),
      doctor_id: String(appointment.doctor_id ?? ""),
      hospital_id: String(appointment.hospital_id ?? ""),
      schedule_id: String(appointment.schedule_id ?? ""),
      appointment_date: formatDateForInput(appointment.appointment_date),
      appointment_time: formatTimeForInput(appointment.appointment_time),
      examination_type: appointment.examination_type ?? "online",
      symptoms: appointment.symptoms ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa lịch hẹn này?")) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteAppointment(id);
      showAlert("success", "Đã xóa lịch hẹn");
      await fetchAppointments();
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      showAlert("error", error.message || "Đã xảy ra lỗi không xác định");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Global Header is rendered outside in AppRoutes */}

      {/* Hero Section - Redesigned */}
      <section className="relative overflow-hidden pt-2 pb-24 lg:pt-4 lg:pb-32 bg-[#f8fbff]">
        {/* Background Decorative Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-gradient-to-br from-[#48a1f3]/20 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#f99b1c]/20 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-10">
              {/* <div className="inline-flex items-center gap-3 bg-white border border-[#48a1f3]/20 text-[#143250] px-5 py-2.5 rounded-full text-sm font-bold shadow-sm shadow-[#48a1f3]/10">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#48a1f3] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#48a1f3]"></span>
                </span>
                Nền tảng Y tế Số #1 Việt Nam
              </div> */}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#143250] leading-[1.15] tracking-tight">
                Chăm sóc sức khoẻ <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48a1f3] to-[#f99b1c]">
                  Chủ động & Dễ dàng
                </span>
              </h1>

              <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
                Kết nối với hàng trăm bác sĩ chuyên khoa hàng đầu. Đặt lịch khám chỉ với 30 giây, mọi lúc mọi nơi.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <button
                  onClick={() => requireAuthAndNavigate(PAGES.BOOKING)}
                  className="px-8 py-4 bg-gradient-to-r from-[#48a1f3] to-[#3da3f5] text-white rounded-full font-bold shadow-lg shadow-[#48a1f3]/40 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <Calendar className="w-6 h-6" /> Đặt lịch khám ngay
                </button>
                {!isAuthenticated && (
                  <button
                    onClick={() => navigate(PAGES.LOGIN)}
                    className="px-8 py-4 bg-white text-[#143250] rounded-full font-bold shadow-md hover:bg-gray-50 border border-gray-100 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    Đăng nhập / Đăng ký
                  </button>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-200/60">
                {stats.map((stat, index) => (
                  <div key={index} className="flex flex-col gap-1 text-center sm:text-left">
                    <div className="text-3xl font-black text-[#143250]">
                      {stat.number}
                    </div>
                    <div className="text-sm font-bold text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="relative lg:h-[600px] flex items-center justify-center mt-10 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#48a1f3]/20 to-[#f99b1c]/10 rounded-full blur-3xl transform rotate-12 -z-10"></div>

              {/* Main Image Masking */}
              <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[90%] max-w-md mx-auto z-10">
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80"
                  alt="Doctor"
                  className="w-full h-full object-cover rounded-[3rem] shadow-2xl border-8 border-white"
                />

                {/* Floating Cards */}
                <div className="absolute -left-4 sm:-left-12 top-20 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-green-500" />
                    </div>
                    <div>
                      <div className="font-bold text-[#143250] sm:text-lg">An toàn</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-500">
                        100% bảo mật
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 sm:-right-12 bottom-20 sm:bottom-32 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#48a1f3]/20 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-[#48a1f3]" />
                    </div>
                    <div>
                      <div className="font-bold text-[#143250] sm:text-lg">Nhanh chóng</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-500">Chỉ 30 giây</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={featuresRef}>
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-[#143250] mb-6 tracking-tight">
              Tại sao chọn <span className="text-[#48a1f3]">STL Clinic</span>?
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm y tế trực tuyến tiện lợi, an toàn và chuyên nghiệp nhất.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 overflow-hidden px-2 py-4 -mx-2">
            {features.map((feature, index) => {
              const isLeft = index < 2;
              return (
                <div
                  key={index}
                  className={`group relative bg-white rounded-[2rem] p-8 text-center cursor-pointer border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transform hover:-translate-y-2 transition-all duration-700 ease-out ${featuresVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 " + (isLeft ? "-translate-x-24" : "translate-x-24")
                    }`}
                  style={{ transitionDelay: featuresVisible ? `${index * 150}ms` : '0ms' }}
                  onClick={() => {
                    if (feature.title === "Đặt lịch Online") {
                      requireAuthAndNavigate(PAGES.BOOKING);
                    } else if (feature.title === "Tư vấn Online" || feature.title === "Tư vấn trực tuyến") {
                      requireAuthAndNavigate(PAGES.CHAT);
                    } else if (feature.title === "Đội ngũ Bác sĩ") {
                      navigate(PAGES.DOCTORS);
                    }
                  }}
                >
                  {/* Background color shift */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-50/0 to-gray-50/100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className={`w-20 h-20 mx-auto bg-${feature.color}-50 rounded-[1.5rem] flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                      <feature.icon className={`w-10 h-10 text-${feature.color}-500`} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#143250] mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section >

      {/* Banner Carousel Section - Redesigned */}
      {
        banners.length > 0 && (
          <section className="pt-20 pb-24 bg-white relative overflow-hidden border-t border-gray-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black text-[#143250] mb-4 tracking-tight">
                    Chương trình <span className="text-[#f99b1c]">Nổi bật</span>
                  </h2>
                  <p className="text-xl text-gray-500 max-w-2xl">Những ưu đãi và sự kiện mới nhất từ hệ thống STL Clinic</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentBannerIdx(Math.max(0, currentBannerIdx - 1))}
                    disabled={currentBannerIdx === 0}
                    className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-[#48a1f3] hover:border-[#48a1f3] hover:bg-blue-50 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentBannerIdx(Math.min(Math.max(0, banners.length - 3), currentBannerIdx + 1))}
                    disabled={currentBannerIdx >= Math.max(0, banners.length - 3)}
                    className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-[#48a1f3] hover:border-[#48a1f3] hover:bg-blue-50 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all shadow-sm"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="overflow-hidden -mx-4 px-4 py-4">
                <div
                  className="flex transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${currentBannerIdx * (100 / 3)}%)` }}
                >
                  {banners.map((banner) => (
                    <div
                      key={banner.id}
                      className="w-full md:w-1/3 shrink-0 px-4 group cursor-pointer"
                      onClick={() => {
                        if (banner.doctor_id) requireAuthAndNavigate(PAGES.BOOK_DOCTOR, { state: { doctorId: banner.doctor_id } });
                        else if (banner.hospital_id) navigate(`/fanpage/${banner.hospital_id}`);
                        else if (banner.redirect_url) window.open(banner.redirect_url, "_blank");
                      }}
                    >
                      <div className="relative rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-500 h-[260px] transform hover:-translate-y-2">
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#143250]/90 via-[#143250]/40 to-transparent flex flex-col justify-end p-6">
                          <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#48a1f3] to-[#3da3f5] text-white text-xs font-bold uppercase tracking-wider rounded-lg w-max mb-3 shadow-md shadow-[#48a1f3]/30">
                            Nổi bật
                          </span>
                          <h3 className="text-white font-bold text-xl mb-2 leading-tight group-hover:text-[#48a1f3] transition-colors">{banner.title}</h3>
                          {banner.description && <p className="text-gray-200 text-sm line-clamp-2 opacity-90">{banner.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {banners.length > 3 && (
                <div className="flex justify-center mt-10 gap-2">
                  {Array.from({ length: Math.max(1, banners.length - 2) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIdx(idx)}
                      className={`h-2.5 rounded-full transition-all duration-500 ${currentBannerIdx === idx ? "w-8 bg-[#48a1f3]" : "w-2.5 bg-gray-200 hover:bg-gray-300"
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )
      }

      {/* Doctors Section - Redesigned */}
      <section id="doctors" className="py-24 bg-[#f8fbff] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-[#143250] mb-4 tracking-tight">
                Đội ngũ Bác sĩ <span className="text-[#48a1f3]">Hàng đầu</span>
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl">
                Các chuyên gia y tế giàu kinh nghiệm, tận tâm với nghề, luôn sẵn sàng chăm sóc sức khoẻ của bạn.
              </p>
            </div>
            <button
              onClick={() => navigate(PAGES.DOCTORS)}
              className="px-6 py-3 bg-white text-[#143250] border border-gray-200 rounded-full font-bold shadow-sm hover:shadow-md hover:bg-gray-50 hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              Xem tất cả <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctorsList.slice(0, 6).map((doctor) => (
              <div key={doctor.id} className="group relative bg-white rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-b from-[#48a1f3]/0 to-[#48a1f3]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"></div>
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-[#48a1f3] to-[#3da3f5] p-1 flex-shrink-0 shadow-lg shadow-[#48a1f3]/30 overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full bg-white rounded-[1.3rem] overflow-hidden">
                      {doctor.avatar_url ? (
                        <img src={doctor.avatar_url} alt={doctor.user?.full_name || doctor.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-50">👨‍⚕️</div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-bold text-[#143250] mb-1 line-clamp-2">
                      {doctor.user?.full_name || doctor.name}
                    </h3>
                    <p className="text-[#f99b1c] font-semibold text-sm mb-3">
                      {doctor.specialty || doctor.category?.name || "Đa khoa"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium bg-gray-50 w-fit px-3 py-1.5 rounded-lg">
                      <span className="flex items-center gap-1 text-yellow-500">
                        ⭐ {Number(doctor.rating || 5).toFixed(1)}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{doctor.experience || 5} năm KN</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => requireAuthAndNavigate(PAGES.BOOK_DOCTOR, { state: { doctorId: doctor.id } })}
                  className="mt-6 w-full py-3.5 bg-gray-50 text-[#143250] group-hover:bg-[#48a1f3] group-hover:text-white rounded-xl font-bold transition-colors duration-300 relative z-10 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" /> Đặt lịch khám
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Packages Section - Redesigned */}
      {
        popularPackages.length > 0 && (
          <section className="py-24 bg-white relative overflow-hidden border-t border-gray-100">
            <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#f99b1c]/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-black text-[#143250] mb-4 tracking-tight">
                  Gói dịch vụ <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f99b1c] to-[#fbc374]">Nổi bật</span>
                </h2>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                  Các gói khám sức khỏe toàn diện được lựa chọn nhiều nhất
                </p>
              </div>

              <div className="relative group/slider">
                {popularPackages.length > 3 && (
                  <button
                    onClick={() => scrollPackages('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-14 h-14 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#f99b1c] hover:border-[#f99b1c] hover:bg-orange-50 transition-all focus:outline-none"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                )}

                <div
                  ref={packagesScrollRef}
                  className="flex overflow-x-auto gap-8 pb-10 pt-4 px-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {popularPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="min-w-[340px] max-w-[380px] shrink-0 snap-start flex group cursor-pointer"
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <div className="flex flex-col w-full h-full bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transform group-hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                        {/* Decorative top border gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#48a1f3] to-[#f99b1c] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="flex justify-between items-start mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#48a1f3]/10 to-[#48a1f3]/5 rounded-2xl flex items-center justify-center text-[#48a1f3] group-hover:bg-[#48a1f3] group-hover:text-white transition-colors duration-500 shadow-inner">
                            <Shield className="w-8 h-8" />
                          </div>
                          <div className="bg-orange-50 text-[#f99b1c] border border-orange-100 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm">
                            🔥 {pkg.booking_count} lượt
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-[#143250] mb-3 line-clamp-2 group-hover:text-[#48a1f3] transition-colors">
                          {pkg.name}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-auto bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 font-medium">
                            <Clock className="w-5 h-5 text-[#48a1f3]" />
                            <span>{pkg.duration_minutes || 30} phút</span>
                          </div>
                          {pkg.fixed_price && (
                            <div className="flex items-center gap-1 font-bold text-[#f99b1c] ml-auto text-lg">
                              {Number(pkg.fixed_price).toLocaleString("vi-VN")}đ
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {popularPackages.length > 3 && (
                  <button
                    onClick={() => scrollPackages('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-14 h-14 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#f99b1c] hover:border-[#f99b1c] hover:bg-orange-50 transition-all focus:outline-none"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                )}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => navigate(PAGES.SERVICE_PACKAGES)}
                  className="inline-flex items-center gap-2 font-bold text-[#48a1f3] hover:text-[#143250] transition-colors group"
                >
                  Xem tất cả dịch vụ <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>
        )
      }

      {/* Single Banner Auto-play Section - Redesigned */}
      {
        banners.length > 0 && (
          <section className="py-16 bg-[#f8fbff] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div
                className="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_rgba(72,161,243,0.15)] h-[250px] md:h-[350px] group cursor-pointer border-4 border-white"
                onClick={() => {
                  const banner = banners[singleBannerIdx];
                  if (!banner) return;
                  if (banner.doctor_id) requireAuthAndNavigate(PAGES.BOOK_DOCTOR, { state: { doctorId: banner.doctor_id } });
                  else if (banner.hospital_id) navigate(`/fanpage/${banner.hospital_id}`);
                  else if (banner.redirect_url) window.open(banner.redirect_url, "_blank");
                }}
              >
                <div
                  className="flex h-full w-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${singleBannerIdx * 100}%)` }}
                >
                  {banners.map((banner, idx) => (
                    <div
                      key={banner.id}
                      className="w-full h-full shrink-0 relative"
                    >
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#143250]/90 via-[#143250]/40 to-transparent flex flex-col justify-center p-8 md:p-16">
                        <div className="max-w-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#f99b1c] to-[#fbc374] text-white text-xs font-black uppercase tracking-widest rounded-lg w-max mb-4 shadow-lg shadow-orange-500/30">
                            Sự kiện nổi bật
                          </span>
                          <h3 className="text-white font-black text-3xl md:text-5xl mb-4 leading-tight drop-shadow-md">{banner.title}</h3>
                          {banner.description && <p className="text-blue-50 text-sm md:text-lg max-w-xl opacity-90 drop-shadow line-clamp-2 md:line-clamp-3">{banner.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dots for single banner */}
                <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSingleBannerIdx(idx);
                      }}
                      className={`h-2.5 rounded-full transition-all duration-500 shadow-md ${singleBannerIdx === idx ? "w-10 bg-[#48a1f3]" : "w-2.5 bg-white/60 hover:bg-white"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      }

      {/* Specialties Section - Redesigned */}
      <section id="specialties" className="py-24 bg-white relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#48a1f3]/10 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-[#143250] mb-4 tracking-tight">
              Khám theo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48a1f3] to-[#f99b1c]">Chuyên khoa</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Đa dạng chuyên khoa đáp ứng mọi nhu cầu khám chữa bệnh của bạn và gia đình
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categoriesList.map((specialty) => (
              <div
                key={specialty.id}
                className="group relative bg-white rounded-3xl p-6 text-center cursor-pointer border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transform hover:-translate-y-2 transition-all duration-300"
                onClick={() => navigate(PAGES.DOCTORS, { state: { specialty: specialty.name } })}
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-[#48a1f3] group-hover:to-[#3da3f5] rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 shadow-inner group-hover:shadow-[#48a1f3]/40 overflow-hidden">
                  {specialty.image_url ? (
                    <img src={specialty.image_url} alt={specialty.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply group-hover:mix-blend-normal group-hover:brightness-0 group-hover:invert" />
                  ) : (
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-500 filter group-hover:brightness-0 group-hover:invert">
                      {getCategoryIcon(specialty.name)}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-[#143250] group-hover:text-[#48a1f3] transition-colors">
                  {specialty.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Redesigned */}
      {
        !isAuthenticated && (
          <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#143250]"></div>
            {/* Background Decorative blobs for CTA */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#48a1f3]/30 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#f99b1c]/20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                Sẵn sàng để <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48a1f3] to-[#f99b1c]">bắt đầu?</span>
              </h2>
              <p className="text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                Tạo tài khoản miễn phí ngay hôm nay để trải nghiệm dịch vụ y tế thông minh, tiện lợi và tiết kiệm thời gian nhất.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <button
                  onClick={() => navigate(PAGES.REGISTER)}
                  className="px-8 py-4 bg-gradient-to-r from-[#48a1f3] to-[#3da3f5] text-white rounded-full font-bold shadow-lg shadow-[#48a1f3]/40 hover:shadow-xl hover:-translate-y-1 transition-all text-lg"
                >
                  Đăng ký tài khoản miễn phí
                </button>
                <button
                  onClick={() => navigate(PAGES.LOGIN)}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold hover:bg-white/20 hover:-translate-y-1 transition-all text-lg"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </section>
        )
      }

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">STL Clinic</h3>
              <p className="text-gray-400 text-sm">
                Nền tảng đặt khám trực tuyến hàng đầu Việt Nam
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Về chúng tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Bác sĩ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Chuyên khoa
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Tin tức
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Câu hỏi thường gặp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Hướng dẫn đặt lịch
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Chính sách bảo mật
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Điều khoản sử dụng
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>1900-xxxx</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>support@stlclinic.com</span>
                </li>
                <li className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 mt-1" />
                  <span>123 Đường ABC, Q.1, TP.HCM</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 STL Clinic. All rights reserved.</p>
          </div>
        </div>
      </footer>



      {/* Package Details Popup Modal */}
      {
        selectedPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-[#143250]/40 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedPackage(null)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col animate-in fade-in zoom-in-95 duration-300">
              {/* Top decorative gradient */}
              <div className="h-2 bg-gradient-to-r from-[#48a1f3] to-[#f99b1c] w-full shrink-0"></div>

              <button
                onClick={() => setSelectedPackage(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 pb-4 flex items-start gap-5 shrink-0">
                <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-[#48a1f3]/10 to-[#48a1f3]/5 rounded-2xl flex items-center justify-center text-[#48a1f3] shadow-inner">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex bg-orange-50 text-[#f99b1c] border border-orange-100 px-3 py-1 rounded-full text-xs font-bold items-center gap-1 shadow-sm mb-2">
                    🔥 {selectedPackage.booking_count} lượt đặt
                  </div>
                  <h2 className="text-2xl font-black text-[#143250] leading-tight pr-8">
                    {selectedPackage.name}
                  </h2>
                </div>
              </div>

              {/* Scrollable Description */}
              <div className="px-8 py-4 overflow-y-auto" style={{ maxHeight: '40vh' }}>
                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Chi tiết gói dịch vụ</h4>
                <div className="prose prose-sm text-gray-600 leading-relaxed max-w-none whitespace-pre-wrap">
                  {selectedPackage.description || "Gói khám sức khỏe toàn diện với nhiều hạng mục thiết yếu."}
                </div>
              </div>

              {/* Bottom Sticky Footer */}
              <div className="p-8 pt-6 border-t border-gray-100 bg-gray-50/50 mt-auto shrink-0">
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
                  <div className="flex items-center gap-6 w-full sm:w-auto text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-500 font-medium mb-1">Thời lượng</span>
                      <div className="flex items-center gap-2 font-bold text-[#143250]">
                        <Clock className="w-5 h-5 text-[#48a1f3]" />
                        {selectedPackage.duration_minutes || 30} phút
                      </div>
                    </div>
                    {selectedPackage.fixed_price && (
                      <div className="flex flex-col border-l border-gray-200 pl-6">
                        <span className="text-gray-500 font-medium mb-1">Chi phí</span>
                        <div className="font-black text-[#f99b1c] text-xl">
                          {Number(selectedPackage.fixed_price).toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#48a1f3] to-[#3da3f5] text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#48a1f3]/30 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 shrink-0"
                    onClick={() => {
                      const pkgId = selectedPackage.id;
                      setSelectedPackage(null);
                      requireAuthAndNavigate(PAGES.BOOKING, { state: { packageId: pkgId } });
                    }}
                  >
                    Đặt lịch ngay <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div >
  );
};

export default WelcomePage;
