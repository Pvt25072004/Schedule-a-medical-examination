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
} from "../utils/helpers";
import { getActiveHospitalBanners } from "../services/admin.hospital.banner.api";
import BannerPage from "./BannerPage";

const HomePage = ({ navigate }) => {
  const { user } = useAuth();
  const { getUpcomingAppointments, getStatistics } = useAppointments();
  const [searchQuery, setSearchQuery] = useState("");
  const [banners, setBanners] = useState([]);

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

    fetchBanners();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header is managed globally in AppRoutes */}

      {/* Banner Section */}
      {/* <BannerPage /> */}
      {/* Banner Section */}
      {banners.length > 0 && (
        <section className="flex flex-col items-center justify-center mb-4 mt-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {banners.map((banner) => (
              <a
                key={banner.id}
                href={banner.redirect_url || "#"}
                className="group overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg"
              >
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="h-48 w-full object-cover transition group-hover:scale-105"
                />

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {banner.title}
                  </h3>

                  {banner.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {banner.description}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Xin chào, {user?.fullName || "Bạn"}! 👋
          </h2>
          <p className="text-gray-600">
            Hôm nay bạn cảm thấy thế nào? Hãy để chúng tôi chăm sóc sức khỏe của
            bạn.
          </p>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {healthMetrics.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p
                    className={`text-sm font-medium text-${metric.color}-600 mt-2 flex items-center gap-1`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    {metric.change} so với tháng trước
                  </p>
                </div>
                <div
                  className={`w-16 h-16 bg-${metric.color}-100 rounded-2xl flex items-center justify-center`}
                >
                  <metric.icon className={`w-8 h-8 text-${metric.color}-600`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                hover
                onClick={() => navigate(action.page)}
                className="group cursor-pointer"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  {action.label}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Appointments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  Lịch hẹn sắp tới
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(PAGES.APPOINTMENTS)}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Xem tất cả
                </Button>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(PAGES.APPOINTMENTS)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {apt.doctorName}
                              </h4>
                              <p className="text-sm text-blue-600">
                                {apt.specialty}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 ml-13">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {getRelativeDate(apt.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {apt.time}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            apt.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : apt.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : apt.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : apt.status === "completed"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {getStatusText(apt.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">Bạn chưa có lịch hẹn nào</p>
                  <Button
                    variant="primary"
                    onClick={() => navigate(PAGES.DOCTORS)}
                    icon={Plus}
                  >
                    Đặt lịch ngay
                  </Button>
                </div>
              )}
            </Card>

            {/* Specialties */}
            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Chuyên khoa phổ biến
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SPECIALTIES.slice(0, 8).map((specialty) => (
                  <div
                    key={specialty.id}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition cursor-pointer text-center group"
                    onClick={() => navigate(PAGES.DOCTORS)}
                  >
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                      {specialty.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {specialty.name}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Health Tip */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{randomTip.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">💡 Mẹo sức khỏe</h4>
                  <p className="text-sm text-blue-100">{randomTip.category}</p>
                </div>
              </div>
              <p className="text-white/90 leading-relaxed">
                {randomTip.content}
              </p>
            </Card>

            {/* Quick Book */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <h4 className="font-bold text-gray-900 mb-3">Đặt lịch nhanh</h4>
              <p className="text-sm text-gray-600 mb-4">
                Đặt lịch khám chỉ trong 30 giây với bác sĩ giỏi nhất
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(PAGES.DOCTORS)}
                icon={Calendar}
              >
                Đặt lịch ngay
              </Button>
            </Card>

            {/* Support */}
            <Card>
              <h4 className="font-bold text-gray-900 mb-3">Cần hỗ trợ?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Đội ngũ hỗ trợ 24/7 luôn sẵn sàng giúp bạn
              </p>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate(PAGES.CHAT)}
                icon={MessageCircle}
              >
                Chat ngay
              </Button>
            </Card>
          </div>
        </div>
      </main>
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
    </div>
  );
};

export default HomePage;
