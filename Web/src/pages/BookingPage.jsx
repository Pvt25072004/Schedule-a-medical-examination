import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
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
import { useNotification } from "../contexts/NotificationContext";
import { createAppointment as apiCreateAppointment, getAvailableTimes } from "../services/appointments.api";
import { getSchedulesByDoctor } from "../services/doctor.schedules.api";
import { createVnpayUrl, createPayosUrl } from "../services/payments.api";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ProgressBar from "../components/common/ProgressBar";
import { PAGES, TIME_SLOTS } from "../utils/constants";
import { formatDate, formatCurrency } from "../utils/helpers";
import { getDoctors as getDoctorsApi } from "../services/admin.doctors.api";

const BookingPage = ({ navigate }) => {
  const { addAppointment, isSlotAvailable } = useAppointments();
  const { user } = useAuth();
  const { showError, showSuccess: showSuccessToast, showInfo } = useNotification();
  const location = useLocation();
  const initialDoctorId = location.state?.doctorId || "";

  const [availableSlots, setAvailableSlots] = useState([]);
  const [backendAvailableTimes, setBackendAvailableTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [step, setStep] = useState(1); // 1: Date/Time, 2: Confirm
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    doctorId: initialDoctorId,
    date: "",
    time: "",
    type: "",
    notes: "",
    bookingFor: "self",
    patientName: "",
    patientPhone: "",
    patientGender: "Nam",
    patientDob: "",
    patientAddress: "",
    relationship: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    if (!initialDoctorId) {
      navigate(PAGES.DOCTORS);
    }
  }, [initialDoctorId, navigate]);

  useEffect(() => {
    if (formData.doctorId && formData.date) {
      loadSlotsFromSchedules(formData.doctorId, formData.date);
    }
  }, [formData.doctorId, formData.date]);

  const doctorsWithRatings = useMemo(() => {
    return doctors.map((doctor) => ({
      ...doctor,
      averageRating: Number(doctor.rating || 5).toFixed(1),
      totalReviews: doctor.review_count || 0,
    }));
  }, [doctors]);

  const selectedDoctor = doctorsWithRatings.find(
    (d) => String(d.id) === String(formData.doctorId)
  );
  const selectedHospital = selectedDoctor?.hospitals?.[0];
  const doctorFee = Number(selectedDoctor?.consultation_fee) || Number(selectedDoctor?.consultationFee) || 0;
  const hospitalFee = Number(selectedHospital?.facility_fee) || 0;
  const totalPrice = (doctorFee + hospitalFee) || 500000;

  const filteredDoctors = doctorsWithRatings.filter((doctor) => {
    const name = (doctor.name || "").toLowerCase();
    const specialty = (
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
        const list = Array.isArray(data) ? data : (data?.data || []);
        // Chuẩn hóa một số field để dùng cho UI
        const normalized = list.map((d) => ({
          ...d,
          name: d.name || d.user?.full_name || "Bác sĩ",
          avatar_url: d.avatar_url || d.user?.avatar_url || null,
          specialty: d.category?.name || "Đa khoa",
          consultationFee: d.consultation_fee || d.consultationFee || d.price || 500000,
        }));
        setDoctors(normalized);
      } catch (e) {
        console.error("Load doctors for booking error:", e);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };
    void loadDoctors();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const formatLocalDate = (dateInput) => {
    if (!dateInput) return "";
    // If it's already a simple YYYY-MM-DD string, just return it
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return dateInput;
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput).slice(0, 10);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadSlotsFromSchedules = async (doctorId, date) => {
    if (!doctorId || !date) return;
    try {
      setLoadingSlots(true);
      const [schedulesData, availableTimesData] = await Promise.all([
        getSchedulesByDoctor(doctorId),
        getAvailableTimes(doctorId, date)
      ]);
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      setBackendAvailableTimes(Array.isArray(availableTimesData) ? availableTimesData : []);
      const daySchedules = (schedulesData || []).filter((s) => {
        const workDate = formatLocalDate(s.work_date);
        return workDate === date && s.is_available === true;
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
      setSchedules([]);
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
    if (formData.bookingFor === 'other') {
      if (!formData.patientName) newErrors.patientName = "Vui lòng nhập họ tên người bệnh";
      if (!formData.patientPhone) newErrors.patientPhone = "Vui lòng nhập số điện thoại";
      if (!formData.patientDob) newErrors.patientDob = "Vui lòng chọn ngày sinh";
      if (!formData.relationship) newErrors.relationship = "Vui lòng chọn mối quan hệ";
    }
    return newErrors;
  };

  const handleNext = () => {
    if (step === 1 && (!formData.date || !formData.time)) {
      setErrors({ date: "Vui lòng chọn đầy đủ ngày và giờ" });
      return;
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
      showInfo("Bạn cần đăng nhập trước khi đặt lịch");
      return;
    }

    setIsLoading(true);

    try {
      console.log("ALL SCHEDULES:", schedules);

      const workDate = formData.date;

      const appointmentTime =
        formData.time.length === 5 ? `${formData.time}:00` : formData.time;

      // tìm schedule theo ngày
      const foundSchedule = schedules.find((sch) => {
        const schDate = formatLocalDate(sch.work_date);

        const start =
          sch.start_time?.length === 5
            ? `${sch.start_time}:00`
            : sch.start_time?.slice(0, 8);

        const end =
          sch.end_time?.length === 5
            ? `${sch.end_time}:00`
            : sch.end_time?.slice(0, 8);

        console.log({
          schId: sch.id,
          schDate,
          workDate,
          start,
          end,
          appointmentTime,
        });

        return (
          schDate === workDate &&
          appointmentTime >= start &&
          appointmentTime < end &&
          sch.is_available === true
        );
      });

      console.log("FOUND SCHEDULE:", foundSchedule);

      if (!foundSchedule) {
        showError("Ngày bạn chọn chưa có lịch làm việc của bác sĩ. Hãy chọn ngày khác.");
        return;
      }

      const payload = {
        user_id: Number(user.id),
        doctor_id: Number(formData.doctorId),
        hospital_id: Number(foundSchedule.hospital_id),
        schedule_id: Number(foundSchedule.id),
        appointment_date: workDate,
        appointment_time: formData.time,
        examination_type: "offline",
        symptoms: formData.type + (formData.notes ? ` - ${formData.notes}` : ""),
      };

      if (formData.bookingFor === "other") {
        payload.patient_name = formData.patientName;
        payload.patient_phone = formData.patientPhone;
        payload.patient_gender = formData.patientGender;
        payload.patient_dob = formData.patientDob;
        payload.patient_address = formData.patientAddress;
        payload.relationship = formData.relationship;
      } else {
        payload.relationship = "Bản thân";
      }

      const created = await apiCreateAppointment(payload);

      console.log("CREATED:", created);

      if (paymentMethod === "vnpay") {
        try {
          const vnpayResponse = await createVnpayUrl({
            appointment_id: created?.id,
            amount: totalPrice,
            orderInfo: `Thanh toan lich kham web ${created?.id}`
          });
          if (vnpayResponse?.url) {
            window.location.href = vnpayResponse.url;
            return;
          }
        } catch (err) {
          console.warn("VNPAY URL creation failed:", err);
          showError("Không thể tạo URL thanh toán VNPAY, vui lòng thử lại sau.");
          return;
        }
      }

      if (paymentMethod === "payos") {
        try {
          const payosResponse = await createPayosUrl({
            appointment_id: created?.id,
            amount: totalPrice,
            orderInfo: `Thanh toan lich kham ${created?.id}`
          });
          if (payosResponse?.url) {
            window.location.href = payosResponse.url;
            return;
          }
        } catch (err) {
          console.warn("PayOS URL creation failed:", err);
          showError("Không thể tạo URL thanh toán PayOS, vui lòng thử lại sau.");
          return;
        }
      }

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

      setShowSuccess(true);

      setTimeout(() => {
        navigate(PAGES.APPOINTMENTS);
      }, 2000);
    } catch (error) {
      console.error(error);
      showError(error?.response?.data?.message || error.message || "Không thể tạo lịch hẹn");
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const steps = [
    { number: 1, title: "Chọn thời gian", icon: Clock },
    { number: 2, title: "Xác nhận", icon: CheckCircle },
  ];

  // Success Modal
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-br from-green-400 to-green-600 p-8 text-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <CheckCircle className="w-14 h-14 text-white drop-shadow-md" />
            </div>
            <h2 className="text-3xl font-bold mb-2 drop-shadow-md">
              Đặt lịch thành công!
            </h2>
            <p className="text-green-50 font-medium">
              Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi
            </p>
          </div>

          <div className="p-8">
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-500 font-medium flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> Bác sĩ</span>
                  <span className="font-bold text-gray-900">{selectedDoctor?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-500 font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> Ngày khám</span>
                  <span className="font-bold text-gray-900">{formatDate(formData.date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> Giờ khám</span>
                  <span className="font-bold text-gray-900">{formData.time}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
              Chúng tôi sẽ gửi tin nhắn SMS và Email thông báo chi tiết lịch hẹn đến bạn. Vui lòng kiểm tra hộp thư!
            </p>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate(PAGES.APPOINTMENTS)}
              className="py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Xem danh sách lịch hẹn
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header is managed globally in AppRoutes */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <ProgressBar
          steps={steps}
          currentStep={step}
          onStepClick={(n) => {
            if (n < step) setStep(n);
          }}
        />

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Chọn ngày và giờ khám
              </h2>

              {/* Selected Doctor Info */}
              {selectedDoctor && (
                <div className="relative overflow-hidden p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl mb-8 shadow-lg text-white">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-blue-400 opacity-20 rounded-full blur-xl"></div>

                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/20 p-1 rounded-2xl flex-shrink-0 backdrop-blur-sm">
                      <div className="w-full h-full bg-white rounded-xl flex items-center justify-center text-4xl overflow-hidden shadow-inner">
                        {selectedDoctor.avatar_url ? (
                          <img src={selectedDoctor.avatar_url} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                        ) : (
                          selectedDoctor.avatar || "👨‍⚕️"
                        )}
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-md mb-2">
                        Bác sĩ Phụ trách
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-1">
                        {selectedDoctor.name}
                      </h3>
                      <p className="text-blue-100 font-medium mb-4 flex items-center justify-center sm:justify-start gap-2">
                        <Award className="w-4 h-4" /> {selectedDoctor.specialty}
                      </p>

                      {Array.isArray(selectedDoctor.hospitals) && selectedDoctor.hospitals.length > 0 && (
                        <div className="flex flex-col gap-1 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-md text-sm w-full sm:w-auto text-left">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-200 flex-shrink-0" />
                            <span className="font-semibold">{selectedDoctor.hospitals[0].name}</span>
                          </div>
                          {selectedDoctor.hospitals[0].address && (
                            <span className="text-blue-100 text-xs pl-6">
                              {selectedDoctor.hospitals[0].address}
                              {selectedDoctor.hospitals[0].city ? ` - ${typeof selectedDoctor.hospitals[0].city === 'string' ? selectedDoctor.hospitals[0].city : selectedDoctor.hospitals[0].city?.name}` : ''}
                            </span>
                          )}
                        </div>
                      )}
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
                <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Chọn khung giờ khám <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((time) => {
                      const available = formData.date
                        ? backendAvailableTimes.includes(time)
                        : true;

                      const isSelected = formData.time === time;

                      return (
                        <button
                          key={time}
                          onClick={() =>
                            available && handleChange("time", time)
                          }
                          disabled={!available}
                          className={`relative py-3 px-2 rounded-xl border-2 transition-all font-semibold text-sm flex flex-col items-center justify-center gap-1 ${isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 transform scale-105 z-10"
                            : available
                              ? "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                              : "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                            }`}
                        >
                          <span className="text-base">{time}</span>
                          {!available && (
                            <span className="text-[10px] font-medium uppercase tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded-full absolute -top-2">Đã kín</span>
                          )}
                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <CheckCircle className="w-3 h-3 text-blue-600" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 px-4 bg-gray-50 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-gray-700 mb-1">Chưa có lịch khám</h3>
                      <p className="text-gray-500">Bác sĩ chưa có lịch làm việc trong ngày này. Vui lòng chọn một ngày khác.</p>
                    </div>
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
                onClick={() => navigate(-1)}
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

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Xác nhận thông tin
              </h2>

              <div className="space-y-6">

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 border-t border-gray-200 pt-6">Thông tin người khám</h3>

                  <div className="mb-6 flex gap-4 border-b border-gray-200 pb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="bookingFor" value="self" checked={formData.bookingFor === 'self'} onChange={() => handleChange("bookingFor", "self")} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="font-medium text-gray-700">Đặt cho bản thân</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="bookingFor" value="other" checked={formData.bookingFor === 'other'} onChange={() => handleChange("bookingFor", "other")} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="font-medium text-gray-700">Đặt cho người thân</span>
                    </label>
                  </div>

                  {formData.bookingFor === "other" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100 animate-fade-in">
                      <Input label="Họ và tên người bệnh *" value={formData.patientName} onChange={(e) => handleChange("patientName", e.target.value)} error={errors.patientName} />
                      <Input label="Số điện thoại *" value={formData.patientPhone} onChange={(e) => handleChange("patientPhone", e.target.value)} error={errors.patientPhone} />
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính *</label>
                        <select value={formData.patientGender} onChange={(e) => handleChange("patientGender", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                      <Input type="date" label="Ngày sinh *" value={formData.patientDob} onChange={(e) => handleChange("patientDob", e.target.value)} error={errors.patientDob} max={new Date().toISOString().slice(0, 10)} />
                      <Input label="Địa chỉ" value={formData.patientAddress} onChange={(e) => handleChange("patientAddress", e.target.value)} />
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mối quan hệ *</label>
                        <select value={formData.relationship} onChange={(e) => handleChange("relationship", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="">-- Chọn mối quan hệ --</option>
                          <option value="Vợ/Chồng">Vợ/Chồng</option>
                          <option value="Con">Con</option>
                          <option value="Bố/Mẹ">Bố/Mẹ</option>
                          <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                          <option value="Ông/Bà">Ông/Bà</option>
                          <option value="Khác">Khác</option>
                        </select>
                        {errors.relationship && <p className="text-red-600 text-sm mt-1">{errors.relationship}</p>}
                      </div>
                    </div>
                  )}
                </div>

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

                {/* Summary - Receipt Style */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Phiếu Tóm Tắt Đặt Lịch
                  </h3>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
                    {/* Decorative receipt edge */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSI4Ij48cGF0aCBkPSJNMCAwTDEwIDhsMTAtOFYwaC0yMHoiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=')] bg-repeat-x"></div>

                    <div className="p-6 sm:p-8 pt-10">
                      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl shadow-inner">
                          {selectedDoctor?.avatar_url ? (
                            <img src={selectedDoctor.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            selectedDoctor?.avatar || "👨‍⚕️"
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium mb-1">Bác sĩ phụ trách</p>
                          <h4 className="text-xl font-bold text-gray-900">{selectedDoctor?.name}</h4>
                          <p className="text-blue-600 text-sm font-medium">{selectedDoctor?.specialty}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 pb-8 border-b border-dashed border-gray-200">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Ngày khám</p>
                            <p className="text-lg font-bold text-gray-900">{formatDate(formData.date)}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Giờ khám</p>
                            <p className="text-lg font-bold text-gray-900">{formData.time}</p>
                          </div>
                        </div>

                        <div className="flex gap-4 md:col-span-2">
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Địa điểm khám</p>
                            {Array.isArray(selectedDoctor?.hospitals) && selectedDoctor.hospitals.length > 0 ? (
                              <>
                                <p className="text-lg font-bold text-gray-900">{selectedDoctor.hospitals[0].name}</p>
                                <p className="text-gray-600 mt-1">{selectedDoctor.hospitals[0].address}</p>
                                {selectedDoctor.hospitals[0].city && <p className="text-blue-600 font-medium text-sm mt-0.5">{typeof selectedDoctor.hospitals[0].city === 'string' ? selectedDoctor.hospitals[0].city : selectedDoctor.hospitals[0].city?.name}</p>}
                              </>
                            ) : (
                              <>
                                <p className="text-lg font-bold text-gray-900">STL Clinic</p>
                                <p className="text-gray-600 mt-1">123 Đường ABC, Q.1, TP.HCM</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-6 mb-6">
                        <span className="text-gray-500 font-medium">Phí khám dự kiến</span>
                        <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
                      </div>

                      <h4 className="font-bold text-gray-900 mb-4">Phương thức thanh toán</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => setPaymentMethod("vnpay")}
                          className={`relative p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${paymentMethod === "vnpay" ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-blue-300"
                            }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">VNP</div>
                          <div className="flex-1">
                            <p className={`font-bold ${paymentMethod === "vnpay" ? "text-blue-800" : "text-gray-900"}`}>Thanh toán trực tuyến</p>
                            <p className="text-sm text-gray-500">Qua cổng VNPAY</p>
                          </div>
                          {paymentMethod === "vnpay" && <CheckCircle className="w-6 h-6 text-blue-600 absolute right-4 top-1/2 -translate-y-1/2" />}
                        </button>

                        <button
                          onClick={() => setPaymentMethod("payos")}
                          className={`relative p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${paymentMethod === "payos" ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-blue-300"
                            }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">QR</div>
                          <div className="flex-1">
                            <p className={`font-bold ${paymentMethod === "payos" ? "text-indigo-800" : "text-gray-900"}`}>Chuyển khoản VietQR</p>
                            <p className="text-sm text-gray-500">Qua cổng PayOS</p>
                          </div>
                          {paymentMethod === "payos" && <CheckCircle className="w-6 h-6 text-indigo-600 absolute right-4 top-1/2 -translate-y-1/2" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl flex gap-3">
                  <Star className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    <strong>Lưu ý quan trọng:</strong> Vui lòng đến trước giờ hẹn <strong>15 phút</strong> để làm thủ tục.
                    Hãy mang theo CMND/CCCD hoặc giấy tờ tùy thân, cùng sổ khám bệnh/kết quả xét nghiệm cũ (nếu có).
                  </p>
                </div>
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
