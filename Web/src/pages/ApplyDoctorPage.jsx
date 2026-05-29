import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Stethoscope, Upload, X } from "lucide-react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { registerGuestDoctor } from "../services/api";
import { uploadDoctorAvatar } from "../services/doctor.profile.api";
import { getHospitals } from "../services/admin.hospitals.api";
import { getCategories } from "../services/admin.categories.api";

export default function ApplyDoctorPage() {
  const navigate = useNavigate();
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
      alert("Đang tải file lên..."); // Fallback simple alert, no useNotification in web
      const result = await uploadDoctorAvatar(file);
      if (result && result.image_url) {
        setForm((prev) => ({
          ...prev,
          [uploadingField]: result.image_url,
        }));
        alert("Tải file thành công!");
      }
    } catch (error) {
      alert("Lỗi tải file: " + error.message);
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
    if (!form.hospital_id) return alert("Vui lòng chọn bệnh viện ứng tuyển");
    if (!form.category_id) return alert("Vui lòng chọn chuyên khoa");
    
    try {
      setLoading(true);
      await registerGuestDoctor({
        ...form,
        hospital_id: Number(form.hospital_id),
        category_id: Number(form.category_id),
        experience_years: Number(form.experience_years) || 0,
      });
      alert("Đã gửi đơn ứng tuyển thành công! Vui lòng chờ bệnh viện phê duyệt. Thông tin đăng nhập sẽ được gửi qua email của bạn.");
      navigate("/login");
    } catch (err) {
      alert(err.message || "Không thể gửi đơn ứng tuyển");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="flex justify-center text-blue-600 mb-6">
          <Stethoscope className="w-12 h-12" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Ứng tuyển Bác sĩ
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Hãy gia nhập đội ngũ chuyên gia y tế hàng đầu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cá nhân */}
              <div className="space-y-6">
                <h3 className="font-semibold text-lg border-b pb-2 text-slate-700">Thông tin cá nhân</h3>
                <Input
                  label="Họ và tên"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Số điện thoại"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bệnh viện ứng tuyển
                  </label>
                  <select
                    name="hospital_id"
                    value={form.hospital_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Chọn bệnh viện --</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Thông tin chuyên môn */}
              <div className="space-y-6">
                <h3 className="font-semibold text-lg border-b pb-2 text-slate-700">Thông tin chuyên môn</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Chuyên khoa khám
                  </label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Chọn chuyên khoa --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Chức danh / Chuyên khoa cụ thể"
                  name="specialty"
                  placeholder="VD: Bác sĩ Răng Hàm Mặt"
                  value={form.specialty}
                  onChange={handleChange}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Bằng cấp"
                    name="degree"
                    placeholder="VD: Tiến sĩ"
                    value={form.degree}
                    onChange={handleChange}
                  />
                  <Input
                    label="Số năm kinh nghiệm"
                    name="experience_years"
                    type="number"
                    min="0"
                    value={form.experience_years}
                    onChange={handleChange}
                  />
                </div>
                <Input
                  label="Số chứng chỉ hành nghề"
                  name="license_number"
                  value={form.license_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-lg border-b pb-2 text-slate-700 mb-4">Hồ sơ đính kèm</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upload Fields */}
                {[
                  { id: "license_file", label: "Giấy phép hành nghề (PDF/JPG)" },
                  { id: "certificate_file", label: "Chứng chỉ khác (PDF/JPG)" },
                  { id: "cv_file", label: "CV / Hồ sơ cá nhân (PDF/JPG)" },
                ].map((field) => (
                  <div key={field.id} className="border border-dashed border-slate-300 rounded-lg p-4 text-center">
                    <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
                    {form[field.id] ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm text-green-600 break-all bg-green-50 px-2 py-1 rounded">Đã tải lên</span>
                        <div className="flex gap-2">
                          <a href={form[field.id]} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                            Xem file
                          </a>
                          <button type="button" onClick={() => removeFile(field.id)} className="text-xs text-red-500 hover:underline">
                            Xóa
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleFileUploadClick(field.id)}
                        className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-transparent rounded-md hover:bg-blue-100"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Tải lên
                      </button>
                    )}
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

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lời nhắn / Thư giới thiệu
              </label>
              <textarea
                rows={4}
                name="cover_letter"
                value={form.cover_letter}
                onChange={handleChange}
                placeholder="Giới thiệu ngắn gọn về bản thân hoặc lý do bạn muốn ứng tuyển..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Link to="/">
                <Button type="button" variant="ghost">Hủy</Button>
              </Link>
              <Button type="submit" variant="primary" className="px-8" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi Đơn Ứng Tuyển"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
