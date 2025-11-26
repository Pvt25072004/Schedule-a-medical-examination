import React, { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  MessageCircle,
  Users,
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { PAGES, DOCTORS, SPECIALTIES } from "../utils/constants";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080";
const APPOINTMENTS_ENDPOINT = `${API_BASE_URL}/appointments`;
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
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({ ...DEFAULT_APPOINTMENT_FORM });
  const [listLoading, setListLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);

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
      const response = await fetch(APPOINTMENTS_ENDPOINT);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách lịch hẹn");
      }
      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert("error", error.message || "Đã xảy ra lỗi không xác định");
    } finally {
      setListLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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
      const response = await fetch(
        editingId
          ? `${APPOINTMENTS_ENDPOINT}/${editingId}`
          : `${APPOINTMENTS_ENDPOINT}`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(
          editingId ? "Không thể cập nhật lịch hẹn" : "Không thể tạo lịch hẹn"
        );
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
      const response = await fetch(`${APPOINTMENTS_ENDPOINT}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Không thể xóa lịch hẹn");
      }
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
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">STL Clinic</h1>
                <p className="text-xs text-gray-500">
                  Chăm sóc sức khỏe toàn diện
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Tính năng
              </a>
              <a
                href="#doctors"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Bác sĩ
              </a>
              <a
                href="#specialties"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Chuyên khoa
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Liên hệ
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
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
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - MedPro Style */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Nền tảng đặt khám trực tuyến #1 Việt Nam
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Đặt lịch khám
                <span className="text-blue-600"> nhanh chóng</span>
                <br />
                với bác sĩ giỏi
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Kết nối bạn với các bác sĩ chuyên khoa hàng đầu. Đặt lịch
                online, khám bệnh dễ dàng, tiết kiệm thời gian....
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(PAGES.REGISTER)}
                  icon={Calendar}
                  className="text-lg"
                >
                  Đặt lịch ngay
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(PAGES.LOGIN)}
                  className="text-lg"
                >
                  Tìm hiểu thêm
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-8 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80"
                  alt="Doctor"
                  className="rounded-2xl shadow-2xl w-full"
                />

                {/* Floating Cards */}
                <div className="absolute -left-6 top-20 animate-float">
                  <Card className="p-4 bg-white shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">An toàn</div>
                        <div className="text-sm text-gray-500">
                          100% bảo mật
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div
                  className="absolute -right-6 bottom-20 animate-float"
                  style={{ animationDelay: "1s" }}
                >
                  <Card className="p-4 bg-white shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          Nhanh chóng
                        </div>
                        <div className="text-sm text-gray-500">Chỉ 30 giây</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute -z-10 top-10 right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -z-10 bottom-10 left-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn STL Clinic??
            </h2>
            <p className="text-xl text-gray-600">
              Chúng tôi cam kết mang đến trải nghiệm khám chữa bệnh tốt nhất
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center group">
                <div
                  className={`w-16 h-16 bg-${feature.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon
                    className={`w-8 h-8 text-${feature.color}-600`}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Đội ngũ Bác sĩ
            </h2>
            <p className="text-xl text-gray-600">
              Bác sĩ giàu kinh nghiệm, tận tâm với nghề
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DOCTORS.slice(0, 6).map((doctor) => (
              <Card key={doctor.id} hover className="group">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {doctor.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 font-medium text-sm mb-2">
                      {doctor.specialty}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        ⭐ {doctor.rating}
                      </span>
                      <span>{doctor.experience} năm KN</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="mt-4"
                  onClick={() => navigate(PAGES.BOOKING)}
                >
                  Đặt lịch khám
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(PAGES.REGISTER)}
            >
              Xem tất cả bác sĩ
            </Button>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Chuyên khoa
            </h2>
            <p className="text-xl text-gray-600">
              Đa dạng các chuyên khoa phục vụ nhu cầu khám chữa bệnh
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {SPECIALTIES.map((specialty) => (
              <Card
                key={specialty.id}
                hover
                className="text-center cursor-pointer group"
                onClick={() => navigate(PAGES.BOOKING)}
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {specialty.icon}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {specialty.name}
                </h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Appointments CRUD Section */}
      <section id="appointments" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Quản lý lịch hẹn trực tuyến
            </h2>
            <p className="text-xl text-gray-600">
              Thử CRUD trực tiếp với API NestJS `/appointments`
            </p>
          </div>

          {alert && (
            <div
              className={`mb-8 rounded-xl px-5 py-4 text-sm font-medium ${
                alert.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {alert.message}
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-2">
            <Card shadow="lg" className="border-blue-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                {editingId ? "Chỉnh sửa lịch hẹn" : "Tạo lịch hẹn mới"}
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      ID bệnh nhân
                    </label>
                    <input
                      type="number"
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="VD: 1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      ID bác sĩ
                    </label>
                    <input
                      type="number"
                      name="doctor_id"
                      value={formData.doctor_id}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="VD: 2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      ID bệnh viện
                    </label>
                    <input
                      type="number"
                      name="hospital_id"
                      value={formData.hospital_id}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="VD: 3"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      ID lịch làm việc
                    </label>
                    <input
                      type="number"
                      name="schedule_id"
                      value={formData.schedule_id}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="VD: 5"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Ngày khám
                    </label>
                    <input
                      type="date"
                      name="appointment_date"
                      value={formData.appointment_date}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Giờ khám
                    </label>
                    <input
                      type="time"
                      name="appointment_time"
                      value={formData.appointment_time}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Hình thức khám
                  </label>
                  <select
                    name="examination_type"
                    value={formData.examination_type}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Triệu chứng (tùy chọn)
                  </label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Mô tả nhanh triệu chứng..."
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={formLoading}
                    fullWidth
                  >
                    {editingId ? "Cập nhật lịch hẹn" : "Tạo lịch hẹn"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={resetForm}
                      fullWidth
                    >
                      Hủy chỉnh sửa
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <Card shadow="lg" className="border-green-100">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Danh sách lịch hẹn
                  </h3>
                  <p className="text-sm text-gray-500">
                    Đồng bộ dữ liệu trực tiếp từ API backend
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAppointments}
                  loading={listLoading}
                >
                  Làm mới
                </Button>
              </div>

              {listLoading ? (
                <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
              ) : appointments.length === 0 ? (
                <p className="text-center text-gray-500">
                  Chưa có lịch hẹn nào. Hãy tạo mới ở bên cạnh nhé!
                </p>
              ) : (
                <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-1">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            Lịch #{appointment.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {displayDate(appointment.appointment_date)} ·{" "}
                            {displayTime(appointment.appointment_time)} ·{" "}
                            {appointment.examination_type}
                          </p>
                        </div>
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                          {appointment.status || "pending"}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                        <p>Người bệnh: #{appointment.user_id}</p>
                        <p>Bác sĩ: #{appointment.doctor_id}</p>
                        <p>Bệnh viện: #{appointment.hospital_id}</p>
                        <p>Lịch làm việc: #{appointment.schedule_id || "—"}</p>
                      </div>

                      {appointment.symptoms && (
                        <p className="mt-3 text-sm italic text-gray-600">
                          Triệu chứng: {appointment.symptoms}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(appointment)}
                          disabled={deletingId === appointment.id}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(appointment.id)}
                          loading={deletingId === appointment.id}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Đặt lịch khám ngay hôm nay để nhận được sự chăm sóc tốt nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(PAGES.REGISTER)}
              className="bg-white text-blue-600 hover:bg-gray-50"
            >
              Đăng ký miễn phí
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate(PAGES.LOGIN)}
              className="text-white border-2 border-white hover:bg-white/10"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </section>

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

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate(PAGES.CHAT)}
          icon={MessageCircle}
          className="rounded-full shadow-2xl w-14 h-14 p-0"
        />
      </div>

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

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
