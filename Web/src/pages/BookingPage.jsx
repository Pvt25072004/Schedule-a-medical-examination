import React, { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  Search,
  Star,
  Award,
  ArrowLeft,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { useAppointments } from "../contexts/AppointmentContext";
import { useAuth } from "../contexts/AuthContext";
import { createAppointment as apiCreateAppointment } from "../services/appointments.api";
import { getSchedulesByDoctor } from "../services/doctor.schedules.api";
import { createPaymentDemo } from "../services/payments.api";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { PAGES, TIME_SLOTS } from "../utils/constants";
import { formatDate, formatCurrency } from "../utils/helpers";
import { getDoctors as getDoctorsApi } from "../services/admin.doctors.api";
import { getAllReviews } from "../services/reviews.api";

const BookingPage = ({ navigate }) => {
  const { addAppointment, isSlotAvailable } = useAppointments();
  const { user } = useAuth();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    type: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Tính số sao trung bình cho mỗi doctor từ reviews
  const doctorRatingsMap = useMemo(() => {
    const map = new Map();
    reviews.forEach((review) => {
      const doctorId = review.doctor_id || review.doctor?.id;
      const rating = review.rating;
      if (doctorId && rating != null) {
        if (!map.has(doctorId)) {
          map.set(doctorId, { total: 0, count: 0 });
        }
        const data = map.get(doctorId);
        data.total += Number(rating);
        data.count += 1;
      }
    });
    // Tính trung bình
    const result = new Map();
    map.forEach((data, doctorId) => {
      result.set(doctorId, (data.total / data.count).toFixed(1));
    });
    return result;
  }, [reviews]);

  // Merge averageRating vào doctors
  const doctorsWithRatings = useMemo(() => {
    return doctors.map((doctor) => ({
      ...doctor,
      averageRating: doctorRatingsMap.get(doctor.id) || "0.0",
      totalReviews: reviews.filter(
        (r) => (r.doctor_id || r.doctor?.id) === doctor.id
      ).length,
    }));
  }, [doctors, doctorRatingsMap, reviews]);

  const selectedDoctor = doctorsWithRatings.find(
    (d) => d.id === formData.doctorId
  );

  const filteredDoctors = doctorsWithRatings.filter((doctor) => {
    const name = (doctor.name || "").toLowerCase();
    const specialty = (
      doctor.specialty ||
      doctor.category?.name ||
      ""
    ).toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || specialty.includes(q);
  });

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const data = await getDoctorsApi();
        const list = Array.isArray(data) ? data : [];
        // Chuẩn hóa một số field để dùng cho UI
        const normalized = list.map((d) => ({
          ...d,
          specialty: d.specialty || d.category?.name || "Đa khoa",
          consultationFee: d.consultationFee || d.price || 500000,
        }));
        setDoctors(normalized);
      } catch (e) {
        console.error("Load doctors for booking error:", e);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };
    const loadReviews = async () => {
      try {
        setLoadingReviews(true);
        const data = await getAllReviews();
        setReviews(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Load reviews for booking error:", e);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    void loadDoctors();
    void loadReviews();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const loadSlotsFromSchedules = async (doctorId, date) => {
    if (!doctorId || !date) return;
    try {
      setLoadingSlots(true);
      const schedules = await getSchedulesByDoctor(doctorId);
      const daySchedules = (schedules || []).filter((s) => {
        const workDate =
          typeof s.work_date === "string"
            ? s.work_date.slice(0, 10)
            : s.work_date?.toString().slice(0, 10);
        return workDate === date;
      });

      const slotsSet = new Set();
      for (const sch of daySchedules) {
        const start = (sch.start_time || "").slice(0, 5);
        const end = (sch.end_time || "").slice(0, 5);
        if (!start || !end) continue;
        let [h, m] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);
        while (h < endH || (h === endH && m < endM)) {
          const hh = String(h).padStart(2, "0");
          const mm = String(m).padStart(2, "0");
          slotsSet.add(`${hh}:${mm}`);
          m += 30;
          if (m >= 60) {
            h += 1;
            m -= 60;
          }
        }
      }
      const slotsArray = Array.from(slotsSet).sort();
      setAvailableSlots(slotsArray);
    } catch (err) {
      console.error("Load schedule slots error:", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.doctorId) newErrors.doctorId = "Vui lòng chọn bác sĩ";
    if (!formData.date) newErrors.date = "Vui lòng chọn ngày";
    if (!formData.time) newErrors.time = "Vui lòng chọn giờ";
    if (!formData.type) newErrors.type = "Vui lòng nhập lý do khám";
    return newErrors;
  };

  const handleNext = () => {
    if (step === 1 && !formData.doctorId) {
      setErrors({ doctorId: "Vui lòng chọn bác sĩ" });
      return;
    }
    if (step === 2 && (!formData.date || !formData.time)) {
      setErrors({ date: "Vui lòng chọn đầy đủ ngày và giờ" });
      return;
    }
    if (step === 1 && formData.doctorId) {
      // Khi chuyển sang bước 2, load slot từ schedules
      void loadSlotsFromSchedules(
        formData.doctorId,
        formData.date || getMinDate()
      );
    }
    if (step === 2 && formData.doctorId && formData.date) {
      void loadSlotsFromSchedules(formData.doctorId, formData.date);
    }
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user?.id) {
      alert("Bạn cần đăng nhập trước khi đặt lịch");
      return;
    }

    setIsLoading(true);

    try {
      // Tạm thời gán hospital_id cố định (1) và examination_type = 'offline'
      const payload = {
        user_id: user.id,
        doctor_id: formData.doctorId,
        hospital_id: 1,
        schedule_id: undefined,
        appointment_date: formData.date,
        appointment_time: formData.time,
        examination_type: "offline",
        symptoms: formData.type,
      };

      const created = await apiCreateAppointment(payload);

      // Demo payment sau khi tạo appointment thành công
      try {
        await createPaymentDemo({
          appointment_id: created?.id,
          amount: selectedDoctor?.consultationFee || 500000,
          base_fee: selectedDoctor?.consultationFee || 500000,
          payment_method: "cash",
        });
      } catch (err) {
        console.warn("Demo payment failed:", err);
      }

      // Đồng bộ vào context để AppointmentsPage có dữ liệu ngay
      addAppointment({
        doctorId: formData.doctorId,
        doctorName: selectedDoctor?.name || "",
        specialty: selectedDoctor?.specialty || "",
        date: formData.date,
        time: formData.time,
        type: formData.type,
        notes: formData.notes,
        backendId: created?.id,
      });

      setIsLoading(false);
      setShowSuccess(true);

      setTimeout(() => {
        navigate(PAGES.APPOINTMENTS);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      alert(error.message || "Không thể tạo lịch hẹn");
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const steps = [
    { number: 1, title: "Chọn bác sĩ", icon: User },
    { number: 2, title: "Chọn thời gian", icon: Clock },
    { number: 3, title: "Xác nhận", icon: CheckCircle },
  ];

  // Success Modal
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Đặt lịch thành công!
          </h2>
          <p className="text-gray-600 mb-6">
            Lịch hẹn của bạn đã được xác nhận. Chúng tôi sẽ gửi thông báo nhắc
            nhở trước giờ khám.
          </p>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{selectedDoctor?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{formatDate(formData.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{formData.time}</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(PAGES.APPOINTMENTS)}
          >
            Xem lịch hẹn
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() =>
                step > 1 ? setStep(step - 1) : navigate(PAGES.HOME)
              }
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{step > 1 ? "Quay lại" : "Trang chủ"}</span>
            </button>

            <h1 className="text-xl font-bold text-gray-900">Đặt lịch khám</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <Card className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.number
                        ? "bg-blue-600 text-white scale-110 shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <s.icon className="w-6 h-6" />
                    )}
                  </div>
                  <p
                    className={`text-sm mt-2 font-medium hidden sm:block ${
                      step >= s.number ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {s.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step > s.number ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* Step 1: Doctor Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Chọn bác sĩ
              </h2>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm bác sĩ theo tên hoặc chuyên khoa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Doctors List */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    hover
                    onClick={() => handleChange("doctorId", doctor.id)}
                    className={`cursor-pointer border-2 transition-all ${
                      formData.doctorId === doctor.id
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 shadow-lg">
                        {doctor.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {doctor.name}
                        </h3>
                        <p className="text-blue-600 font-medium text-sm mb-2">
                          {doctor.specialty}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {doctor.averageRating || "0.0"}
                            {doctor.totalReviews > 0 && (
                              <span className="text-gray-400">
                                ({doctor.totalReviews})
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {doctor.experience || "N/A"} năm
                          </span>
                        </div>

                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(doctor.consultationFee)}
                        </p>
                      </div>

                      {formData.doctorId === doctor.id && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {errors.doctorId && (
                <p className="text-red-600 text-sm mt-4">{errors.doctorId}</p>
              )}
            </Card>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleNext}
              disabled={!formData.doctorId}
              icon={ArrowRight}
              iconPosition="right"
            >
              Tiếp tục
            </Button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Chọn ngày và giờ khám
              </h2>

              {/* Selected Doctor Info */}
              {selectedDoctor && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{selectedDoctor.avatar}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {selectedDoctor.name}
                      </h3>
                      <p className="text-blue-600 text-sm">
                        {selectedDoctor.specialty}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Date Selection */}
              <div className="mb-6">
                <Input
                  type="date"
                  label="Chọn ngày khám"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  min={getMinDate()}
                  error={errors.date}
                  icon={Calendar}
                  required
                  helperText="Chọn ngày bạn muốn đến khám"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn khung giờ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(availableSlots.length ? availableSlots : TIME_SLOTS).map(
                    (time) => {
                      const available = formData.date
                        ? isSlotAvailable(
                            formData.doctorId,
                            formData.date,
                            time
                          )
                        : true;
                      return (
                        <button
                          key={time}
                          onClick={() =>
                            available && handleChange("time", time)
                          }
                          disabled={!available}
                          className={`py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                            formData.time === time
                              ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                              : available
                              ? "border-gray-200 hover:border-blue-500 hover:shadow-md"
                              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Clock className="w-4 h-4 inline mr-1" />
                          {time}
                          {!available && (
                            <span className="block text-xs mt-1">Đã đầy</span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
                {errors.time && (
                  <p className="text-red-600 text-sm mt-2">{errors.time}</p>
                )}
              </div>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
                icon={ArrowLeft}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                disabled={!formData.date || !formData.time}
                icon={ArrowRight}
                iconPosition="right"
                className="flex-1"
              >
                Tiếp tục
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Xác nhận thông tin
              </h2>

              <div className="space-y-6">
                <Input
                  label="Lý do khám bệnh"
                  placeholder="Ví dụ: Đau đầu, khám tổng quát..."
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  error={errors.type}
                  icon={FileText}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú thêm (tùy chọn)
                  </label>
                  <textarea
                    placeholder="Mô tả triệu chứng hoặc thông tin bổ sung..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="4"
                  />
                </div>

                {/* Summary */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Tóm tắt đặt lịch
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <User className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Bác sĩ</p>
                        <p className="font-semibold text-gray-900">
                          {selectedDoctor?.name}
                        </p>
                        <p className="text-sm text-blue-600">
                          {selectedDoctor?.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Ngày khám</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(formData.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Giờ khám</p>
                        <p className="font-semibold text-gray-900">
                          {formData.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Địa điểm</p>
                        <p className="font-semibold text-gray-900">
                          STL Clinic
                        </p>
                        <p className="text-sm text-gray-600">
                          123 Đường ABC, Q.1, TP.HCM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> Vui lòng đến trước giờ hẹn 15 phút.
                    Mang theo CMND/CCCD và sổ khám bệnh (nếu có).
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(2)}
                icon={ArrowLeft}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                icon={CheckCircle}
                iconPosition="right"
                className="flex-1"
              >
                Xác nhận đặt lịch
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingPage;
