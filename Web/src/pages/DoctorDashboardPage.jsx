import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Activity,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  DollarSign,
  Star,
  ArrowLeft,
  Edit3,
  Share2,
  Camera,
  LogOut,
  Plus,
  LayoutDashboard,
  Users,
  UserCircle,
  Menu,
  X,
  HeartPulse
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { PAGES } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/LOGOmain.jpg";

import {
  getSchedulesByDoctor,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../services/doctor.schedules.api";
import {
  getMyDoctorProfile,
  updateMyDoctorProfile,
  uploadDoctorAvatar,
  createDoctorApplication,
  getMyDoctorApplications,
} from "../services/doctor.profile.api";
import { getHospitals } from "../services/admin.hospitals.api";
import { getCategories } from "../services/admin.categories.api";
import {
  getAppointmentsByDoctor,
  updateAppointmentStatus,
} from "../services/doctor.appointments.api";
import { getPaymentsByDoctor } from "../services/doctor.payments.api";
import { getReviewsByDoctor } from "../services/reviews.api";

const TABS = {
  OVERVIEW: "overview",
  SCHEDULES: "schedules",
  APPOINTMENTS: "appointments",
  AFFILIATIONS: "affiliations",
  REVIEWS: "reviews",
  PAYMENTS: "payments",
  PROFILE: "profile"
};

const DoctorDashboardPage = ({ navigate }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // === DATA STATES ===
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    specialty: "",
    degree: "",
    experience_years: "",
    license_number: "",
    description: "",
    avatar_url: "",
    avatar_public_id: "",
    hospitalIds: [],
    category_id: "",
    old_password: "",
    password: ""
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  
  const [doctorPayments, setDoctorPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  
  const [doctorReviews, setDoctorReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // === FORM STATES ===
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    hospital_id: "",
    work_date: "",
    start_time: "08:00",
    end_time: "12:00",
    max_patients: 10,
  });
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinForm, setJoinForm] = useState({
    hospital_id: "",
    cover_letter: "",
  });
  const [submittingJoin, setSubmittingJoin] = useState(false);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    hospital_id: "",
    hospital_name: "",
    cover_letter: "",
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // === FETCHING LOGIC ===
  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const profileData = await getMyDoctorProfile();
      if (profileData) {
        setDoctorProfile(profileData);
        setProfileForm({
          name: profileData.user?.full_name || profileData.name || user?.fullName || user?.full_name || "",
          specialty: profileData.specialty || "",
          degree: profileData.degree || "",
          experience_years: profileData.experience_years || "",
          license_number: profileData.license_number || "",
          category_id: profileData.category?.id || "",
          description: profileData.description || "",
          avatar_url: profileData.avatar_url || "",
          avatar_public_id: profileData.avatar_public_id || "",
          hospitalIds: profileData.hospitals?.map((h) => h.id || h.hospital_id) || [],
          old_password: "",
          password: ""
        });
      }
    } catch (e) {
      console.error("Load doctor profile error:", e);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const data = await getHospitals();
      setHospitals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load hospitals error:", e);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load categories error:", e);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadApplications = async () => {
    try {
      if (!doctorProfile?.id) {
        setApplications([]);
        return;
      }
      setLoadingApplications(true);
      const data = await getMyDoctorApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load applications error:", e);
    } finally {
      setLoadingApplications(false);
    }
  };

  const loadSchedules = async (doctorId) => {
    if (!doctorId) return;
    try {
      setLoadingSchedules(true);
      const data = await getSchedulesByDoctor(doctorId);
      setSchedules(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load schedules error:", e);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    void loadProfile();
    void loadHospitals();
    void loadCategories();
    void loadApplications();
  }, [user?.id]);

  useEffect(() => {
    if (doctorProfile?.id) {
      void loadApplications();
    }
  }, [doctorProfile?.id]);

  useEffect(() => {
    if (!doctorProfile?.id) return;
    void loadSchedules(doctorProfile.id);
    
    (async () => {
      try {
        setLoadingAppointments(true);
        const apps = await getAppointmentsByDoctor(doctorProfile.id);
        setDoctorAppointments(Array.isArray(apps) ? apps : []);
      } catch (e) {
        console.error("Load doctor appointments error:", e);
      } finally {
        setLoadingAppointments(false);
      }
    })();

    (async () => {
      try {
        setLoadingPayments(true);
        const pays = await getPaymentsByDoctor(doctorProfile.id);
        setDoctorPayments(Array.isArray(pays) ? pays : []);
      } catch (e) {
        console.error("Load doctor payments error:", e);
      } finally {
        setLoadingPayments(false);
      }
    })();

    (async () => {
      try {
        setLoadingReviews(true);
        const revs = await getReviewsByDoctor(doctorProfile.id);
        setDoctorReviews(Array.isArray(revs) ? revs : []);
      } catch (e) {
        console.error("Load doctor reviews error:", e);
      } finally {
        setLoadingReviews(false);
      }
    })();
  }, [doctorProfile?.id]);

  // === HANDLERS ===
  const formatDateVN = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d.toString().slice(0, 10);
    return date.toLocaleDateString("vi-VN");
  };

  const affiliations = useMemo(() => {
    return Array.isArray(doctorProfile?.hospitals)
      ? doctorProfile.hospitals.map((h) => ({
          id: h.id,
          hospital: h.name,
          role: "Bác sĩ",
          since: "",
        }))
      : [];
  }, [doctorProfile?.hospitals]);

  const handleQuickCreateSchedule = () => {
    if (!doctorProfile?.id) {
      alert("Vui lòng lưu hồ sơ bác sĩ trước khi tạo ca làm việc");
      return;
    }
    const linkedHospitals = Array.isArray(doctorProfile.hospitals) ? doctorProfile.hospitals : [];
    const defaultHospitalId = linkedHospitals.length === 1 ? linkedHospitals[0].id : "";

    setEditingScheduleId(null);
    setScheduleForm({
      hospital_id: defaultHospitalId,
      work_date: "",
      start_time: "08:00",
      end_time: "12:00",
      max_patients: 10,
    });
    setShowScheduleForm(true);
  };

  const handleStartEditSchedule = (entry) => {
    setEditingScheduleId(entry.id);
    setScheduleForm({
      hospital_id: entry.hospital_id,
      work_date: entry.work_date?.slice(0, 10) || "",
      start_time: entry.start_time?.slice(0, 5) || "08:00",
      end_time: entry.end_time?.slice(0, 5) || "12:00",
      max_patients: entry.max_patients ?? 10,
    });
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = async (entry) => {
    if (!window.confirm("Bạn có chắc muốn xóa ca làm việc này?")) return;
    try {
      await deleteSchedule(entry.id);
      setSchedules((prev) => prev.filter((s) => s.id !== entry.id));
    } catch (e) {
      alert(e.message || "Không thể xóa ca làm việc");
    }
  };

  const handleConfirmAppointment = async (appointment) => {
    try {
      const updated = await updateAppointmentStatus(appointment.id, "confirmed");
      setDoctorAppointments((prev) => prev.map((apt) => (apt.id === updated.id ? updated : apt)));
    } catch (e) {
      alert(e.message || "Không thể xác nhận lịch hẹn");
    }
  };

  const handleRejectAppointment = async (appointment) => {
    const reason = window.prompt("Nhập lý do từ chối lịch hẹn này (bắt buộc):") || "";
    if (!reason.trim()) {
      alert("Bạn cần nhập lý do khi từ chối lịch hẹn.");
      return;
    }
    try {
      const updated = await updateAppointmentStatus(appointment.id, "rejected", reason.trim());
      setDoctorAppointments((prev) => prev.map((apt) => (apt.id === updated.id ? updated : apt)));
    } catch (e) {
      alert(e.message || "Không thể từ chối lịch hẹn");
    }
  };

  const handleCompleteAppointment = async (appointment) => {
    const ok = window.confirm(`Xác nhận đã khám xong cho lịch hẹn #${appointment.id}?`);
    if (!ok) return;
    try {
      const updated = await updateAppointmentStatus(appointment.id, "completed");
      setDoctorAppointments((prev) => prev.map((apt) => (apt.id === updated.id ? updated : apt)));
    } catch (e) {
      alert(e.message || "Không thể cập nhật trạng thái lịch hẹn");
    }
  };

  const handleSubmitJoinForm = async (e) => {
    e.preventDefault();
    if (!joinForm.hospital_id) {
      alert("Vui lòng chọn bệnh viện");
      return;
    }
    try {
      setSubmittingJoin(true);
      await createDoctorApplication({
        hospital_id: Number(joinForm.hospital_id),
        cover_letter: joinForm.cover_letter,
        type: "join",
      });
      alert("Đã gửi yêu cầu liên kết. Vui lòng chờ bệnh viện duyệt.");
      setShowJoinModal(false);
      setJoinForm({ hospital_id: "", cover_letter: "" });
      void loadApplications();
    } catch (e) {
      alert(e.message || "Lỗi khi gửi yêu cầu");
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleSubmitLeaveForm = async (e) => {
    e.preventDefault();
    try {
      setSubmittingLeave(true);
      await createDoctorApplication({
        hospital_id: Number(leaveForm.hospital_id),
        cover_letter: leaveForm.cover_letter,
        type: "leave",
      });
      alert("Đã gửi yêu cầu xin nghỉ. Vui lòng chờ bệnh viện duyệt.");
      setShowLeaveModal(false);
      setLeaveForm({ hospital_id: "", hospital_name: "", cover_letter: "" });
      void loadApplications();
    } catch (e) {
      alert(e.message || "Lỗi khi gửi yêu cầu");
    } finally {
      setSubmittingLeave(false);
    }
  };

  // === RENDERERS ===

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: "Cuộc hẹn tuần này", value: "18", detail: "+3 mới", icon: Calendar, color: "bg-blue-50 text-blue-600 border-blue-100" },
          { title: "Giờ làm việc", value: "32h", detail: "3 cơ sở y tế", icon: Clock, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
          { title: "Điểm đánh giá", value: "4.9", detail: "256 nhận xét", icon: Star, color: "bg-amber-50 text-amber-600 border-amber-100" },
          { title: "Thu nhập tháng", value: "62 triệu", detail: "+8% so với tháng trước", icon: DollarSign, color: "bg-purple-50 text-purple-600 border-purple-100" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${card.color}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="text-2xl font-black text-slate-800">{card.value}</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">{card.detail}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#143250] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#48a1f3]" />
              Lịch hẹn sắp tới
            </h2>
            <Button size="sm" variant="ghost" onClick={() => setActiveTab(TABS.APPOINTMENTS)}>Xem tất cả</Button>
          </div>
          <div className="space-y-4 flex-1">
            {loadingAppointments ? (
              <p className="text-sm text-slate-500 text-center py-8 animate-pulse">Đang tải lịch hẹn...</p>
            ) : doctorAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Calendar className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Chưa có lịch hẹn nào sắp tới.</p>
              </div>
            ) : (
              doctorAppointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800">{apt.user?.full_name || "Bệnh nhân"}</h3>
                    <p className="text-sm font-medium text-[#48a1f3] mt-1">{formatDateVN(apt.appointment_date)} · {apt.appointment_time?.slice(0, 5)}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {apt.hospital?.name}</p>
                  </div>
                  <div>
                     {apt.status === "confirmed" && <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Đã xác nhận</span>}
                     {apt.status === "pending" && <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">Chờ duyệt</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#143250] flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Đánh giá gần đây
            </h2>
            <Button size="sm" variant="ghost" onClick={() => setActiveTab(TABS.REVIEWS)}>Xem tất cả</Button>
          </div>
          <div className="space-y-4 flex-1">
            {loadingReviews ? (
              <p className="text-sm text-slate-500 text-center py-8 animate-pulse">Đang tải đánh giá...</p>
            ) : doctorReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Chưa có phản hồi nào.</p>
              </div>
            ) : (
              doctorReviews.slice(0, 3).map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                     <p className="font-bold text-slate-800 text-sm">{rev.user?.full_name || "Bệnh nhân"}</p>
                     <p className="text-xs text-amber-500 font-bold">⭐ {rev.rating}/5</p>
                  </div>
                  <p className="text-sm text-slate-600 italic line-clamp-2">"{rev.comment}"</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-[#143250] to-[#1e4a77] text-white border-0 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-2">
          <div>
            <h3 className="text-2xl font-black mb-2 text-white">Cần hỗ trợ từ Admin?</h3>
            <p className="text-sm text-blue-100/80 max-w-xl font-medium">
              Bạn có thể gửi yêu cầu cập nhật hồ sơ bác sĩ, xin nghỉ việc hoặc liên kết thêm bệnh viện mới trực tiếp trên hệ thống. Đội ngũ admin sẽ xử lý trong vòng 24h.
            </p>
          </div>
          <Button className="bg-white text-[#143250] hover:bg-slate-50 shadow-lg !font-bold" icon={MessageCircle} onClick={() => setActiveTab(TABS.AFFILIATIONS)}>
            Quản lý liên kết
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderSchedules = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#143250]">Quản lý Lịch làm việc</h2>
            <p className="text-sm text-slate-500 font-medium">Đăng ký ca làm tại các bệnh viện bạn đã liên kết</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" icon={Share2}>Đồng bộ</Button>
            <Button size="sm" variant="primary" icon={Plus} onClick={handleQuickCreateSchedule} className="bg-gradient-to-r from-[#48a1f3] to-[#3da3f5]">
              Thêm ca làm việc
            </Button>
          </div>
        </div>

        {showScheduleForm && (
          <div className="mb-8 border border-[#48a1f3]/20 rounded-2xl p-6 bg-[#f4f8fb]">
            <h3 className="text-base font-bold text-[#143250] mb-4">
              {editingScheduleId ? "Cập nhật ca làm việc" : "Tạo ca làm việc mới"}
            </h3>
            <form
              className="grid gap-4 md:grid-cols-4 items-end"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!doctorProfile?.id) return;
                if (!scheduleForm.hospital_id) return alert("Vui lòng chọn bệnh viện");
                if (!scheduleForm.work_date) return alert("Vui lòng chọn ngày làm việc");
                
                try {
                  const payload = {
                    doctor_id: doctorProfile.id,
                    hospital_id: scheduleForm.hospital_id,
                    work_date: scheduleForm.work_date,
                    start_time: scheduleForm.start_time.length === 5 ? `${scheduleForm.start_time}:00` : scheduleForm.start_time,
                    end_time: scheduleForm.end_time.length === 5 ? `${scheduleForm.end_time}:00` : scheduleForm.end_time,
                    max_patients: Number(scheduleForm.max_patients) || 10,
                  };
                  if (editingScheduleId) {
                    await updateSchedule(editingScheduleId, payload);
                  } else {
                    await createSchedule(payload);
                  }
                  setShowScheduleForm(false);
                  setEditingScheduleId(null);
                  void loadSchedules(doctorProfile.id);
                } catch (err) {
                  alert(err.message || "Không thể lưu ca làm việc");
                }
              }}
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bệnh viện</label>
                <select
                  value={scheduleForm.hospital_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, hospital_id: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#48a1f3] outline-none font-medium"
                >
                  <option value="">-- Chọn bệnh viện --</option>
                  {doctorProfile?.hospitals?.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngày làm việc</label>
                <input
                  type="date"
                  value={scheduleForm.work_date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, work_date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#48a1f3] outline-none font-medium"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bắt đầu</label>
                  <input
                    type="time"
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#48a1f3] outline-none font-medium"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kết thúc</label>
                  <input
                    type="time"
                    value={scheduleForm.end_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#48a1f3] outline-none font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số bệnh nhân tối đa</label>
                <input
                  type="number"
                  min="1"
                  value={scheduleForm.max_patients}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, max_patients: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#48a1f3] outline-none font-medium"
                />
              </div>
              <div className="flex gap-2 md:col-span-4 justify-end mt-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => { setShowScheduleForm(false); setEditingScheduleId(null); }}>Hủy</Button>
                <Button type="submit" size="sm" variant="primary">{editingScheduleId ? "Cập nhật" : "Tạo ca làm việc"}</Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loadingSchedules && <p className="text-sm text-slate-500 animate-pulse py-4">Đang tải lịch làm việc...</p>}
          {!loadingSchedules && schedules.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">Chưa có ca làm việc nào. Hãy ấn nút "Thêm ca làm việc".</p>
            </div>
          )}
          {schedules.map((entry) => (
            <div key={entry.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0">
                  🏥
                </div>
                <div>
                  <p className="text-xs font-bold text-[#48a1f3] uppercase tracking-wider mb-1">
                    {entry.hospital?.name || `Bệnh viện ID: ${entry.hospital_id}`}
                  </p>
                  <p className="text-lg font-black text-[#143250]">
                    {formatDateVN(entry.work_date)}
                  </p>
                  <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                    <Users className="w-4 h-4"/> Tối đa {entry.max_patients ?? 10} bệnh nhân
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                <div className="text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#f99b1c]" />
                  {entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleStartEditSchedule(entry)}>Sửa</Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteSchedule(entry)}>Xóa</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#143250]">Danh sách Lịch hẹn</h2>
            <p className="text-sm text-slate-500 font-medium">Xác nhận hoặc từ chối bệnh nhân đặt khám</p>
          </div>
        </div>

        <div className="space-y-4">
          {loadingAppointments && <p className="text-sm text-slate-500 animate-pulse py-4">Đang tải lịch hẹn...</p>}
          {!loadingAppointments && doctorAppointments.length === 0 && (
             <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <Calendar className="w-12 h-12 mb-3 opacity-30" />
               <p className="text-sm font-medium">Không có lịch hẹn nào.</p>
             </div>
          )}
          {doctorAppointments.map((apt) => (
            <div key={apt.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
                    {(apt.user?.full_name || "BN").split(" ").map(p => p[0]).join("")}
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-slate-900">{apt.user?.full_name || "Bệnh nhân"}</h3>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">#{apt.id}</span>
                    </div>
                    <p className="text-sm font-medium text-[#48a1f3] mb-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4"/> {formatDateVN(apt.appointment_date)} lúc {apt.appointment_time?.slice(0, 5)}
                    </p>
                    <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                      <span className="font-semibold not-italic text-slate-700">Lý do:</span> {apt.symptoms || "Không có thông tin"}
                    </p>
                 </div>
              </div>

              <div className="flex flex-col items-end gap-3 min-w-[140px]">
                {apt.status === "confirmed" && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold"><CheckCircle className="w-4 h-4" /> Đã xác nhận</span>}
                {apt.status === "completed" && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold"><CheckCircle className="w-4 h-4" /> Đã khám xong</span>}
                {apt.status === "rejected" && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold"><AlertTriangle className="w-4 h-4" /> Đã từ chối/hủy</span>}
                {apt.status === "pending" && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-xs font-bold"><AlertTriangle className="w-4 h-4" /> Chờ duyệt</span>}
                {apt.status === "cancelled" && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold"><AlertTriangle className="w-4 h-4" /> Đã hủy</span>}

                {(apt.status === "pending" || apt.status === "confirmed") && (
                  <div className="flex flex-col gap-2 w-full mt-2">
                    {apt.status === "pending" && <Button size="sm" variant="primary" className="w-full justify-center" onClick={() => handleConfirmAppointment(apt)}>Xác nhận lịch</Button>}
                    {apt.status === "confirmed" && <Button size="sm" variant="primary" className="w-full justify-center bg-blue-600 hover:bg-blue-700" onClick={() => handleCompleteAppointment(apt)}>Đã khám xong</Button>}
                    <Button size="sm" variant="ghost" className="w-full justify-center text-red-500 hover:bg-red-50 border border-red-100" onClick={() => handleRejectAppointment(apt)}>
                      Từ chối / Hủy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAffiliations = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#143250]">Bệnh viện liên kết</h2>
            <p className="text-sm text-slate-500 font-medium">Gửi yêu cầu làm việc tại các cơ sở y tế</p>
          </div>
          <Button size="sm" icon={Plus} variant="primary" onClick={() => setShowJoinModal(true)}>Ứng tuyển mới</Button>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#48a1f3]"/> Đang làm việc tại
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {affiliations.length === 0 && <p className="text-sm text-slate-500 italic">Chưa liên kết bệnh viện nào.</p>}
            {affiliations.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.hospital}</p>
                    <p className="text-sm font-medium text-slate-500">Bác sĩ chuyên khoa</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 shrink-0" onClick={() => {
                  setLeaveForm({ hospital_id: item.id, hospital_name: item.hospital, cover_letter: "" });
                  setShowLeaveModal(true);
                }}>Xin nghỉ</Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Lịch sử ứng tuyển / Xin nghỉ</h3>
          <div className="space-y-3">
            {applications.length === 0 && <p className="text-sm text-slate-500 italic">Chưa có dữ liệu.</p>}
            {applications.map(app => (
              <div key={app.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    {app.hospital?.name}
                    {app.type === "leave" ? 
                      <span className="text-[10px] uppercase font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-md">Xin nghỉ</span> : 
                      <span className="text-[10px] uppercase font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">Ứng tuyển</span>
                    }
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Gửi lúc: {new Date(app.created_at).toLocaleString("vi-VN")}</p>
                </div>
                <div>
                  {app.status === "pending" && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">Đang chờ duyệt</span>}
                  {app.status === "approved" && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">Đã chấp thuận</span>}
                  {app.status === "rejected" && <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">Từ chối</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#143250]">Hồ sơ cá nhân</h2>
            <p className="text-sm text-slate-500 font-medium">Thông tin hiển thị công khai trên cổng đặt khám</p>
          </div>
        </div>

        <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const payload = { ...profileForm };
              if (!payload.password) {
                delete payload.password;
                delete payload.old_password;
              }
              if (payload.experience_years === "") {
                delete payload.experience_years;
              }
              if (payload.category_id === "") {
                delete payload.category_id;
              }

              const updated = await updateMyDoctorProfile(payload);
              setDoctorProfile(updated);
              setProfileForm((prev) => ({ ...prev, password: "", old_password: "" }));
              alert("Cập nhật hồ sơ thành công");
            } catch (err) {
              alert(err.message || "Không thể cập nhật hồ sơ");
            }
          }}
        >
          <div className="flex flex-col md:flex-row gap-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative group w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center text-4xl font-bold text-slate-400 mb-4">
                {profileForm.avatar_url ? (
                  <img src={profileForm.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-16 h-16 opacity-50" />
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                  <Camera className="w-8 h-8 mb-1" />
                  <span className="text-xs font-bold">Đổi ảnh</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      try {
                        setUploadingAvatar(true);
                        const result = await uploadDoctorAvatar(file);
                        setProfileForm((prev) => ({ ...prev, avatar_url: result.image_url, avatar_public_id: result.image_public_id }));
                      } catch (err) { alert(err.message || "Lỗi tải ảnh"); } finally { setUploadingAvatar(false); }
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-slate-400 font-medium">Định dạng: JPG, PNG</p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên hiển thị</label>
                <input
                  type="text" required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#48a1f3] outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Chuyên khoa</label>
                <select
                  value={profileForm.category_id || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, category_id: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#48a1f3] outline-none transition-all font-medium"
                >
                  <option value="">-- Chọn chuyên khoa --</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Chức danh / Bằng cấp</label>
                <input
                  type="text" placeholder="Vd: Thạc sĩ Y khoa, Tiến sĩ..."
                  value={profileForm.degree}
                  onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#48a1f3] outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Chức vụ cụ thể</label>
                <input
                  type="text" placeholder="Vd: Trưởng khoa Ngoại..."
                  value={profileForm.specialty}
                  onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#48a1f3] outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Số năm kinh nghiệm</label>
                <input
                  type="number" placeholder="Vd: 5" min="0"
                  value={profileForm.experience_years}
                  onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#48a1f3] outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Số chứng chỉ hành nghề</label>
                <input
                  type="text" placeholder="Nhập số CCHN..."
                  value={profileForm.license_number}
                  onChange={(e) => setProfileForm({ ...profileForm, license_number: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#48a1f3] outline-none transition-all font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Email đăng nhập</label>
                <input type="email" value={doctorProfile?.email || user?.email || ""} disabled className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed font-medium" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Giới thiệu bản thân (Mô tả)</label>
                <textarea
                  rows={4} placeholder="Chia sẻ kinh nghiệm làm việc để bệnh nhân tin tưởng hơn..."
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#48a1f3] outline-none transition-all font-medium"
                />
              </div>
//               <div className="">
//                 {affiliations.length === 0 && applications.filter(req => req.status !== 'approved').length === 0 && (
//                   <p className="text-sm text-slate-500 text-center py-4">Chưa có liên kết bệnh viện nào.</p>
//                 )}
//               </div>

              <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Đổi Mật Khẩu (Không bắt buộc)</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Mật khẩu cũ</label>
                    <input
                      type="password" placeholder="Nhập để xác thực"
                      value={profileForm.old_password || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, old_password: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#48a1f3] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Mật khẩu mới</label>
                    <input
                      type="password" placeholder="Bỏ trống nếu không đổi"
                      value={profileForm.password || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#48a1f3] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
             <Button type="submit" variant="primary" className="px-8" disabled={loadingProfile}>
               {loadingProfile ? "Đang lưu..." : "Lưu thay đổi"}
             </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#143250]">Đánh giá từ Bệnh nhân</h2>
            <p className="text-sm text-slate-500 font-medium">Tất cả nhận xét sau khi khám xong</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-600 font-black text-lg">
             <Star className="w-5 h-5 fill-amber-500 text-amber-500"/> 4.9 <span className="text-sm font-medium text-amber-600/70 ml-1">/ 5.0</span>
          </div>
        </div>
        <div className="space-y-4">
          {loadingReviews && <p className="text-sm text-slate-500 animate-pulse">Đang tải...</p>}
          {!loadingReviews && doctorReviews.length === 0 && <p className="text-sm text-slate-400 italic">Chưa có đánh giá nào.</p>}
          {doctorReviews.map((rev) => (
            <div key={rev.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg shrink-0">
                {(rev.user?.full_name || "BN").split(" ").map(p => p[0]).join("")}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900">{rev.user?.full_name || "Bệnh nhân ẩn danh"}</h3>
                  <span className="text-xs text-slate-400 font-medium">{formatDateVN(rev.created_at)}</span>
                </div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                     <Star key={i} className={`w-4 h-4 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}/>
                  ))}
                </div>
                <p className="text-sm text-slate-700">{rev.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const handleExportPayments = () => {
    const completedPayments = doctorPayments.filter((p) => p.payment_status === "completed");
    if (completedPayments.length === 0) return alert("Không có dữ liệu để xuất");
    
    const headers = ["Mã GD", "Bệnh nhân", "Ngày thanh toán", "Số tiền (VND)", "Phương thức"];
    const rows = completedPayments.map((p) => [
      `"${p.id}"`,
      `"${p.appointment?.user?.full_name || "Bệnh nhân ẩn danh"}"`,
      `"${formatDateVN(p.paid_at || p.created_at)}"`,
      `"${p.amount}"`,
      `"${p.payment_method}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao_cao_doanh_thu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPayments = () => {
    const completedPayments = doctorPayments.filter((p) => p.payment_status === "completed");
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#143250]">Doanh thu & Thanh toán</h2>
              <p className="text-sm text-slate-500 font-medium">Lịch sử thu phí từ các cuộc hẹn (Chỉ hiển thị giao dịch thành công)</p>
            </div>
            <Button size="sm" variant="outline" icon={Activity} onClick={handleExportPayments}>Báo cáo xuất file</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 text-sm font-bold uppercase tracking-wider">
                  <th className="py-4 px-4 rounded-tl-xl">Mã GD</th>
                  <th className="py-4 px-4">Bệnh nhân</th>
                  <th className="py-4 px-4">Thời gian</th>
                  <th className="py-4 px-4">Số tiền</th>
                  <th className="py-4 px-4 rounded-tr-xl">Phương thức</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {loadingPayments && <tr><td colSpan={5} className="py-8 text-center text-slate-400 animate-pulse">Đang tải...</td></tr>}
                {!loadingPayments && completedPayments.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400">Chưa có giao dịch thành công nào.</td></tr>}
                {completedPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-slate-400 font-mono text-xs">#{payment.id}</td>
                    <td className="py-4 px-4 text-slate-800">{payment.appointment?.user?.full_name || "Bệnh nhân"}</td>
                    <td className="py-4 px-4 text-slate-500">{formatDateVN(payment.paid_at || payment.created_at)}</td>
                    <td className="py-4 px-4 text-emerald-600 font-bold">{Number(payment.amount || 0).toLocaleString("vi-VN")} đ</td>
                    <td className="py-4 px-4 text-slate-500">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold">{payment.payment_method}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const TAB_ITEMS = [
    { id: TABS.OVERVIEW, label: "Tổng quan", icon: LayoutDashboard },
    { id: TABS.SCHEDULES, label: "Lịch làm việc", icon: Calendar },
    { id: TABS.APPOINTMENTS, label: "Lịch hẹn khám", icon: CheckCircle },
    { id: TABS.AFFILIATIONS, label: "Bệnh viện", icon: Building2 },
    { id: TABS.REVIEWS, label: "Đánh giá", icon: Star },
    { id: TABS.PAYMENTS, label: "Doanh thu", icon: DollarSign },
    { id: TABS.PROFILE, label: "Hồ sơ cá nhân", icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-[#f4f8fb] font-sans flex flex-col md:flex-row">
      {/* Mobile Header (Only visible on small screens) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
           <span className="font-black text-[#143250] text-xl">STL Clinic</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-50 rounded-lg text-slate-600">
           {isMobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
         <div className="p-6 md:p-8 flex items-center gap-4 hidden md:flex border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
              <img src={logo} alt="STL Clinic" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-black text-[#143250] text-xl tracking-tight">STL Clinic</h1>
              <p className="text-xs font-bold text-[#48a1f3] uppercase tracking-wider">Doctor Portal</p>
            </div>
         </div>

         <div className="p-6 flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
               {profileForm.avatar_url ? (
                 <img src={profileForm.avatar_url} alt="Avt" className="w-full h-full object-cover" />
               ) : (
                 <UserCircle className="w-8 h-8 text-slate-400" />
               )}
            </div>
            <div className="flex-1 overflow-hidden">
               <p className="text-xs text-slate-500 font-medium">Xin chào bác sĩ,</p>
               <p className="text-sm font-bold text-slate-900 truncate">{doctorProfile?.name || user?.fullName || "Bác sĩ"}</p>
            </div>
         </div>

         <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6">
           {TAB_ITEMS.map((tab) => {
             const Icon = tab.icon;
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                 className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                   isActive 
                    ? "bg-[#48a1f3] text-white shadow-md shadow-[#48a1f3]/30" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#143250]"
                 }`}
               >
                 <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                 {tab.label}
               </button>
             );
           })}
         </nav>

         <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => navigate(PAGES.HOME)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors mb-2"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
              Về trang Bệnh nhân
            </button>
            <button
              onClick={() => { logout(); navigate(PAGES.WELCOME); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              Đăng xuất
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200 sticky top-0 z-30">
           <h2 className="text-2xl font-black text-[#143250]">
             {TAB_ITEMS.find(t => t.id === activeTab)?.label}
           </h2>
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center relative cursor-pointer hover:bg-slate-100 transition">
                <HeartPulse className="w-5 h-5 text-[#48a1f3]" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white box-content"></span>
             </div>
             <Button variant="primary" className="bg-gradient-to-r from-[#143250] to-[#1e4a77] !font-bold" onClick={() => handleQuickCreateSchedule()}>
               + Tạo Lịch Mới
             </Button>
           </div>
        </header>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
           <div className="max-w-6xl mx-auto w-full">
              {activeTab === TABS.OVERVIEW && renderOverview()}
              {activeTab === TABS.SCHEDULES && renderSchedules()}
              {activeTab === TABS.APPOINTMENTS && renderAppointments()}
              {activeTab === TABS.AFFILIATIONS && renderAffiliations()}
              {activeTab === TABS.PROFILE && renderProfile()}
              {activeTab === TABS.REVIEWS && renderReviews()}
              {activeTab === TABS.PAYMENTS && renderPayments()}
           </div>
        </div>
      </main>

      {/* Modals for Join/Leave Hospital */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-[#143250]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-[#143250] mb-2">Ứng tuyển Bệnh viện</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">Liên kết để có thể tạo lịch khám tại đây</p>
            <form onSubmit={handleSubmitJoinForm}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Chọn bệnh viện</label>
                  <select
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#48a1f3] outline-none font-medium"
                    value={joinForm.hospital_id}
                    onChange={(e) => setJoinForm({ ...joinForm, hospital_id: e.target.value })}
                    required
                  >
                    <option value="">-- Chọn bệnh viện --</option>
                    {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Thư ứng tuyển (Không bắt buộc)</label>
                  <textarea
                    rows={4}
                    placeholder="Viết đôi lời giới thiệu về kinh nghiệm của bạn..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#48a1f3] outline-none font-medium"
                    value={joinForm.cover_letter}
                    onChange={(e) => setJoinForm({ ...joinForm, cover_letter: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <Button type="button" variant="ghost" className="flex-1 bg-slate-50" onClick={() => setShowJoinModal(false)}>Hủy</Button>
                <Button type="submit" variant="primary" className="flex-1 bg-[#48a1f3]" disabled={submittingJoin}>{submittingJoin ? "Đang gửi..." : "Gửi yêu cầu"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="fixed inset-0 bg-[#143250]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
               <AlertTriangle className="w-8 h-8"/>
            </div>
            <h3 className="text-xl font-black text-[#143250] mb-2">Xin nghỉ việc</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">
              Bạn đang yêu cầu hủy liên kết với bệnh viện <span className="font-bold text-slate-900">{leaveForm.hospital_name}</span>.
            </p>
            <form onSubmit={handleSubmitLeaveForm}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Lý do nghỉ việc</label>
                  <textarea
                    rows={4}
                    placeholder="Vui lòng cho biết lý do xin nghỉ..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-medium"
                    value={leaveForm.cover_letter}
                    onChange={(e) => setLeaveForm({ ...leaveForm, cover_letter: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <Button type="button" variant="ghost" className="flex-1 bg-slate-50" onClick={() => setShowLeaveModal(false)}>Đóng</Button>
                <Button type="submit" variant="danger" className="flex-1" disabled={submittingLeave}>{submittingLeave ? "Đang gửi..." : "Gửi yêu cầu"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboardPage;
