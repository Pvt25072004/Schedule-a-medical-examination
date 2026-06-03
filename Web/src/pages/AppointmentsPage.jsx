import React, { useState, useEffect, useRef } from "react";
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
  Star,
  Shield,
  FileText
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
  normalizeForSearch,
} from "../utils/helpers";
import { createReview, updateReview } from "../services/reviews.api";
import { createVnpayUrl, createPayosUrl } from "../services/payments.api";
import { CreditCard } from "lucide-react";

const AppointmentsPage = ({ navigate }) => {
  const {
    appointments,
    cancelAppointment,
    updateAppointment,
    refreshAppointments
  } = useAppointments();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date_desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (sortBy === "date_desc") {
      return new Date(`${b.date}T${b.time || "00:00"}`) - new Date(`${a.date}T${a.time || "00:00"}`);
    }
    if (sortBy === "date_asc") {
      return new Date(`${a.date}T${a.time || "00:00"}`) - new Date(`${b.date}T${b.time || "00:00"}`);
    }
    if (sortBy === "price_desc") {
      return (b.price || 0) - (a.price || 0);
    }
    if (sortBy === "price_asc") {
      return (a.price || 0) - (b.price || 0);
    }
    return 0;
  });

  const filteredAppointments = sortedAppointments.filter((apt) => {
    if (!searchQuery) return true;
    const searchNorm = normalizeForSearch(searchQuery);
    return (
      normalizeForSearch(apt.doctorName).includes(searchNorm) ||
      normalizeForSearch(apt.specialty).includes(searchNorm) ||
      normalizeForSearch(apt.hospitalName).includes(searchNorm) ||
      normalizeForSearch(getStatusText(apt.status)).includes(searchNorm)
    );
  });

  const upcomingAppointments = filteredAppointments.filter(
    (apt) => apt.status === "pending" || apt.status === "confirmed" || apt.status === "awaiting_payment"
  );

  const historyAppointmentsAll = filteredAppointments.filter(
    (apt) => apt.status === "completed" || apt.status === "cancelled" || apt.status === APPOINTMENT_STATUS.REJECTED
  );

  const historyAppointmentsFiltered = historyAppointmentsAll.filter((apt) => {
    if (statusFilter === "all") return true;
    return apt.status === statusFilter;
  });

  const totalPages = Math.ceil(historyAppointmentsFiltered.length / itemsPerPage);
  const historyAppointments = historyAppointmentsFiltered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCancelAppointment = async () => {
    if (selectedAppointment) {
      await cancelAppointment(selectedAppointment.id, cancelReason);
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelReason("");
    }
  };

  const handleRetryPayment = async (apt, method = "vnpay") => {
    try {
      if (!apt.payment) return;
      const amount = apt.payment.amount || 500000;
      
      if (method === "payos") {
        const payosResponse = await createPayosUrl({
          appointment_id: apt.backendId || apt.id,
          amount: amount,
          orderInfo: `Thanh toan lich kham web ${apt.backendId || apt.id}`
        });
        if (payosResponse?.url) {
          window.location.href = payosResponse.url;
        }
      } else {
        const vnpayResponse = await createVnpayUrl({
          appointment_id: apt.backendId || apt.id,
          amount: amount,
          orderInfo: `Thanh toan lich kham web ${apt.backendId || apt.id}`
        });
        if (vnpayResponse?.url) {
          window.location.href = vnpayResponse.url;
        }
      }
    } catch (err) {
      console.warn("Retry payment failed:", err);
      alert("Không thể tạo URL thanh toán. Vui lòng thử lại sau.");
    }
  };

  const openReviewModal = (apt) => {
    setReviewAppointment(apt);
    setReviewRating(apt.reviewRating || 5);
    setReviewComment(apt.reviewComment || "");
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
      const payload = {
        appointment_id: reviewAppointment.backendId || reviewAppointment.id,
        user_id: user.id,
        doctor_id: reviewAppointment.doctorId,
        rating: Number(reviewRating),
        comment: reviewComment,
      };

      if (reviewAppointment.hasReview && reviewAppointment.reviewId) {
        await updateReview(reviewAppointment.reviewId, payload);
        alert("Đã cập nhật đánh giá thành công!");
      } else {
        await createReview(payload);
        alert("Cảm ơn bạn đã đánh giá bác sĩ!");
      }

      // Cập nhật lại context hoặc tải lại danh sách
      if (refreshAppointments) {
        refreshAppointments();
      } else {
        updateAppointment(reviewAppointment.id, {
          hasReview: true,
          reviewRating: payload.rating,
          reviewComment: payload.comment
        });
      }

      setShowReviewModal(false);
      setReviewAppointment(null);
    } catch (e) {
      alert(e.message || "Không thể gửi đánh giá");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderAppointmentCard = (apt, isHistory = false) => {
    const statusColor = getStatusColor(apt.status);
    return (
      <Card
        key={apt.id}
        hover
        className="mb-4 overflow-hidden border-2 border-transparent transition-colors bg-white hover:border-blue-100 shadow-sm"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
                {apt.avatar_url ? (
                  <img
                    src={apt.avatar_url}
                    alt={apt.doctorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-full h-full p-3 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {apt.doctorName}
                </h3>
                <p className="text-blue-600 font-medium text-sm">
                  {apt.specialty}
                </p>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{apt.hospitalName || "Phòng khám nội bộ"}</span>
                </div>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColor}`}
            >
              {getStatusText(apt.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">
                {formatDate(apt.date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{apt.time}</span>
            </div>
            {apt.type && (
              <div className="col-span-2 flex items-start gap-2 text-gray-700">
                <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm line-clamp-1" title={apt.type}>
                  {apt.type}
                </span>
              </div>
            )}
          </div>

          {apt.status === "cancelled" && apt.cancelReason && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
              <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block mb-0.5">Lý do hủy:</span>
                <span>{apt.cancelReason}</span>
              </div>
            </div>
          )}

          {/* Nút hành động */}
          <div className="flex gap-2 justify-end border-t border-gray-100 pt-4">
            {apt.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAppointment(apt);
                  setShowCancelModal(true);
                }}
                className="text-red-600 hover:bg-red-50 hover:border-red-200"
              >
                Hủy lịch
              </Button>
            )}

            {apt.status === "awaiting_payment" && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRetryPayment(apt, "vnpay")}
                  className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2 border-none text-white"
                >
                  <CreditCard className="w-4 h-4" /> VNPAY
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRetryPayment(apt, "payos")}
                  className="bg-indigo-500 hover:bg-indigo-600 flex items-center gap-2 border-none text-white"
                >
                  <CreditCard className="w-4 h-4" /> VietQR
                </Button>
              </>
            )}

            {apt.status === "awaiting_payment" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAppointment(apt);
                  setShowCancelModal(true);
                }}
                className="text-gray-600 hover:bg-gray-50"
              >
                Hủy đăng ký
              </Button>
            )}

            {isHistory && apt.status === "completed" && (
              <Button
                variant={apt.hasReview ? "outline" : "primary"}
                size="sm"
                onClick={() => openReviewModal(apt)}
                icon={Star}
                className={apt.hasReview ? "text-yellow-600 hover:bg-yellow-50 border-yellow-200" : "bg-yellow-500 hover:bg-yellow-600 text-white"}
              >
                {apt.hasReview ? "Sửa đánh giá" : "Đánh giá bác sĩ"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header (App bar) */}
      <header className="bg-white shadow-sm sticky top-0 z-40 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <button
              onClick={() => navigate(PAGES.HOME)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition flex-shrink-0 bg-white border border-gray-200 px-4 py-2.5 rounded-full shadow-sm hover:shadow-md hover:border-blue-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              <span className="font-semibold text-sm">Quay lại Bảng điều khiển</span>
            </button>

            {/* Search Bar & Filter */}
            <div className="flex-1 w-full max-w-4xl mx-auto md:mx-4 flex gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm bác sĩ, chuyên khoa, phòng khám..."
                  className="block w-full pl-11 pr-4 py-2.5 rounded-full text-gray-900 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-300 focus:outline-none transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative" ref={filterRef}>
                <Button
                  variant="outline"
                  size="md"
                  icon={Filter}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`rounded-full shadow-sm flex-shrink-0 transition-colors ${showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}`}
                >
                  Lọc
                </Button>
                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-fade-in">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Sắp xếp theo</h3>
                    <div className="space-y-2">
                      <button onClick={() => setSortBy("date_desc")} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === 'date_desc' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Ngày gần nhất</button>
                      <button onClick={() => setSortBy("date_asc")} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === 'date_asc' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Ngày xa nhất</button>
                      <button onClick={() => setSortBy("price_desc")} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === 'price_desc' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Giá tiền (Cao đến thấp)</button>
                      <button onClick={() => setSortBy("price_asc")} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === 'price_asc' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Giá tiền (Thấp đến cao)</button>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3 text-sm mt-4 border-t border-gray-100 pt-3">Lọc trạng thái lịch sử</h3>
                    <div className="space-y-2">
                      <button onClick={() => { setStatusFilter("all"); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Tất cả</button>
                      <button onClick={() => { setStatusFilter("completed"); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'completed' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Đã hoàn thành</button>
                      <button onClick={() => { setStatusFilter("cancelled"); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'cancelled' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Đã hủy</button>
                      <button onClick={() => { setStatusFilter("rejected"); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'rejected' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Bị từ chối</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(PAGES.BOOKING)}
              icon={Plus}
              className="flex-shrink-0 rounded-full shadow-md hover:shadow-lg"
            >
              Đặt lịch mới
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "upcoming"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Lịch hẹn sắp tới
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {upcomingAppointments.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Lịch sử khám
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {historyAppointmentsAll.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {activeTab === "upcoming" && (
            <div className="animate-fade-in">
              {upcomingAppointments.length === 0 ? (
                <Card className="text-center py-12 bg-white/80 backdrop-blur">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Bạn không có lịch hẹn nào sắp tới</p>
                  <Button variant="primary" onClick={() => navigate(PAGES.DOCTORS)}>
                    Đặt lịch khám ngay
                  </Button>
                </Card>
              ) : (
                <div>
                  {upcomingAppointments.map(apt => renderAppointmentCard(apt, false))}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="animate-fade-in">
              {historyAppointments.length === 0 ? (
                <Card className="text-center py-12 bg-white/80 backdrop-blur border-dashed border-2">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Không tìm thấy lịch sử khám bệnh nào</p>
                </Card>
              ) : (
                <div>
                  {historyAppointments.map(apt => renderAppointmentCard(apt, true))}
                  
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-100">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                      >
                        Trang trước
                      </button>
                      <span className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                      >
                        Trang sau
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Hủy lịch hẹn
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4 text-sm">
              Bạn có chắc chắn muốn hủy lịch hẹn với bác sĩ{" "}
              <span className="font-semibold">
                {selectedAppointment?.doctorName}
              </span>{" "}
              vào lúc{" "}
              <span className="font-semibold">
                {selectedAppointment?.time} {formatDate(selectedAppointment?.date)}
              </span>
              ?
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy (bắt buộc)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Vui lòng cho biết lý do bạn hủy lịch..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows="3"
                required
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
                disabled={!cancelReason.trim()}
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
                {reviewAppointment.hasReview ? "Sửa đánh giá" : "Đánh giá bác sĩ"}
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-4 text-sm">
              Bạn đang đánh giá <strong>{reviewAppointment?.doctorName}</strong>{" "}
              cho buổi khám {formatDate(reviewAppointment?.date)} lúc{" "}
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
                {[5, 4, 3, 2, 1].map((n) => (
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
                {reviewAppointment.hasReview ? "Cập nhật" : "Gửi đánh giá"}
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
