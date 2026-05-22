import React, { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  X,
  Edit,
  Search,
  Filter,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useAppointments } from "../contexts/AppointmentContext";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { PAGES, APPOINTMENT_STATUS } from "../utils/constants";
import {
  formatDate,
  getStatusColor,
  getStatusText,
  getRelativeDate,
} from "../utils/helpers";
import { createReview } from "../services/reviews.api";

const AppointmentsPage = ({ navigate }) => {
  const {
    appointments,
    cancelAppointment,
    getStatistics,
    getPastAppointments,
    updateAppointment,
  } = useAppointments();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const stats = getStatistics();
  const pastAppointments = getPastAppointments();

  const sortedAppointments = [...appointments].sort(
    (a, b) =>
      new Date(`${b.date}T${b.time || "00:00"}`) -
      new Date(`${a.date}T${a.time || "00:00"}`)
  );

  const filteredAppointments = sortedAppointments.filter((apt) => {
    const matchesSearch =
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "upcoming")
      return (
        (apt.status === "pending" || apt.status === "confirmed") &&
        matchesSearch
      );
    if (filter === "completed")
      return apt.status === "completed" && matchesSearch;
    if (filter === "cancelled")
      return apt.status === "cancelled" && matchesSearch;
    if (filter === "rejected")
      return apt.status === APPOINTMENT_STATUS.REJECTED && matchesSearch;

    return matchesSearch;
  });

  const handleCancelAppointment = async () => {
    if (selectedAppointment) {
      await cancelAppointment(selectedAppointment.id, cancelReason);
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelReason("");
    }
  };

  const openReviewModal = (apt) => {
    setReviewAppointment(apt);
    setReviewRating(5);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewAppointment || !user?.id) {
      alert("Thiếu thông tin để gửi đánh giá");
      return;
    }
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      alert("Vui lòng chọn điểm đánh giá từ 1 đến 5");
      return;
    }
    try {
      setIsSubmittingReview(true);
      await createReview({
        appointment_id: reviewAppointment.backendId || reviewAppointment.id,
        user_id: user.id,
        doctor_id: reviewAppointment.doctorId,
        rating: Number(reviewRating),
        comment: reviewComment,
      });
      // Đánh dấu lịch hẹn đã được đánh giá trong context
      updateAppointment(reviewAppointment.id, { hasReview: true });
      setShowReviewModal(false);
      setReviewAppointment(null);
      alert("Cảm ơn bạn đã đánh giá bác sĩ!");
    } catch (e) {
      alert(e.message || "Không thể gửi đánh giá");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filterTabs = [
    { key: "all", label: "Tất cả", count: stats.total, color: "blue" },
    {
      key: "upcoming",
      label: "Sắp tới",
      count: stats.upcoming,
      color: "green",
    },
    {
      key: "completed",
      label: "Hoàn thành",
      count: stats.completed,
      color: "purple",
    },
    {
      key: "rejected",
      label: "Bị từ chối",
      count: stats.rejected,
      color: "red",
    },
    {
      key: "cancelled",
      label: "Đã hủy",
      count: stats.cancelled,
      color: "gray",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate(PAGES.HOME)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
            >
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Lịch hẹn của tôi</span>
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(PAGES.DOCTORS)}
              icon={Plus}
            >
              Đặt lịch mới
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {filterTabs.map((tab) => (
            <Card
              key={tab.key}
              hover
              onClick={() => setFilter(tab.key)}
              className={`cursor-pointer border-2 transition-all ${
                filter === tab.key
                  ? `border-${tab.color}-500 bg-${tab.color}-50`
                  : "border-gray-200"
              }`}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {tab.count}
                </p>
                <p
                  className={`text-sm font-medium ${
                    filter === tab.key
                      ? `text-${tab.color}-600`
                      : "text-gray-600"
                  }`}
                >
                  {tab.label}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ, chuyên khoa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="md" icon={Filter}>
                Lọc
              </Button>
            </div>
          </div>
        </Card>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <Card
                key={apt.id}
                hover
                className="group cursor-pointer"
                onClick={() => setSelectedAppointment(apt)}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      👨‍⚕️
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {apt.doctorName}
                          </h3>
                          <p className="text-blue-600 text-sm font-medium">
                            {apt.specialty}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                            apt.status
                          )}`}
                        >
                          {getStatusText(apt.status)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {getRelativeDate(apt.date)} - {formatDate(apt.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{apt.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>
                            {apt.hospitalName || "STL Clinic"}
                            {apt.hospitalCity && ` - ${apt.hospitalCity}`}
                            {apt.hospitalAddress && `, ${apt.hospitalAddress}`}
                          </span>
                        </div>
                      </div>

                      {apt.type && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Lý do khám: </span>
                            {apt.type}
                          </p>
                        </div>
                      )}

                      {apt.status === APPOINTMENT_STATUS.REJECTED &&
                        apt.cancelReason && (
                          <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-sm text-red-700">
                              <span className="font-semibold">
                                Lịch hẹn bị bác sĩ từ chối:
                              </span>{" "}
                              {apt.cancelReason}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Actions */}
                  {(apt.status === "pending" || apt.status === "confirmed") && (
                    <div className="flex md:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Phone}
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("Gọi: 1900-xxxx");
                        }}
                        className="flex-1 md:flex-none"
                      >
                        Liên hệ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(PAGES.DOCTORS);
                        }}
                        className="flex-1 md:flex-none"
                      >
                        Đổi lịch
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={X}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(apt);
                          setShowCancelModal(true);
                        }}
                        className="flex-1 md:flex-none"
                      >
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === "all"
                ? "Chưa có lịch hẹn nào"
                : `Không có lịch hẹn ${getStatusText(filter).toLowerCase()}`}
            </h3>
            <p className="text-gray-600 mb-6">
              Đặt lịch ngay để được bác sĩ chăm sóc tốt nhất
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(PAGES.DOCTORS)}
              icon={Plus}
            >
              Đặt lịch ngay
            </Button>
          </Card>
        )}

        {/* Lịch sử khám bệnh (hoàn thành) */}
        {pastAppointments.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Lịch sử khám bệnh
            </h2>
            <div className="space-y-3">
              {pastAppointments.map((apt) => (
                <Card key={`history-${apt.id}`} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {formatDate(apt.date)} · {apt.time}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {apt.doctorName}
                      </p>
                      <p className="text-sm text-gray-600">{apt.specialty}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        Đã khám xong
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={apt.hasReview}
                        onClick={() => openReviewModal(apt)}
                      >
                        {apt.hasReview ? "Đã đánh giá" : "Đánh giá bác sĩ"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Hủy lịch hẹn</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn hủy lịch hẹn với{" "}
              <strong>{selectedAppointment?.doctorName}</strong>?
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy (tùy chọn)
              </label>
              <textarea
                placeholder="Nhập lý do hủy lịch..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleCancelAppointment}
                className="flex-1"
              >
                Xác nhận hủy
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Đánh giá bác sĩ
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Bạn đang đánh giá{" "}
              <strong>{reviewAppointment?.doctorName}</strong> cho buổi khám{" "}
              {formatDate(reviewAppointment?.date)} lúc{" "}
              {reviewAppointment?.time}.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Điểm đánh giá (1 - 5)
              </label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} sao
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét (tùy chọn)
              </label>
              <textarea
                placeholder="Chia sẻ trải nghiệm khám bệnh của bạn..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowReviewModal(false)}
                className="flex-1"
              >
                Đóng
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmitReview}
                loading={isSubmittingReview}
                disabled={isSubmittingReview}
                className="flex-1"
              >
                Gửi đánh giá
              </Button>
            </div>
          </Card>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AppointmentsPage;
