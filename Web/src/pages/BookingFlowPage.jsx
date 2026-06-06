import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  MapPin,
  Building,
  Stethoscope,
  User,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  Search,
  Star,
  Award,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { useAppointments } from "../contexts/AppointmentContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { createAppointment as apiCreateAppointment } from "../services/appointments.api";
import { getSchedulesByDoctor, getAvailableTimes } from "../services/doctor.schedules.api";
import { createPaymentDemo, createVnpayUrl, createPayosUrl } from "../services/payments.api";
import { getDoctors as getDoctorsApi } from "../services/admin.doctors.api";
import { getHospitals } from "../services/admin.hospitals.api";
import { getCategories } from "../services/admin.categories.api";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ProgressBar from "../components/common/ProgressBar";
import { PAGES, REGIONS } from "../utils/constants";
import { formatCurrency, formatDate, removeDiacritics, getCategoryIcon } from "../utils/helpers";

const BookingFlowPage = ({ navigate }) => {
  const { addAppointment, isSlotAvailable } = useAppointments();
  const { user } = useAuth();
  const { showError, showSuccess: showSuccessToast, showInfo } = useNotification();
  const location = useLocation();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    region: "",
    city: "",
    hospitalId: "",
    specialty: "",
    doctorId: "",
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
  
  const [hospitals, setHospitals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true);
        const [hospData, catData, docData] = await Promise.all([
          getHospitals(),
          getCategories(),
          getDoctorsApi()
        ]);
        
        setHospitals(Array.isArray(hospData) ? hospData : []);
        setCategories(Array.isArray(catData) ? catData : []);
        
        const list = Array.isArray(docData) ? docData : (docData?.data || []);
        const normalized = list.map((d) => ({
          ...d,
          name: d.name || d.user?.full_name || "Bác sĩ",
          avatar_url: d.avatar_url || d.user?.avatar_url || null,
          specialty: d.category?.name || "Đa khoa",
          consultationFee: d.consultation_fee || d.consultationFee || d.price || 500000,
        }));
        setDoctors(normalized);
      } catch (err) {
        console.error("Error loading booking flow data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!loadingData && location.state?.aiBookingData && doctors.length > 0 && hospitals.length > 0) {
      const data = location.state.aiBookingData;
      setFormData(prev => ({
        ...prev,
        city: data.hospitalName?.toLowerCase().includes("đà nẵng") ? "Đà Nẵng" : "TP. Hồ Chí Minh",
        hospitalId: data.hospitalId,
        specialty: data.specialty || "",
        doctorId: data.doctorId,
        date: data.date,
        time: data.time,
        type: data.symptoms || "Đăng ký khám qua trợ lý AI",
      }));
      setStep(8);
      // Xóa state để tránh vòng lặp nếu reload trang
      window.history.replaceState({}, document.title);
      return;
    }

    if (!loadingData && location.state?.doctorId && doctors.length > 0) {
      const doc = doctors.find((d) => d.id === location.state.doctorId);
      if (doc) {
        const hospitalId = doc.hospitals && doc.hospitals.length > 0 ? doc.hospitals[0].id : "";
        setFormData((prev) => ({
          ...prev,
          doctorId: doc.id,
          specialty: doc.specialty || "",
          hospitalId: hospitalId,
        }));
        setStep(5);
      }
    }
  }, [loadingData, location.state, doctors, hospitals]);

  const doctorsWithRatings = useMemo(() => {
    return doctors.map((doctor) => ({
      ...doctor,
      averageRating: Number(doctor.rating || 5).toFixed(1),
      totalReviews: doctor.review_count || 0,
    }));
  }, [doctors]);

  // Lọc danh sách tỉnh dựa trên miền
  const availableCities = useMemo(() => {
    if (!formData.region) return [];
    const citiesInRegion = hospitals
      .filter(h => h.city && h.city.area === formData.region)
      .map(h => h.city.name)
      .filter(Boolean);
    return [...new Set(citiesInRegion)].sort();
  }, [hospitals, formData.region]);

  // Filters based on previous steps
  const filteredHospitals = useMemo(() => {
    if (!formData.city) return hospitals;
    return hospitals.filter(h => h.city && h.city.name === formData.city);
  }, [hospitals, formData.city]);

  const filteredDoctors = useMemo(() => {
    let result = doctorsWithRatings;
    
    if (formData.hospitalId) {
      result = result.filter(d => 
        d.hospitals?.some(h => String(h.id) === String(formData.hospitalId))
      );
    }
    
    if (formData.specialty) {
      result = result.filter(d => d.specialty === formData.specialty);
    }
    
    if (searchQuery) {
      const q = removeDiacritics(searchQuery);
      result = result.filter(d => 
        removeDiacritics(d.name || "").includes(q) || 
        removeDiacritics(d.specialty || "").includes(q)
      );
    }
    
    return result;
  }, [doctorsWithRatings, formData.hospitalId, formData.specialty, searchQuery]);

  const selectedDoctor = doctorsWithRatings.find(d => d.id === formData.doctorId);
  const selectedHospital = hospitals.find(h => String(h.id) === String(formData.hospitalId));
  const totalPrice = (Number(selectedDoctor?.consultationFee) || 0) + (Number(selectedHospital?.facility_fee) || 0);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    
    // Auto advance for some steps
    // Removed auto-advance for 'city' to allow double-click confirmation
    if (field === 'hospitalId' && step === 2) handleNext(3);
    if (field === 'specialty' && step === 3) handleNext(4);
  };

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatLocalDate = (dateInput) => {
    if (!dateInput) return "";
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;
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
      // Gọi API Backend để lấy danh sách giờ trống chuẩn xác thay vì xử lý ở Client
      const slots = await getAvailableTimes(doctorId, date);
      setAvailableSlots(Array.isArray(slots) ? slots : []);
      
      // Vẫn fetch schedules để dùng cho bước Confirm (hoặc API create cần)
      const schedulesData = await getSchedulesByDoctor(doctorId);
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
    } catch (err) {
      console.error("Load available slots error:", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (formData.doctorId && formData.date && (step === 5 || step === 8)) {
      loadSlotsFromSchedules(formData.doctorId, formData.date);
      if (step === 5) {
        setFormData(prev => ({...prev, time: ""})); // Only reset time when manually selecting date
      }
    }
  }, [formData.doctorId, formData.date, step]);

  const handleNext = (nextStepTarget = step + 1) => {
    // Validation before advancing
    if (step === 1 && !formData.city) return setErrors({ city: "Vui lòng chọn khu vực" });
    if (step === 2 && !formData.hospitalId) return setErrors({ hospitalId: "Vui lòng chọn cơ sở y tế" });
    if (step === 3 && !formData.specialty) return setErrors({ specialty: "Vui lòng chọn chuyên khoa" });
    if (step === 4 && !formData.doctorId) return setErrors({ doctorId: "Vui lòng chọn bác sĩ" });
    if (step === 5 && !formData.date) return setErrors({ date: "Vui lòng chọn ngày khám" });
    if (step === 6 && !formData.time) return setErrors({ time: "Vui lòng chọn giờ khám" });
    if (step === 7) {
      if (!formData.type) return setErrors({ type: "Vui lòng nhập lý do khám" });
      if (formData.bookingFor === 'other') {
        let errs = {};
        if (!formData.patientName) errs.patientName = "Vui lòng nhập họ tên người bệnh";
        if (!formData.patientPhone) errs.patientPhone = "Vui lòng nhập số điện thoại";
        if (!formData.patientDob) errs.patientDob = "Vui lòng chọn ngày sinh";
        if (!formData.relationship) errs.relationship = "Vui lòng chọn mối quan hệ";
        if (Object.keys(errs).length > 0) return setErrors(errs);
      }
    }
    
    setStep(nextStepTarget);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      showInfo("Bạn cần đăng nhập trước khi đặt lịch");
      navigate(PAGES.LOGIN);
      return;
    }

    setIsSubmitting(true);
    try {
      const workDate = formData.date;
      const appointmentTime = formData.time.length === 5 ? `${formData.time}:00` : formData.time;

      const foundSchedule = schedules.find((sch) => {
        const schDate = formatLocalDate(sch.work_date);
        const start = sch.start_time?.length === 5 ? `${sch.start_time}:00` : sch.start_time?.slice(0, 8);
        const end = sch.end_time?.length === 5 ? `${sch.end_time}:00` : sch.end_time?.slice(0, 8);
        return schDate === workDate && appointmentTime >= start && appointmentTime < end;
      });

      if (!foundSchedule) {
        showError("Lịch khám không hợp lệ hoặc đã bị hủy. Vui lòng chọn lại giờ.");
        setIsSubmitting(false);
        setStep(6);
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
        symptoms: formData.type,
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

      if (paymentMethod === "vnpay") {
        try {
          const vnpayResponse = await createVnpayUrl({
            appointment_id: created?.id,
            amount: totalPrice || 500000,
            orderInfo: `Thanh toan lich kham web ${created?.id}`
          });
          if (vnpayResponse?.url) {
            window.location.href = vnpayResponse.url;
            return;
          }
        } catch (err) {
          console.warn("VNPAY URL creation failed:", err);
          showError("Không thể tạo URL thanh toán VNPAY, hệ thống sẽ ghi nhận thanh toán tiền mặt.");
        }
      }

      if (paymentMethod === "payos") {
        try {
          const payosResponse = await createPayosUrl({
            appointment_id: created?.id,
            amount: totalPrice || 500000,
            orderInfo: `Thanh toan lich kham ${created?.id}`
          });
          if (payosResponse?.url) {
            window.location.href = payosResponse.url;
            return;
          }
        } catch (err) {
          console.warn("PayOS URL creation failed:", err);
          showError("Không thể tạo URL thanh toán PayOS, hệ thống sẽ ghi nhận thanh toán tiền mặt.");
        }
      }

      try {
        await createPaymentDemo({
          appointment_id: created?.id,
          amount: totalPrice || 500000,
          base_fee: totalPrice || 500000,
          payment_method: "cash",
        });
      } catch (err) {
        console.warn("Demo payment failed:", err);
      }

      setShowSuccess(true);
      setTimeout(() => navigate(PAGES.APPOINTMENTS), 2000);
    } catch (error) {
      console.error(error);
      showError(error?.response?.data?.message || "Không thể tạo lịch hẹn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Khu vực", icon: MapPin },
    { number: 2, title: "Cơ sở", icon: Building },
    { number: 3, title: "Chuyên khoa", icon: Stethoscope },
    { number: 4, title: "Bác sĩ", icon: User },
    { number: 5, title: "Ngày", icon: Calendar },
    { number: 6, title: "Giờ", icon: Clock },
    { number: 7, title: "Hồ sơ", icon: FileText },
    { number: 8, title: "Xác nhận", icon: CheckCircle },
  ];

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
                  <span className="text-gray-500 font-medium flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> Bác sĩ</span>
                  <span className="font-bold text-gray-900">{selectedDoctor?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-500 font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400"/> Ngày khám</span>
                  <span className="font-bold text-gray-900">{formatDate(formData.date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400"/> Giờ khám</span>
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

  if (loadingData) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Đặt lịch khám bệnh</h2>
          <p className="text-gray-600">Vui lòng hoàn thành các bước dưới đây để đặt lịch</p>
        </div>

        <ProgressBar 
          steps={steps} 
          currentStep={step} 
          onStepClick={(n) => {
            // Only allow clicking back to completed steps
            if (n < step) {
              setStep(n);
            }
          }} 
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          
          {/* STEP 1: Region & City */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Chọn Khu vực</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {REGIONS.map(region => {
                  const isSelected = formData.region === region.label;
                  return (
                  <button
                    key={region.value}
                    onClick={() => { 
                      setFormData(prev => ({ ...prev, region: region.label, city: "" })); 
                      if (errors.region) setErrors(prev => ({ ...prev, region: "" }));
                    }}
                    className={`relative p-5 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center gap-3 overflow-hidden ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md transform scale-[1.02]' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <MapPin className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <span className="font-semibold text-lg">{region.label}</span>
                    
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-blue-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                )})}
              </div>

              {formData.region && (
                <div className="mt-8 animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Chọn Tỉnh / Thành phố</h3>
                  {availableCities.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {availableCities.map(city => {
                        const isSelected = formData.city === city;
                        return (
                          <button
                            key={city}
                            onClick={() => {
                              if (isSelected) {
                                handleNext(2);
                              } else {
                                handleChange("city", city);
                              }
                            }}
                            className={`px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                          >
                            {city}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Không có cơ sở y tế nào thuộc khu vực này.</p>
                  )}
                </div>
              )}

              <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                <Button variant="primary" disabled={!formData.city} onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </div>
          )}

          {/* STEP 2: Hospital */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Chọn Cơ sở y tế tại {formData.city}</h3>
              {filteredHospitals.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredHospitals.map(hospital => {
                    const isSelected = String(formData.hospitalId) === String(hospital.id);
                    return (
                    <button
                      key={hospital.id}
                      onClick={() => handleChange("hospitalId", hospital.id)}
                      className={`relative p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.01]' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Building className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 pr-6">
                        <h4 className={`font-bold text-lg mb-1 ${isSelected ? 'text-blue-800' : 'text-gray-900'}`}>{hospital.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{hospital.address}</p>
                      </div>
                      
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-blue-600">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  )})}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">Không có cơ sở y tế nào tại khu vực này.</div>
              )}
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <Button variant="primary" disabled={!formData.hospitalId} onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </div>
          )}

          {/* STEP 3: Specialty */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chọn Chuyên khoa</h3>
              <p className="text-gray-500 mb-6">Tại {selectedHospital?.name}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map(cat => {
                  const isSelected = formData.specialty === cat.name;
                  return (
                  <button
                    key={cat.id}
                    onClick={() => handleChange("specialty", cat.name)}
                    className={`relative p-5 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md transform scale-[1.02]' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm text-gray-700'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-colors ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {cat.icon || getCategoryIcon(cat.name)}
                    </div>
                    <span className="font-semibold text-sm sm:text-base leading-tight">{cat.name}</span>
                    
                    {isSelected && (
                      <div className="absolute top-2 right-2 text-blue-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                )})}
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <Button variant="primary" disabled={!formData.specialty} onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </div>
          )}

          {/* STEP 4: Doctor */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chọn Bác sĩ</h3>
              <p className="text-gray-500 mb-6">Chuyên khoa {formData.specialty}</p>

              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm tên bác sĩ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {filteredDoctors.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {filteredDoctors.map(doctor => (
                    <div
                      key={doctor.id}
                      onClick={() => handleChange("doctorId", doctor.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.doctorId === doctor.id
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                          {doctor.avatar_url ? (
                            <img
                              src={doctor.avatar_url}
                              alt={doctor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            doctor.avatar || "👨‍⚕️"
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-bold text-gray-900 text-lg">{doctor.name}</h4>
                            {formData.doctorId === doctor.id && <CheckCircle className="text-blue-600 w-6 h-6" />}
                          </div>
                          <p className="text-blue-600 font-medium text-sm mb-1">{doctor.specialty}</p>
                          <div className="flex gap-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-current"/> {doctor.averageRating}</span>
                            <span className="flex items-center gap-1"><Award className="w-4 h-4"/> {doctor.experience} năm</span>
                          </div>
                          <div className="font-medium text-gray-900">{formatCurrency(Number(doctor.consultationFee || 0) + Number(hospitals.find(h => String(h.id) === String(formData.hospitalId))?.facility_fee || 0))}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">Không tìm thấy bác sĩ nào phù hợp.</div>
              )}

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <Button variant="primary" disabled={!formData.doctorId} onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </div>
          )}

          {/* STEP 5: Date */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Chọn Ngày khám</h3>
              
              <Input
                type="date"
                label="Ngày khám"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                min={getMinDate()}
                error={errors.date}
                icon={Calendar}
                required
              />

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <Button variant="primary" disabled={!formData.date} onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </div>
          )}

          {/* STEP 6: Time */}
          {step === 6 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chọn Khung giờ</h3>
              <p className="text-gray-500 mb-6">Ngày {formatDate(formData.date)}</p>

              {loadingSlots ? (
                <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  Đang tải lịch trống...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {availableSlots.map(time => {
                    const isSelected = formData.time === time;
                    return (
                      <button
                        key={time}
                        onClick={() => handleChange("time", time)}
                        className={`relative py-3 px-2 rounded-xl border-2 transition-all font-semibold text-sm flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 transform scale-105 z-10"
                            : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <span className="text-base">{time}</span>
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <CheckCircle className="w-3 h-3 text-blue-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="col-span-full py-12 px-4 bg-gray-50 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                   <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                   <h3 className="text-lg font-bold text-gray-700 mb-1">Chưa có lịch khám</h3>
                   <p className="text-gray-500">Bác sĩ chưa có lịch làm việc trong ngày này. Vui lòng chọn một ngày khác.</p>
                </div>
              )}
              {errors.time && <p className="text-red-500 text-sm mt-2">{errors.time}</p>}

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(5)}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <Button variant="primary" disabled={!formData.time} onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </div>
          )}

          {/* STEP 7: Profile / Symptoms */}
          {step === 7 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Thông tin người khám</h3>
              
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
                    <select value={formData.patientGender} onChange={(e) => handleChange("patientGender", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <Input type="date" label="Ngày sinh *" value={formData.patientDob} onChange={(e) => handleChange("patientDob", e.target.value)} error={errors.patientDob} />
                  <Input label="Địa chỉ" value={formData.patientAddress} onChange={(e) => handleChange("patientAddress", e.target.value)} />
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mối quan hệ *</label>
                    <select value={formData.relationship} onChange={(e) => handleChange("relationship", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">-- Chọn mối quan hệ --</option>
                      <option value="Vợ/Chồng">Vợ/Chồng</option>
                      <option value="Con">Con</option>
                      <option value="Bố/Mẹ">Bố/Mẹ</option>
                      <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                      <option value="Khác">Khác</option>
                    </select>
                    {errors.relationship && <p className="text-red-500 text-sm mt-1">{errors.relationship}</p>}
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-6 pt-4">Lý do khám bệnh</h3>
              <div className="space-y-6">
                <Input
                  label="Lý do khám bệnh *"
                  placeholder="Ví dụ: Đau đầu, khám tổng quát..."
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  error={errors.type}
                  icon={FileText}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú thêm (Tùy chọn)</label>
                  <textarea
                    placeholder="Mô tả chi tiết triệu chứng hoặc tiền sử bệnh..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(6)}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <Button variant="primary" disabled={!formData.type} onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </div>
          )}

          {/* STEP 8: Confirm */}
          {step === 8 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Xác nhận thông tin</h3>
              
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative mb-8">
                {/* Decorative receipt edge */}
                <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSI4Ij48cGF0aCBkPSJNMCAwTDEwIDhsMTAtOFYwaC0yMHoiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=')] bg-repeat-x"></div>
                
                <div className="p-6 sm:p-8 pt-10">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 pb-8 border-b border-dashed border-gray-200 text-center sm:text-left">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                       {selectedDoctor?.avatar_url ? (
                        <img src={selectedDoctor.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        selectedDoctor?.avatar || "👨‍⚕️"
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Bác sĩ phụ trách</p>
                      <h4 className="text-xl font-bold text-gray-900">{selectedDoctor?.name}</h4>
                      <p className="text-blue-600 font-medium">{selectedDoctor?.specialty}</p>
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
                        <p className="text-lg font-bold text-gray-900">{selectedHospital?.name}</p>
                        <p className="text-gray-600 mt-1">{selectedHospital?.address}</p>
                        {selectedHospital?.city && <p className="text-blue-600 font-medium text-sm mt-0.5">{typeof selectedHospital.city === 'string' ? selectedHospital.city : selectedHospital.city?.name}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-6 mb-6">
                     <span className="text-gray-500 font-medium">Tổng chi phí dự kiến</span>
                     <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice || 500000)}</span>
                  </div>

                  <h4 className="font-bold text-gray-900 mb-4">Phương thức thanh toán</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod("vnpay")}
                      className={`relative p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                        paymentMethod === "vnpay" ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-blue-300"
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
                      className={`relative p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                        paymentMethod === "payos" ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-blue-300"
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

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(7)} disabled={isSubmitting}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting} size="lg" className="px-8 shadow-md">
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận Đặt lịch"} <CheckCircle className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default BookingFlowPage;
