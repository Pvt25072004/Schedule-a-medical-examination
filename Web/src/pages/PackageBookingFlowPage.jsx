import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  ArrowLeft,
  AlertTriangle,
  Info
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createAppointment as apiCreateAppointment } from "../services/appointments.api";
import { createPaymentDemo, createVnpayUrl } from "../services/payments.api";
import { getServicePackageById } from "../services/service-packages.api";
import { getAvailableTimesForPackage, getAvailableDoctorsForPackage } from "../services/appointments.api";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ProgressBar from "../components/common/ProgressBar";
import { PAGES } from "../utils/constants";
import { formatCurrency, formatDate, removeDiacritics } from "../utils/helpers";

const PackageBookingFlowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    doctorId: "", // optional
    type: "Khám gói dịch vụ",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  
  const [servicePackage, setServicePackage] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true);
        const pkg = await getServicePackageById(id);
        if (pkg) {
          setServicePackage(pkg);
        } else {
          alert("Không tìm thấy gói khám!");
          navigate(-1);
        }
      } catch (err) {
        console.error("Error loading package data:", err);
        alert("Lỗi tải thông tin gói khám.");
        navigate(-1);
      } finally {
        setLoadingData(false);
      }
    };
    if (id) fetchInitialData();
  }, [id, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadSlotsForPackage = async (date) => {
    if (!id || !date) return;
    try {
      setLoadingSlots(true);
      const slots = await getAvailableTimesForPackage(id, date);
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (err) {
      console.error("Load available slots error:", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadDoctorsForPackage = async (date, time) => {
    if (!id || !date || !time) return;
    try {
      setLoadingDoctors(true);
      const doctors = await getAvailableDoctorsForPackage(id, date, time);
      setAvailableDoctors(Array.isArray(doctors) ? doctors : []);
    } catch (err) {
      console.error("Load available doctors error:", err);
      setAvailableDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    if (formData.date && step === 2) {
      loadSlotsForPackage(formData.date);
    }
  }, [formData.date, step]);

  useEffect(() => {
    if (formData.date && formData.time && step === 3) {
      loadDoctorsForPackage(formData.date, formData.time);
    }
  }, [formData.date, formData.time, step]);

  const handleNext = (nextStepTarget = step + 1) => {
    if (step === 1 && !formData.date) return setErrors({ date: "Vui lòng chọn ngày khám" });
    if (step === 2 && !formData.time) return setErrors({ time: "Vui lòng chọn giờ khám" });
    if (step === 4 && !formData.type) return setErrors({ type: "Vui lòng nhập lý do khám" });
    
    setStep(nextStepTarget);
    window.scrollTo(0, 0);
  };

  const calculateEndTime = (startTimeStr, durationMins) => {
    if (!startTimeStr) return "";
    const [h, m] = startTimeStr.split(":").map(Number);
    const totalStartMins = h * 60 + m;
    let totalEndMins = totalStartMins + durationMins;

    const morningEndMins = 11 * 60 + 30; // 11:30
    const lunchDuration = 120; // 120 mins

    if (totalStartMins < morningEndMins && totalEndMins > morningEndMins) {
      totalEndMins += lunchDuration;
    }

    const endH = Math.floor(totalEndMins / 60);
    const endM = totalEndMins % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  };

  const isCrossShift = (startTimeStr, durationMins) => {
    if (!startTimeStr) return false;
    const [h, m] = startTimeStr.split(":").map(Number);
    const totalStartMins = h * 60 + m;
    const totalEndMins = totalStartMins + durationMins;
    const morningEndMins = 11 * 60 + 30; // 11:30
    return totalStartMins < morningEndMins && totalEndMins > morningEndMins;
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert("Bạn cần đăng nhập trước khi đặt lịch");
      navigate(PAGES.LOGIN);
      return;
    }

    setIsSubmitting(true);
    try {
      let finalDoctorId = formData.doctorId;
      if (!finalDoctorId) {
        if (availableDoctors.length > 0) {
          finalDoctorId = availableDoctors[0].id;
        } else {
          alert("Hiện không có bác sĩ nào rảnh vào thời gian này. Vui lòng chọn giờ khác.");
          setIsSubmitting(false);
          setStep(2);
          return;
        }
      }

      const hospitalId = servicePackage.hospitals && servicePackage.hospitals.length > 0 
        ? servicePackage.hospitals[0].id 
        : 1;

      const payload = {
        user_id: Number(user.id),
        doctor_id: Number(finalDoctorId),
        hospital_id: Number(hospitalId),
        service_package_id: Number(servicePackage.id),
        appointment_date: formData.date,
        appointment_time: formData.time,
        examination_type: "offline",
        symptoms: formData.type + (formData.notes ? ` - ${formData.notes}` : ""),
      };

      const created = await apiCreateAppointment(payload);

      if (paymentMethod === "vnpay") {
        try {
          const vnpayResponse = await createVnpayUrl({
            appointment_id: created?.id,
            amount: servicePackage.fixed_price || 0,
            orderInfo: `Thanh toan goi kham web ${created?.id}`
          });
          if (vnpayResponse?.url) {
            window.location.href = vnpayResponse.url;
            return;
          }
        } catch (err) {
          console.warn("VNPAY URL creation failed:", err);
          alert("Không thể tạo URL thanh toán VNPAY, hệ thống sẽ ghi nhận thanh toán tiền mặt.");
        }
      }

      try {
        await createPaymentDemo({
          appointment_id: created?.id,
          amount: servicePackage.fixed_price || 0,
          base_fee: servicePackage.fixed_price || 0,
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
    { number: 1, title: "Ngày", icon: Calendar },
    { number: 2, title: "Giờ", icon: Clock },
    { number: 3, title: "Bác sĩ", icon: User },
    { number: 4, title: "Hồ sơ", icon: FileText },
    { number: 5, title: "Xác nhận", icon: CheckCircle },
  ];

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Đặt gói thành công!</h2>
          <p className="text-gray-600 mb-6">Lịch hẹn đã được xác nhận. Vui lòng theo dõi ứng dụng để biết thêm chi tiết.</p>
        </Card>
      </div>
    );
  }

  if (loadingData) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Đang tải dữ liệu gói khám...</div>;
  }

  const endTime = calculateEndTime(formData.time, servicePackage?.duration_minutes || 30);
  const crossShift = isCrossShift(formData.time, servicePackage?.duration_minutes || 30);
  const selectedDoctor = availableDoctors.find(d => d.id === formData.doctorId) || (availableDoctors.length > 0 ? availableDoctors[0] : null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Đặt Gói Dịch Vụ</h2>
          <p className="text-gray-600 font-medium">{servicePackage?.name}</p>
        </div>

        <ProgressBar 
          steps={steps} 
          currentStep={step} 
          onStepClick={(n) => {
            if (n < step) setStep(n);
          }} 
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          
          {/* STEP 1: Date */}
          {step === 1 && (
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

              <div className="mt-8 flex justify-end">
                <Button variant="primary" disabled={!formData.date} onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </div>
          )}

          {/* STEP 2: Time */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chọn Khung giờ</h3>
              <p className="text-gray-500 mb-6">Ngày {formatDate(formData.date)}</p>

              {loadingSlots ? (
                <div className="py-8 text-center text-gray-500">Đang tải khung giờ rảnh...</div>
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
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">Không có ca khám nào khả dụng trong ngày này để đáp ứng thời lượng gói khám ({servicePackage?.duration_minutes} phút).</div>
              )}

              {crossShift && (
                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800 text-sm">
                    <strong>⚠️ Lưu ý:</strong> Vì gói khám kéo dài {servicePackage?.duration_minutes} phút, ca khám của bạn sẽ được tiếp tục vào đầu ca chiều (từ 13:30) sau giờ nghỉ trưa của bệnh viện.
                  </p>
                </div>
              )}

              {errors.time && <p className="text-red-500 text-sm mt-2">{errors.time}</p>}

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <Button variant="primary" disabled={!formData.time} onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </div>
          )}

          {/* STEP 3: Doctor */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chọn Bác sĩ (Tùy chọn)</h3>
              <p className="text-gray-500 mb-6">Bạn có thể chọn một bác sĩ cụ thể hoặc bỏ qua để hệ thống tự phân công.</p>

              {loadingDoctors ? (
                <div className="py-8 text-center text-gray-500">Đang tải danh sách bác sĩ...</div>
              ) : availableDoctors.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {availableDoctors.map(doctor => (
                    <div
                      key={doctor.id}
                      onClick={() => handleChange("doctorId", doctor.id === formData.doctorId ? "" : doctor.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.doctorId === doctor.id
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                          {doctor.avatar_url ? (
                            <img src={doctor.avatar_url} alt={doctor.name} className="w-full h-full object-cover" />
                          ) : (
                            doctor.avatar || "👨‍⚕️"
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-bold text-gray-900 text-lg">{doctor.name}</h4>
                            {formData.doctorId === doctor.id && <CheckCircle className="text-blue-600 w-6 h-6" />}
                          </div>
                          <p className="text-blue-600 font-medium text-sm mb-1">{doctor.specialty || "Đa khoa"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">Lỗi: Không tìm thấy bác sĩ nào trong gói khám này.</div>
              )}

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setFormData(prev => ({...prev, doctorId: ""})); handleNext(); }}>Bỏ qua tự chọn</Button>
                  <Button variant="primary" onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Profile */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Thông tin bổ sung</h3>
              
              <div className="space-y-6">
                <Input
                  label="Tình trạng hiện tại / Lý do đăng ký *"
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  error={errors.type}
                  icon={FileText}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú thêm (Tùy chọn)</label>
                  <textarea
                    placeholder="Bạn có đang dùng thuốc gì không? Tiền sử bệnh gia đình..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <Button variant="primary" disabled={!formData.type} onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </div>
          )}

          {/* STEP 5: Confirm */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Xác nhận thông tin</h3>
              
              {servicePackage?.requires_fasting && (
                 <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
                   <Info className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                   <div>
                     <h4 className="text-red-800 font-bold">Lưu ý Y Tế Quan Trọng</h4>
                     <p className="text-red-700 text-sm mt-1">
                       Quý khách vui lòng <strong>nhịn ăn sáng trước 6-8 tiếng</strong> để thực hiện lấy mẫu xét nghiệm máu chính xác. Có mặt trước giờ hẹn 15 phút.
                     </p>
                   </div>
                 </div>
              )}

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 space-y-4">
                <div className="pb-4 border-b border-blue-200">
                  <p className="text-sm text-gray-500">Gói Dịch Vụ</p>
                  <p className="font-bold text-gray-900 text-lg">{servicePackage?.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-b border-blue-200">
                  <div>
                    <p className="text-sm text-gray-500">Thời gian bắt đầu</p>
                    <p className="font-medium text-gray-900">{formData.time} ({formatDate(formData.date)})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dự kiến kết thúc</p>
                    <p className="font-medium text-gray-900">{endTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-b border-blue-200">
                  <div>
                    <p className="text-sm text-gray-500">Bác sĩ phụ trách</p>
                    <p className="font-medium text-gray-900">{selectedDoctor ? selectedDoctor.name : "Được hệ thống chỉ định"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cơ sở y tế</p>
                    <p className="font-medium text-gray-900">{servicePackage?.hospitals?.[0]?.name || "Đang cập nhật"}</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-b border-blue-200 pb-4 mb-4">
                  <p className="text-gray-600 font-medium">Chi phí trọn gói</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(servicePackage?.fixed_price || 0)}</p>
                </div>

                <h4 className="font-bold text-gray-900 mb-2 mt-4">Phương thức thanh toán</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("vnpay")}
                    className={`relative p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all bg-white ${
                      paymentMethod === "vnpay" ? "border-blue-600 shadow-sm" : "border-gray-200 hover:border-blue-300"
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
                    onClick={() => setPaymentMethod("cash")}
                    className={`relative p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all bg-white ${
                      paymentMethod === "cash" ? "border-blue-600 shadow-sm" : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${paymentMethod === "cash" ? "text-blue-800" : "text-gray-900"}`}>Thanh toán tại quầy</p>
                      <p className="text-sm text-gray-500">Tiền mặt / Chuyển khoản</p>
                    </div>
                    {paymentMethod === "cash" && <CheckCircle className="w-6 h-6 text-blue-600 absolute right-4 top-1/2 -translate-y-1/2" />}
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)} disabled={isSubmitting}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
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

export default PackageBookingFlowPage;
