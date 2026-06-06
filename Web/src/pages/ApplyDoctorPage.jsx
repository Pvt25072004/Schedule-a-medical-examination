import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Stethoscope, Upload, X, User, Mail, Phone, Building, Briefcase, GraduationCap, Award, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { registerGuestDoctor } from "../services/api";
import { uploadDoctorAvatar } from "../services/doctor.profile.api";
import { getHospitals } from "../services/admin.hospitals.api";
import { getCategories } from "../services/admin.categories.api";
import { useNotification } from "../contexts/NotificationContext";

export default function ApplyDoctorPage() {
  const navigate = useNavigate();
  const { showError, showSuccess, showInfo } = useNotification();
  const [hospitals, setHospitals] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    hospital_id: "",
    category_id: "",
    specialty: "",
    degree: "",
    experience_years: "",
    license_number: "",
    license_file: "",
    certificate_file: "",
    cv_file: "",
    cover_letter: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hData, cData] = await Promise.all([
          getHospitals(),
          getCategories(),
        ]);
        setHospitals(Array.isArray(hData) ? hData : []);
        setCategories(Array.isArray(cData) ? cData : []);
      } catch (err) {
        console.error("Failed to load hospitals/categories", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUploadClick = (field) => {
    setUploadingField(field);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingField) return;

    try {
      showInfo("Đang tải file lên..."); // Fallback simple alert, no useNotification in web
      const result = await uploadDoctorAvatar(file);
      if (result && result.image_url) {
        setForm((prev) => ({
          ...prev,
          [uploadingField]: result.image_url,
        }));
        showSuccess("Tải file thành công!");
      }
    } catch (error) {
      showError("Lỗi tải file: " + error.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadingField(null);
    }
  };

  const removeFile = (field) => {
    setForm((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hospital_id) return showError("Vui lòng chọn bệnh viện ứng tuyển");
    if (!form.category_id) return showError("Vui lòng chọn chuyên khoa");
    
    try {
      setLoading(true);
      await registerGuestDoctor({
        ...form,
        hospital_id: Number(form.hospital_id),
        category_id: Number(form.category_id),
        experience_years: Number(form.experience_years) || 0,
      });
      showSuccess("Đã gửi đơn ứng tuyển thành công! Vui lòng chờ bệnh viện phê duyệt. Thông tin đăng nhập sẽ được gửi qua email của bạn.");
      navigate("/login");
    } catch (err) {
      showError(err.message || "Không thể gửi đơn ứng tuyển");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] font-sans text-gray-800 selection:bg-[#48a1f3]/30 relative z-0">
      {/* HERO BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-[450px] bg-gradient-to-br from-[#143250] to-[#1e4a77] overflow-hidden -z-10 rounded-b-[3rem] shadow-xl">
        {/* Decorative Blobs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#48a1f3]/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-80 h-80 bg-[#f99b1c]/20 rounded-full blur-[80px] pointer-events-none"></div>
      </div>

      {/* HEADER INFO */}
      <div className="max-w-4xl mx-auto pt-20 pb-12 px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 font-bold text-sm mb-6 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-[#f99b1c] animate-pulse"></span>
          Tuyển dụng Bác sĩ & Chuyên gia Y tế
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight drop-shadow-md">
          Gia nhập nền tảng Y tế <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#48a1f3] to-[#fbc374]">Hàng đầu Việt Nam</span>
        </h1>
        <p className="text-blue-100/90 text-lg max-w-2xl mx-auto leading-relaxed drop-shadow">
          Trở thành đối tác của STL Clinic để mở rộng phạm vi tiếp cận bệnh nhân, nâng cao uy tín cá nhân và quản lý lịch trình linh hoạt.
        </p>
      </div>

      {/* MAIN FORM CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 pb-24 relative z-10">
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(20,50,80,0.08)] p-6 md:p-12 border border-gray-100 relative overflow-hidden">
          {/* Decorative Top Line */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#48a1f3] via-[#3da3f5] to-[#f99b1c]"></div>

          <form onSubmit={handleSubmit} className="space-y-12">

            {/* Section 1: Thông tin cá nhân */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner">
                  <User className="w-7 h-7 text-[#48a1f3]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#143250]">Thông tin cá nhân</h3>
                  <p className="text-sm font-medium text-gray-500">Thông tin cơ bản để chúng tôi liên hệ với bạn</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">Họ và tên <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input required type="text" name="name" value={form.name} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-4 focus:ring-[#48a1f3]/10 outline-none transition-all bg-[#fbfbfb] focus:bg-white text-gray-800 font-medium" placeholder="Nguyễn Văn A" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">Email liên hệ <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-4 focus:ring-[#48a1f3]/10 outline-none transition-all bg-[#fbfbfb] focus:bg-white text-gray-800 font-medium" placeholder="doctor@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">Số điện thoại <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input required type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-4 focus:ring-[#48a1f3]/10 outline-none transition-all bg-[#fbfbfb] focus:bg-white text-gray-800 font-medium" placeholder="0901234567" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">Cơ sở / Bệnh viện ứng tuyển <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <select required name="hospital_id" value={form.hospital_id} onChange={handleChange} className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-4 focus:ring-[#48a1f3]/10 outline-none transition-all bg-[#fbfbfb] focus:bg-white text-gray-800 font-medium appearance-none">
                      <option value="">-- Chọn bệnh viện --</option>
                      {hospitals.map((h) => (<option key={h.id} value={h.id}>{h.name}</option>))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Chuyên môn */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shadow-inner">
                  <Briefcase className="w-7 h-7 text-[#f99b1c]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#143250]">Thông tin chuyên môn</h3>
                  <p className="text-sm font-medium text-gray-500">Bằng cấp và kinh nghiệm khám chữa bệnh</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">Chuyên khoa khám <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Stethoscope className="h-5 w-5 text-gray-400" />
                    </div>
                    <select required name="category_id" value={form.category_id} onChange={handleChange} className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-4 focus:ring-[#48a1f3]/10 outline-none transition-all bg-[#fbfbfb] focus:bg-white text-gray-800 font-medium appearance-none">
                      <option value="">-- Chọn chuyên khoa --</option>
                      {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">Chức danh cụ thể <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input required type="text" name="specialty" value={form.specialty} onChange={handleChange} className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-4 focus:ring-[#48a1f3]/10 outline-none transition-all bg-[#fbfbfb] focus:bg-white text-gray-800 font-medium" placeholder="VD: Bác sĩ Răng Hàm Mặt" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">Bằng cấp cao nhất</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" name="degree" value={form.degree} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-4 focus:ring-[#48a1f3]/10 outline-none transition-all bg-[#fbfbfb] focus:bg-white text-gray-800 font-medium" placeholder="VD: Tiến sĩ, Thạc sĩ, BSCKII..." />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">Số năm kinh nghiệm</label>
                    <input type="number" min="0" name="experience_years" value={form.experience_years} onChange={handleChange} className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-4 focus:ring-[#48a1f3]/10 outline-none transition-all bg-[#fbfbfb] focus:bg-white text-gray-800 font-medium" placeholder="VD: 5" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">Số CCHN</label>
                    <input type="text" name="license_number" value={form.license_number} onChange={handleChange} className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#48a1f3] focus:ring-4 focus:ring-[#48a1f3]/10 outline-none transition-all bg-[#fbfbfb] focus:bg-white text-gray-800 font-medium" placeholder="VD: 12345/CCHN" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Hồ sơ đính kèm */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center shadow-inner">
                  <Award className="w-7 h-7 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#143250]">Hồ sơ đính kèm</h3>
                  <p className="text-sm font-medium text-gray-500">Giấy phép hành nghề và các chứng chỉ liên quan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: "license_file", label: "Giấy phép hành nghề", desc: "Bản sao công chứng CCHN (PDF/JPG)" },
                  { id: "certificate_file", label: "Chứng chỉ khác", desc: "Các chứng chỉ đào tạo liên tục (Tùy chọn)" },
                  { id: "cv_file", label: "CV / Sơ yếu lý lịch", desc: "Hồ sơ cá nhân và quá trình công tác" },
                ].map((field) => (
                  <div key={field.id} className="relative group">
                    <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 h-full flex flex-col justify-center ${form[field.id] ? 'border-[#48a1f3] bg-blue-50/50' : 'border-gray-200 hover:border-[#48a1f3] bg-gray-50/50 hover:bg-blue-50/20'}`}>
                      <div className="mb-3">
                        {form[field.id] ? (
                          <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 mx-auto bg-white text-gray-400 border border-gray-100 rounded-full flex items-center justify-center shadow-sm group-hover:text-[#48a1f3] transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-[#143250] mb-1">{field.label}</h4>
                      <p className="text-xs text-gray-500 mb-4 px-2">{field.desc}</p>
                      
                      <div className="mt-auto">
                        {form[field.id] ? (
                          <div className="flex flex-col gap-2">
                            <a href={form[field.id]} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#48a1f3] hover:text-[#143250] transition-colors">
                              Xem file đã tải
                            </a>
                            <button type="button" onClick={() => removeFile(field.id)} className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 py-1.5 rounded-lg w-full transition-colors">
                              Xóa file
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleFileUploadClick(field.id)}
                            className="w-full py-2.5 px-4 bg-white border border-gray-200 text-[#143250] font-bold text-sm rounded-xl hover:border-[#48a1f3] hover:text-[#48a1f3] shadow-sm transition-all"
                          >
                            Chọn file tải lên
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            {/* Section 4: Lời nhắn */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center shadow-inner">
                  <FileText className="w-7 h-7 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#143250]">Lời nhắn & Giới thiệu</h3>
                  <p className="text-sm font-medium text-gray-500">Giới thiệu bản thân và mong muốn hợp tác</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <textarea
                  rows={5}
                  name="cover_letter"
                  value={form.cover_letter}
                  onChange={handleChange}
                  placeholder="Tôi là bác sĩ..., tôi mong muốn ứng tuyển vị trí... vì..."
                  className="w-full p-5 rounded-2xl border border-gray-200 focus:border-[#48a1f3] focus:ring-4 focus:ring-[#48a1f3]/10 outline-none transition-all bg-[#fbfbfb] focus:bg-white text-gray-800 font-medium resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
              <Link to="/" className="w-full sm:w-auto">
                <button type="button" className="w-full sm:w-auto px-8 py-4 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  Hủy và quay lại
                </button>
              </Link>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#48a1f3] to-[#3da3f5] text-white font-bold rounded-xl shadow-lg shadow-[#48a1f3]/30 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? "Đang xử lý..." : (
                  <>
                    Gửi hồ sơ ứng tuyển <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
