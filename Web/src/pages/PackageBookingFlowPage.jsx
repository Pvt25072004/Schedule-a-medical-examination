import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Building,
  User,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Info
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { createAppointment as apiCreateAppointment } from "../services/appointments.api";
import { createPaymentDemo, createVnpayUrl, createPayosUrl } from "../services/payments.api";
import { getServicePackageById } from "../services/service-packages.api";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ProgressBar from "../components/common/ProgressBar";
import { PAGES } from "../utils/constants";
import { formatCurrency } from "../utils/helpers";

const PackageBookingFlowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError, showSuccess: showSuccessToast, showInfo } = useNotification();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "Khám gói dịch vụ",
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
  
  const [servicePackage, setServicePackage] = useState(null);
  
  const [loadingData, setLoadingData] = useState(true);
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
          setFormData(prev => ({ ...prev, type: `Khám ${pkg.name}` }));
        } else {
          showError("Không tìm thấy gói khám!");
          navigate(-1);
        }
      } catch (err) {
        console.error("Error loading package data:", err);
        showError("Lỗi tải thông tin gói khám.");
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

  const handleNext = (nextStepTarget = step + 1) => {
    if (step === 1) {
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
      const hospitalId = servicePackage.hospitals && servicePackage.hospitals.length > 0 
        ? servicePackage.hospitals[0].id 
        : 1;

      const payload = {
        user_id: Number(user.id),
        hospital_id: Number(hospitalId),
        service_package_id: Number(servicePackage.id),
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
          showError("Không thể tạo URL thanh toán VNPAY, hệ thống sẽ ghi nhận thanh toán tiền mặt.");
        }
      }

      if (paymentMethod === "payos") {
        try {
          const payosResponse = await createPayosUrl({
            appointment_id: created?.id,
            amount: servicePackage.fixed_price || 0,
            orderInfo: `Thanh toan goi kham ${created?.id}`
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

      setShowSuccess(true);
      setTimeout(() => navigate(PAGES.APPOINTMENTS), 2000);
    } catch (error) {
      console.error(error);
      showError(error?.response?.data?.message || error.message || "Không thể tạo lịch hẹn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Hồ sơ", icon: FileText },
    { number: 2, title: "Xác nhận & Thanh toán", icon: CheckCircle },
  ];

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Đặt gói thành công!</h2>
          <p className="text-gray-600 mb-6">Lịch hẹn đã được ghi nhận. Bệnh viện sẽ liên hệ để xác nhận ngày giờ khám cụ thể với bạn.</p>
        </Card>
      </div>
    );
  }

  if (loadingData) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Đang tải dữ liệu gói khám...</div>;
  }

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
          
          {/* STEP 1: Profile */}
          {step === 1 && (
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

              <div className="pt-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ghi chú thêm (Tùy chọn)</h3>
                <div>
                  <textarea
                    placeholder="Bạn có đang dùng thuốc gì không? Tiền sử bệnh gia đình..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button variant="primary" disabled={!formData.type} onClick={() => handleNext()}>Tiếp tục <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </div>
            </div>
          )}

          {/* STEP 2: Confirm */}
          {step === 2 && (
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
                  <p className="text-sm text-blue-800 mt-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Bệnh viện sẽ liên hệ xếp lịch sau khi thanh toán.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-b border-blue-200">
                  <div>
                    <p className="text-sm text-gray-500">Cơ sở y tế</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1 mt-1">
                      <Building className="w-4 h-4 text-blue-600" />
                      {servicePackage?.hospitals?.[0]?.name || "Đang cập nhật"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời lượng dự kiến</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {servicePackage?.duration_minutes} phút
                    </p>
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
                    onClick={() => setPaymentMethod("payos")}
                    className={`relative p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all bg-white ${
                      paymentMethod === "payos" ? "border-blue-600 shadow-sm" : "border-gray-200 hover:border-blue-300"
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

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận Thanh toán"}
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
