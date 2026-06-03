import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MessageCircle,
  User,
  Bell,
  Search,
  TrendingUp,
  Activity,
  Heart,
  FileText,
  ArrowRight,
  Plus,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useAppointments } from "../contexts/AppointmentContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { PAGES, HEALTH_TIPS, SPECIALTIES } from "../utils/constants";
import {
  formatDate,
  getInitials,
  getRelativeDate,
  getStatusText,
  getStatusColor,
  getCategoryIcon,
} from "../utils/helpers";
import { getActiveHospitalBanners } from "../services/admin.hospital.banner.api";
import { getCategories } from "../services/admin.categories.api";

const HomePage = ({ navigate }) => {
  const { user } = useAuth();
  const { getUpcomingAppointments, getStatistics } = useAppointments();
  const [searchQuery, setSearchQuery] = useState("");
  const [banners, setBanners] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const upcomingAppointments = getUpcomingAppointments().slice(0, 3);
  const stats = getStatistics();
  const randomTip = HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];

  const quickActions = [
    {
      icon: Calendar,
      label: "Đặt lịch khám",
      color: "blue",
      page: PAGES.BOOKING,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Clock,
      label: "Lịch hẹn",
      color: "purple",
      page: PAGES.APPOINTMENTS,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: MessageCircle,
      label: "Tư vấn online",
      color: "green",
      page: PAGES.CHAT,
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: FileText,
      label: "Hồ sơ bệnh án",
      color: "orange",
      page: PAGES.SETTINGS,
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  const healthMetrics = [
    {
      label: "Lượt khám",
      value: stats.completed,
      icon: Activity,
      color: "blue",
      change: "+12%",
    },
    {
      label: "Lịch hẹn",
      value: stats.upcoming,
      icon: Calendar,
      color: "purple",
      change: "+5%",
    },
    {
      label: "Điểm sức khỏe",
      value: "85",
      icon: Heart,
      color: "red",
      change: "+3%",
    },
  ];
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getActiveHospitalBanners();
        setBanners(data || []);
      } catch (error) {
        console.error(error.message);
      }
    };

    const loadCategories = async () => {
      try {
        const cats = await getCategories();

        // console.log("Categories API:", cats);

        setCategoriesList(Array.isArray(cats) ? cats : cats?.data || []);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    fetchBanners();
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fbff] pb-12 relative overflow-hidden">
      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#48a1f3]/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-[#f99b1c]/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      {/* Header is managed globally in AppRoutes */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-[#143250] mb-3 tracking-tight">
              Xin chào, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48a1f3] to-[#f99b1c]">{user?.fullName || "Bạn"}</span>! 👋
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl">
              Hôm nay bạn cảm thấy thế nào? Hãy để chúng tôi chăm sóc sức khỏe của bạn.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={() => navigate(PAGES.BOOKING)} className="px-6 py-3.5 bg-gradient-to-r from-[#48a1f3] to-[#3da3f5] text-white rounded-xl font-bold shadow-lg shadow-[#48a1f3]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <Plus className="w-5 h-5" /> Đặt lịch mới
            </button>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-100 flex items-center justify-between group">
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{metric.label}</p>
                <p className="text-4xl font-black text-[#143250] mb-2 group-hover:scale-105 origin-left transition-transform duration-300">
                  {metric.value}
                </p>
                <p
                  className={`text-sm font-bold flex items-center gap-1 ${
                    metric.color === "blue" ? "text-[#48a1f3]" : metric.color === "purple" ? "text-purple-500" : "text-[#f99b1c]"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  {metric.change} tháng trước
                </p>
              </div>
              <div
                className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 ${
                  metric.color === "blue" ? "bg-blue-50 text-[#48a1f3]" : metric.color === "purple" ? "bg-purple-50 text-purple-500" : "bg-orange-50 text-[#f99b1c]"
                }`}
              >
                <metric.icon className="w-10 h-10" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-[#143250] mb-6 flex items-center gap-2">
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={() => navigate(action.page)}
                className="group cursor-pointer bg-white rounded-3xl p-6 text-center border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 mx-auto bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}
                >
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-[#143250] group-hover:text-[#48a1f3] transition-colors">
                  {action.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Appointments */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[#143250] flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#48a1f3]" />
                  </div>
                  Lịch hẹn sắp tới
                </h3>
                <button
                  onClick={() => navigate(PAGES.APPOINTMENTS)}
                  className="text-[#48a1f3] font-bold hover:text-[#143250] transition-colors flex items-center gap-1 group bg-blue-50 hover:bg-gray-100 px-4 py-2 rounded-full"
                >
                  Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-5 border border-gray-100 bg-gray-50/50 hover:bg-[#48a1f3]/5 rounded-[1.5rem] hover:shadow-md hover:border-[#48a1f3]/30 transition-all cursor-pointer group"
                      onClick={() => navigate(PAGES.APPOINTMENTS)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 text-[#48a1f3] group-hover:bg-[#48a1f3] group-hover:text-white transition-colors duration-300">
                            <User className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#143250] text-lg mb-0.5">
                              {apt.doctorName}
                            </h4>
                            <p className="text-sm text-[#f99b1c] font-semibold mb-2">
                              {apt.specialty}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                              <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                                <Calendar className="w-4 h-4 text-[#48a1f3]" />
                                {getRelativeDate(apt.date)}
                              </span>
                              <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                                <Clock className="w-4 h-4 text-[#f99b1c]" />
                                {apt.time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-start sm:justify-end">
                          <span
                            className={`px-4 py-2 text-sm font-bold rounded-xl shadow-sm ${
                              apt.status === "pending"
                                ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                                : apt.status === "confirmed"
                                  ? "bg-green-50 text-green-600 border border-green-200"
                                  : apt.status === "rejected"
                                    ? "bg-red-50 text-red-600 border border-red-200"
                                    : apt.status === "completed"
                                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                                      : "bg-gray-100 text-gray-600 border border-gray-300"
                            }`}
                          >
                            {getStatusText(apt.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-gray-100">
                    <Calendar className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold text-[#143250] mb-2">Chưa có lịch hẹn</h4>
                  <p className="text-gray-500 mb-8 max-w-xs mx-auto">Đặt lịch ngay để được chăm sóc sức khỏe tốt nhất từ các bác sĩ chuyên khoa.</p>
                  <button
                    onClick={() => navigate(PAGES.DOCTORS)}
                    className="px-8 py-3.5 bg-white text-[#143250] border-2 border-gray-200 hover:border-[#48a1f3] hover:text-[#48a1f3] hover:bg-blue-50 rounded-xl font-bold transition-all flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" /> Khám bệnh ngay
                  </button>
                </div>
              )}
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[#143250] flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-[#f99b1c]" />
                  </div>
                  Chuyên khoa
                </h3>
                <button
                  onClick={() => navigate(PAGES.DOCTORS)}
                  className="text-[#48a1f3] font-bold hover:text-[#143250] transition-colors flex items-center gap-1 group bg-blue-50 hover:bg-gray-100 px-4 py-2 rounded-full"
                >
                  Tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {categoriesList.slice(0, 8).map((specialty) => (
                  <div
                    key={specialty.id}
                    className="group relative bg-gray-50 hover:bg-white rounded-2xl p-5 text-center cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transform hover:-translate-y-1 transition-all duration-300"
                    onClick={() =>
                      navigate(PAGES.DOCTORS, {
                        state: { specialty: specialty.name },
                      })
                    }
                  >
                    <div className="w-14 h-14 mx-auto bg-white group-hover:bg-gradient-to-br group-hover:from-[#48a1f3] group-hover:to-[#3da3f5] rounded-xl flex items-center justify-center mb-3 transition-all duration-300 shadow-sm group-hover:shadow-md overflow-hidden">
                      {specialty.image_url ? (
                        <img src={specialty.image_url} alt={specialty.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 mix-blend-multiply group-hover:mix-blend-normal group-hover:brightness-0 group-hover:invert" />
                      ) : (
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-300 filter group-hover:brightness-0 group-hover:invert">
                          {getCategoryIcon(specialty.name)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#143250] text-sm group-hover:text-[#48a1f3] transition-colors line-clamp-2">
                      {specialty.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Health Tip */}
            <div className="relative rounded-[2rem] overflow-hidden p-8 text-white shadow-lg shadow-blue-500/20 group cursor-pointer" onClick={() => window.open("https://moh.gov.vn/", "_blank")}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#48a1f3] to-[#143250] transition-transform duration-700 group-hover:scale-110"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-[20px] -ml-10 -mb-10"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{randomTip.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight text-white">Mẹo sức khỏe</h4>
                    <p className="text-xs text-blue-200/90 font-medium uppercase tracking-wider">{randomTip.category}</p>
                  </div>
                </div>
                <p className="text-white/95 leading-relaxed font-medium text-lg">
                  "{randomTip.content}"
                </p>
              </div>
            </div>

            {/* Quick Book */}
            <div className="bg-gradient-to-b from-orange-50 to-white rounded-[2rem] p-8 border border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#f99b1c]/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-[#f99b1c]/20 transition-colors duration-500"></div>
              <h4 className="text-xl font-black text-[#143250] mb-3 relative z-10">Đặt lịch khám nhanh</h4>
              <p className="text-gray-500 mb-8 relative z-10 font-medium">
                Hệ thống sẽ gợi ý bác sĩ chuyên môn phù hợp nhất cho bạn.
              </p>
              <button
                onClick={() => navigate(PAGES.DOCTORS)}
                className="w-full py-4 bg-gradient-to-r from-[#f99b1c] to-[#fbc374] text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 relative z-10"
              >
                <Calendar className="w-5 h-5" /> Đặt lịch ngay
              </button>
            </div>

            {/* Support */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center group hover:border-[#48a1f3]/30 transition-colors">
              <div className="w-16 h-16 bg-blue-50 text-[#48a1f3] rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-[#48a1f3] group-hover:text-white transition-all duration-300">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-[#143250] mb-2">Cần hỗ trợ?</h4>
              <p className="text-gray-500 mb-6 text-sm font-medium">
                Đội ngũ CSKH chuyên nghiệp luôn sẵn sàng hỗ trợ bạn 24/7.
              </p>
              <button
                onClick={() => navigate(PAGES.CHAT)}
                className="w-full py-3.5 bg-gray-50 text-[#143250] border border-gray-200 hover:border-transparent hover:bg-[#48a1f3] hover:text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                 Trò chuyện trực tuyến <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
      <footer id="contact" className="bg-gray-900 text-white py-12 relative z-10">
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
    </div>
  );
};

export default HomePage;
