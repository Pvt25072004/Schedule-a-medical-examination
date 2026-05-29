import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PAGES } from "../utils/constants";
import Button from "../components/common/Button";
import {
  initHospitalRegistration,
  verifyHospitalRegistrationOtp,
  submitHospitalRegistration,
} from "../services/hospital.registration.api";
import { uploadUserImage } from "../services/api";
import { Building2, CheckCircle2, ChevronRight, FileCheck, Mail, ShieldCheck } from "lucide-react";

export default function HospitalRegistrationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: OTP, 1: Basic, 2: Address, 3: Docs, 4: Finish
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [registrationId, setRegistrationId] = useState(null);

  const [formData, setFormData] = useState({
    admin_email: "",
    admin_name: "",
    admin_phone: "",
    admin_role: "Quản lý / Giám đốc",
    otp: "",

    hospital_name: "",
    hospital_type: "Phòng khám",
    business_license_number: "",
    scale: "<50 giường",
    founded_year: "",
    logo_url: "",

    address: "",
    province: "",
    district: "",
    ward: "",
    hotline: "",
    contact_email: "",
    open_hours: "07:00 - 17:00",
    
    operating_license_url: "",
    business_license_url: "",
    quality_certificate_url: "",

    doctor_count: "",
    main_specialty: "",
    
    accepts_online_payment: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      setError("");
      const result = await uploadUserImage(file);
      setFormData((prev) => ({
        ...prev,
        [fieldName]: result.image_url,
      }));
    } catch (err) {
      setError("Không thể tải lên file. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleInit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await initHospitalRegistration({
        admin_email: formData.admin_email,
        admin_name: formData.admin_name,
        admin_phone: formData.admin_phone,
        admin_role: formData.admin_role,
      });
      setStep(1); // Go to OTP verification step
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await verifyHospitalRegistrationOtp({
        admin_email: formData.admin_email,
        otp: formData.otp,
      });
      setRegistrationId(res.registrationId);
      setStep(2); // Go to Step 2: Info
    } catch (err) {
      setError(err.response?.data?.message || "Mã OTP không đúng");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      await submitHospitalRegistration(registrationId, {
        ...formData,
        founded_year: Number(formData.founded_year),
        doctor_count: Number(formData.doctor_count),
      });
      setStep(5); // Success step
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const renderStepper = () => (
    <div className="flex items-center justify-center mb-8 px-4">
      {[1, 2, 3, 4].map((s, idx) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= s + 1
                  ? "bg-green-600 text-white"
                  : step === s + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > s + 1 ? <CheckCircle2 className="w-6 h-6" /> : s}
            </div>
          </div>
          {idx < 3 && (
            <div
              className={`flex-1 h-1 mx-2 ${
                step > s + 1 ? "bg-green-600" : "bg-gray-200"
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-8 text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Hợp tác cùng STL Clinic</h1>
            <p className="text-blue-100">
              Tiếp cận hàng triệu bệnh nhân, quản lý lịch hẹn thông minh.
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                {error}
              </div>
            )}

            {step > 1 && step < 5 && renderStepper()}

            {/* Step 0: Initial Info */}
            {step === 0 && (
              <form onSubmit={handleInit} className="space-y-6">
                <div className="text-center mb-8">
                  <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Bắt đầu đăng ký
                  </h2>
                  <p className="text-gray-500 mt-2">
                    Vui lòng cung cấp email quản lý để hệ thống gửi mã xác thực.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Quản lý / Đại diện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="admin_email"
                    required
                    value={formData.admin_email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="manager@hospital.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="admin_name"
                      required
                      value={formData.admin_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="admin_phone"
                      required
                      value={formData.admin_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3"
                >
                  {loading ? "Đang gửi OTP..." : "Nhận mã OTP"}
                </Button>
              </form>
            )}

            {/* Step 1: OTP Verification */}
            {step === 1 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-center mb-8">
                  <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Xác thực Email
                  </h2>
                  <p className="text-gray-500 mt-2">
                    Chúng tôi đã gửi mã OTP 6 số đến <b>{formData.admin_email}</b>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="otp"
                    required
                    maxLength={6}
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="------"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(0)}
                    className="w-full"
                  >
                    Quay lại
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Đang xác thực..." : "Xác thực"}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Basic Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-800">
                  <Building2 className="text-blue-600" /> Thông tin cơ sở y tế
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên bệnh viện / Phòng khám <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="hospital_name"
                      value={formData.hospital_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại hình
                    </label>
                    <select
                      name="hospital_type"
                      value={formData.hospital_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Bệnh viện công">Bệnh viện công</option>
                      <option value="Bệnh viện tư">Bệnh viện tư</option>
                      <option value="Phòng khám">Phòng khám đa khoa / chuyên khoa</option>
                    </select>
                  </div>
                  
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã số thuế / Đăng ký kinh doanh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="business_license_number"
                      value={formData.business_license_number}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotline liên hệ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="hotline"
                      value={formData.hotline}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Số 10, Đường X, Phường Y, Quận Z, TP..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={() => {
                      if (!formData.hospital_name || !formData.address) {
                        setError("Vui lòng điền đủ Tên và Địa chỉ");
                        return;
                      }
                      setStep(3);
                    }}
                    className="flex items-center gap-2"
                  >
                    Tiếp theo <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Legal Documents */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-800">
                  <FileCheck className="text-blue-600" /> Tải lên Giấy tờ pháp lý
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Tài liệu của bạn được bảo mật an toàn. Định dạng hỗ trợ: JPG, PNG, PDF.
                </p>

                <div className="space-y-4">
                  <div className="p-4 border rounded-xl bg-gray-50">
                    <label className="block font-medium text-gray-700 mb-2">
                      Giấy phép hoạt động do Sở Y tế cấp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, "operating_license_url")}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.operating_license_url && (
                      <p className="mt-2 text-sm text-green-600">✓ Đã tải lên</p>
                    )}
                  </div>

                  <div className="p-4 border rounded-xl bg-gray-50">
                    <label className="block font-medium text-gray-700 mb-2">
                      Giấy phép đăng ký kinh doanh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, "business_license_url")}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.business_license_url && (
                      <p className="mt-2 text-sm text-green-600">✓ Đã tải lên</p>
                    )}
                  </div>
                  
                  <div className="p-4 border rounded-xl bg-gray-50">
                    <label className="block font-medium text-gray-700 mb-2">
                      Logo Bệnh viện (Tùy chọn)
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, "logo_url")}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.logo_url && (
                      <p className="mt-2 text-sm text-green-600">✓ Đã tải lên</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Quay lại
                  </Button>
                  <Button
                    disabled={loading}
                    onClick={() => {
                      if (!formData.operating_license_url || !formData.business_license_url) {
                        setError("Vui lòng tải lên các giấy tờ bắt buộc");
                        return;
                      }
                      setStep(4);
                    }}
                    className="flex items-center gap-2"
                  >
                    Tiếp theo <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Final Confirm */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-800">
                  Hoàn tất & Cam kết
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-sm text-blue-900 space-y-3">
                  <p>
                    <b>Quy trình sau khi gửi:</b>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Ban quản trị sẽ duyệt hồ sơ của bạn trong vòng 24h.</li>
                    <li>
                      Mọi thông tin liên lạc và mật khẩu tài khoản quản trị sẽ được
                      gửi vào email <b>{formData.admin_email}</b>.
                    </li>
                    <li>
                      Việc đăng ký hệ thống hoàn toàn <b>miễn phí</b>.
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 mt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-5 h-5 text-blue-600 rounded" required />
                    <span className="text-gray-700">Tôi cam kết các thông tin và giấy tờ cung cấp là hoàn toàn chính xác và hợp pháp.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-5 h-5 text-blue-600 rounded" required />
                    <span className="text-gray-700">Tôi đồng ý với các Điều khoản sử dụng & Chính sách bảo mật của STL Clinic.</span>
                  </label>
                </div>

                <div className="flex justify-between pt-8">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    Quay lại
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "Đang xử lý..." : "Gửi Đăng ký"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <div className="text-center py-10">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Đăng ký thành công!
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Cảm ơn bạn đã đăng ký đối tác cùng STL Clinic. Hồ sơ của cơ sở y tế đang được ban quản trị xét duyệt. 
                  <br /><br />
                  Kết quả sẽ được gửi về email <b>{formData.admin_email}</b> trong thời gian sớm nhất.
                </p>
                <Button onClick={() => navigate(PAGES.WELCOME)} className="px-8">
                  Trở về Trang chủ
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
