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
import { createAppointment as apiCreateAppointment } from "../services/appointments.api";
import { getSchedulesByDoctor, getAvailableTimes } from "../services/doctor.schedules.api";
import { createPaymentDemo } from "../services/payments.api";
import { getDoctors as getDoctorsApi } from "../services/admin.doctors.api";
import { getHospitals } from "../services/admin.hospitals.api";
import { getCategories } from "../services/admin.categories.api";
import { getAllReviews } from "../services/reviews.api";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ProgressBar from "../components/common/ProgressBar";
import { PAGES, CITIES } from "../utils/constants";
import { formatCurrency, formatDate, removeDiacritics, getCategoryIcon } from "../utils/helpers";

const BookingFlowPage = ({ navigate }) => {
  const { addAppointment, isSlotAvailable } = useAppointments();
  const { user } = useAuth();
  const location = useLocation();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    city: "",
    hospitalId: "",
    specialty: "",
    doctorId: "",
    date: "",
    time: "",
    type: "",
    notes: "",
  });
  
  const [hospitals, setHospitals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [reviews, setReviews] = useState([]);
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
        const [hospData, catData, docData, revData] = await Promise.all([
          getHospitals(),
          getCategories(),
          getDoctorsApi(),
          getAllReviews()
        ]);
        
        setHospitals(Array.isArray(hospData) ? hospData : []);
        setCategories(Array.isArray(catData) ? catData : []);
        
        const list = Array.isArray(docData) ? docData : [];
        const normalized = list.map((d) => ({
          ...d,
          specialty: d.specialty || d.category?.name || "Đa khoa",
          consultationFee: d.consultationFee || d.price || 500000,
        }));
        setDoctors(normalized);
        setReviews(Array.isArray(revData) ? revData : []);
      } catch (err) {
        console.error("Error loading booking flow data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
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
  }, [loadingData, location.state, doctors]);

  const doctorRatingsMap = useMemo(() => {
    const map = new Map();
    reviews.forEach((review) => {
      const doctorId = review.doctor_id || review.doctor?.id;
      const rating = review.rating;
      if (doctorId && rating != null) {
        if (!map.has(doctorId)) map.set(doctorId, { total: 0, count: 0 });
        const data = map.get(doctorId);
        data.total += Number(rating);
        data.count += 1;
      }
    });
    const result = new Map();
    map.forEach((data, doctorId) => {
      result.set(doctorId, {
        rating: (data.total / data.count).toFixed(1),
        count: data.count
      });
    });
    return result;
  }, [reviews]);

  const doctorsWithRatings = useMemo(() => {
    return doctors.map((doctor) => {
      const ratingInfo = doctorRatingsMap.get(doctor.id) || { rating: "0.0", count: 0 };
      return {
        ...doctor,
        averageRating: parseFloat(ratingInfo.rating),
        totalReviews: ratingInfo.count,
      };
    });
  }, [doctors, doctorRatingsMap]);

  // Filters based on previous steps
  const filteredHospitals = useMemo(() => {
    if (!formData.city) return hospitals;
    return hospitals.filter(h => h.city === formData.city);
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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    
    // Auto advance for some steps
    if (field === 'city' && step === 1) handleNext(2);
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
    if (formData.doctorId && formData.date && step === 5) {
      loadSlotsFromSchedules(formData.doctorId, formData.date);
      setFormData(prev => ({...prev, time: ""})); // Reset time when date changes
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
    if (step === 7 && !formData.type) return setErrors({ type: "Vui lòng nhập lý do khám" });
    
    setStep(nextStepTarget);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert("Bạn cần đăng nhập trước khi đặt lịch");
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
        alert("Lịch khám không hợp lệ hoặc đã bị hủy. Vui lòng chọn lại giờ.");
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

      const created = await apiCreateAppointment(payload);

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

      setShowSuccess(true);
      setTimeout(() => navigate(PAGES.APPOINTMENTS), 2000);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Không thể tạo lịch hẹn");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Đặt lịch thành công!</h2>
          <p className="text-gray-600 mb-6">Lịch hẹn đã được xác nhận. Vui lòng theo dõi ứng dụng để biết thêm chi tiết.</p>
        </Card>
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
          
          {/* STEP 1: City */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Chọn Tỉnh / Thành phố</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {CITIES.map(city => (
                  <button
                    key={city.value}
                    onClick={() => handleChange("city", city.label)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.city === city.label 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <MapPin className={`w-6 h-6 mx-auto mb-2 ${formData.city === city.label ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium">{city.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
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
                  {filteredHospitals.map(hospital => (
                    <button
                      key={hospital.id}
                      onClick={() => handleChange("hospitalId", hospital.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        String(formData.hospitalId) === String(hospital.id)
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <h4 className={`font-bold ${String(formData.hospitalId) === String(hospital.id) ? 'text-blue-700' : 'text-gray-900'}`}>{hospital.name}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{hospital.address}</p>
                    </button>
                  ))}
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
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleChange("specialty", cat.name)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.specialty === cat.name 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-3xl mb-2">{cat.icon || getCategoryIcon(cat.name)}</div>
                    <span className="font-medium text-sm sm:text-base">{cat.name}</span>
                  </button>
                ))}
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
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                          {doctor.avatar || "👨‍⚕️"}
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
                          <div className="font-medium text-gray-900">{formatCurrency(doctor.consultationFee)}</div>
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
                <div className="py-8 text-center text-gray-500">Đang tải lịch trống...</div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableSlots.map(time => {
                    return (
                      <button
                        key={time}
                        onClick={() => handleChange("time", time)}
                        className={`py-3 px-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.time === time
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-blue-400'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">Không có ca khám nào khả dụng trong ngày này.</div>
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
              <h3 className="text-xl font-bold text-gray-900 mb-6">Thông tin khám bệnh</h3>
              
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
              
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 space-y-4">
                <div className="flex justify-between items-start pb-4 border-b border-blue-200">
                  <div>
                    <p className="text-sm text-gray-500">Bác sĩ</p>
                    <p className="font-bold text-gray-900 text-lg">{selectedDoctor?.name}</p>
                    <p className="text-blue-600 text-sm">{selectedDoctor?.specialty}</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                    {selectedDoctor?.avatar || "👨‍⚕️"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-b border-blue-200">
                  <div>
                    <p className="text-sm text-gray-500">Ngày khám</p>
                    <p className="font-medium text-gray-900">{formatDate(formData.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Giờ khám</p>
                    <p className="font-medium text-gray-900">{formData.time}</p>
                  </div>
                </div>

                <div className="py-2 border-b border-blue-200">
                  <p className="text-sm text-gray-500">Cơ sở y tế</p>
                  <p className="font-medium text-gray-900">{selectedHospital?.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedHospital?.address}</p>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <p className="text-gray-600 font-medium">Tổng chi phí dự kiến</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(selectedDoctor?.consultationFee || 500000)}</p>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(7)} disabled={isSubmitting}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận Đặt lịch"}
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
