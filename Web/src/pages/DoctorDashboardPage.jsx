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
  Plus,
  Edit3,
  Share2,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { PAGES } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";
import {
  getSchedulesByDoctor,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../services/doctor.schedules.api";
import {
  getMyDoctorProfile,
  updateMyDoctorProfile,
} from "../services/doctor.profile.api";
import { getHospitals } from "../services/admin.hospitals.api";
import {
  getAppointmentsByDoctor,
  updateAppointmentStatus,
} from "../services/doctor.appointments.api";
import { getPaymentsByDoctor } from "../services/doctor.payments.api";
import { getReviewsByDoctor } from "../services/reviews.api";

const DoctorDashboardPage = ({ navigate }) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    specialty: "",
    description: "",
    avatar_url: "",
    hospitalIds: [],
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [doctorPayments, setDoctorPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [doctorReviews, setDoctorReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    hospital_id: "",
    work_date: "",
    start_time: "08:00",
    end_time: "12:00",
    max_patients: 10,
  });
  const [editingScheduleId, setEditingScheduleId] = useState(null);

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

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await getMyDoctorProfile();
      if (data) {
        setDoctorProfile(data);
        setProfileForm({
          name: data.name || user?.fullName || "",
          specialty: data.specialty || "",
          description: data.description || "",
          avatar_url: data.avatar_url || "",
          hospitalIds: Array.isArray(data.hospitals)
            ? data.hospitals.map((h) => h.id)
            : [],
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
      console.error("Load hospitals for doctor profile error:", e);
    } finally {
      setLoadingHospitals(false);
    }
  };

  useEffect(() => {
    void loadProfile();
    void loadHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!doctorProfile?.id) return;
    void loadSchedules(doctorProfile.id);
    const today = new Date().toISOString().slice(0, 10);
    (async () => {
      try {
        setLoadingAppointments(true);
        const apps = await getAppointmentsByDoctor(doctorProfile.id, today);
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

  const handleQuickCreateSchedule = async () => {
    if (!doctorProfile?.id) {
      alert("Vui lòng lưu hồ sơ bác sĩ trước khi tạo ca làm việc");
      return;
    }

    const linkedHospitals = Array.isArray(doctorProfile.hospitals)
      ? doctorProfile.hospitals
      : [];

    const defaultHospitalId =
      linkedHospitals.length === 1 ? linkedHospitals[0].id : "";

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
    const ok = window.confirm(
      `Bạn có chắc muốn xóa ca làm việc ngày ${entry.work_date} tại bệnh viện ${
        entry.hospital?.name || entry.hospital_id
      }?`
    );
    if (!ok) return;
    try {
      await deleteSchedule(entry.id);
      setSchedules((prev) => prev.filter((s) => s.id !== entry.id));
    } catch (e) {
      alert(e.message || "Không thể xóa ca làm việc");
    }
  };

  const affiliations = useMemo(
    () =>
      Array.isArray(doctorProfile?.hospitals)
        ? doctorProfile.hospitals.map((h) => ({
            id: h.id,
            hospital: h.name,
            // Hiện tại backend chưa có thông tin vai trò / since, tạm để mặc định
            role: "Bác sĩ",
            since: "",
          }))
        : [],
    [doctorProfile?.hospitals]
  );

  const formatDateVN = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d.toString().slice(0, 10);
    return date.toLocaleDateString("vi-VN");
  };

  const handleConfirmAppointment = async (appointment) => {
    try {
      const updated = await updateAppointmentStatus(
        appointment.id,
        "confirmed"
      );
      setDoctorAppointments((prev) =>
        prev.map((apt) => (apt.id === updated.id ? updated : apt))
      );
    } catch (e) {
      alert(e.message || "Không thể xác nhận lịch hẹn");
    }
  };

  const handleRejectAppointment = async (appointment) => {
    const reason =
      window.prompt("Nhập lý do từ chối lịch hẹn này (bắt buộc):") || "";
    if (!reason.trim()) {
      alert("Bạn cần nhập lý do khi từ chối lịch hẹn.");
      return;
    }
    try {
      const updated = await updateAppointmentStatus(
        appointment.id,
        "rejected",
        reason.trim()
      );
      setDoctorAppointments((prev) =>
        prev.map((apt) => (apt.id === updated.id ? updated : apt))
      );
    } catch (e) {
      alert(e.message || "Không thể từ chối lịch hẹn");
    }
  };

  const handleCompleteAppointment = async (appointment) => {
    const ok = window.confirm(
      `Xác nhận đã khám xong cho lịch hẹn #${appointment.id}?`
    );
    if (!ok) return;
    try {
      const updated = await updateAppointmentStatus(
        appointment.id,
        "completed"
      );
      setDoctorAppointments((prev) =>
        prev.map((apt) => (apt.id === updated.id ? updated : apt))
      );
    } catch (e) {
      alert(e.message || "Không thể cập nhật trạng thái lịch hẹn");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400">
              Doctor workspace
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Xin chào,
              {doctorProfile?.name || user?.fullName || "Bác sĩ"} 👋
            </h1>
            <p className="text-slate-500 max-w-2xl">
              Theo dõi lịch làm việc, quản lý lịch hẹn, xem đánh giá và doanh
              thu của bạn trong một bảng điều khiển duy nhất.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => navigate(PAGES.HOME)}
            >
              Về trang bệnh nhân
            </Button>
            <Button
              variant="primary"
              icon={Edit3}
              onClick={() => {
                setShowProfile((prev) => !prev);
                setTimeout(() => {
                  profileRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
            >
              {showProfile ? "Ẩn hồ sơ" : "Hồ sơ của tôi"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Doctor Profile */}
        {showProfile && (
          <Card ref={profileRef}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-lg font-semibold text-slate-700">
                  {(doctorProfile?.name || user?.fullName || "BS")
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Hồ sơ bác sĩ
                  </h2>
                  <p className="text-sm text-slate-500">
                    Cập nhật thông tin hiển thị cho bệnh nhân và admin.
                  </p>
                </div>
              </div>
            </div>

            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const updated = await updateMyDoctorProfile(profileForm);
                  setDoctorProfile(updated);
                  alert("Cập nhật hồ sơ thành công");
                } catch (err) {
                  alert(err.message || "Không thể cập nhật hồ sơ");
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Họ tên bác sĩ
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email đăng nhập
                </label>
                <input
                  type="email"
                  value={doctorProfile?.email || user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Thay đổi email ở mục Cài đặt tài khoản.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={user?.phone || ""}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Cập nhật số điện thoại trong Cài đặt tài khoản.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value="********"
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Đổi mật khẩu tại trang Cài đặt &gt; Bảo mật.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Chuyên khoa
                </label>
                <input
                  type="text"
                  value={profileForm.specialty}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      specialty: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả ngắn
                </label>
                <textarea
                  value={profileForm.description}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bệnh viện đang làm việc
                </label>
                {loadingHospitals && (
                  <p className="text-xs text-slate-500">
                    Đang tải danh sách bệnh viện...
                  </p>
                )}
                {!loadingHospitals && (
                  <div className="flex flex-wrap gap-2">
                    {hospitals.map((h) => {
                      const checked = profileForm.hospitalIds?.includes(h.id);
                      return (
                        <label
                          key={h.id}
                          className="inline-flex items-center gap-1 px-2 py-1 border rounded-full text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={!!checked}
                            onChange={(e) => {
                              setProfileForm((prev) => {
                                const current = prev.hospitalIds || [];
                                if (e.target.checked) {
                                  return {
                                    ...prev,
                                    hospitalIds: [...current, h.id],
                                  };
                                }
                                return {
                                  ...prev,
                                  hospitalIds: current.filter(
                                    (id) => id !== h.id
                                  ),
                                };
                              });
                            }}
                          />
                          <span>{h.name}</span>
                        </label>
                      );
                    })}
                    {!hospitals.length && (
                      <span className="text-xs text-slate-400">
                        Chưa có dữ liệu bệnh viện
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" size="sm" variant="primary">
                  {loadingProfile ? "Đang lưu..." : "Lưu hồ sơ"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            {
              title: "Cuộc hẹn tuần này",
              value: "18",
              detail: "+3 mới",
              icon: Calendar,
              color: "bg-blue-50 text-blue-600",
            },
            {
              title: "Giờ làm việc",
              value: "32h",
              detail: "3 cơ sở y tế",
              icon: Clock,
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              title: "Điểm đánh giá",
              value: "4.9",
              detail: "256 nhận xét",
              icon: Star,
              color: "bg-amber-50 text-amber-600",
            },
            {
              title: "Thu nhập tháng",
              value: "62 triệu",
              detail: "+8% so với tháng trước",
              icon: DollarSign,
              color: "bg-purple-50 text-purple-600",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500">{card.detail}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Schedule */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Lịch làm việc
              </h2>
              <p className="text-sm text-slate-500">
                Đăng ký ca làm tại các bệnh viện liên kết
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" icon={Share2}>
                Đồng bộ lịch
              </Button>
              <Button size="sm" icon={Plus} onClick={handleQuickCreateSchedule}>
                Thêm ca làm việc
              </Button>
            </div>
          </div>

          {showScheduleForm && (
            <div className="mb-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                {editingScheduleId
                  ? "Cập nhật ca làm việc"
                  : "Thêm ca làm việc mới"}
              </h3>
              <form
                className="grid gap-3 md:grid-cols-4 items-end"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!doctorProfile?.id) return;
                  if (!scheduleForm.hospital_id) {
                    alert("Vui lòng chọn bệnh viện");
                    return;
                  }
                  if (!scheduleForm.work_date) {
                    alert("Vui lòng chọn ngày làm việc");
                    return;
                  }
                  try {
                    const payload = {
                      doctor_id: doctorProfile.id,
                      hospital_id: scheduleForm.hospital_id,
                      work_date: scheduleForm.work_date,
                      start_time: `${scheduleForm.start_time}:00`,
                      end_time: `${scheduleForm.end_time}:00`,
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
                    alert(err.message || "Không thể tạo ca làm việc");
                  }
                }}
              >
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Bệnh viện
                  </label>
                  <select
                    value={scheduleForm.hospital_id}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        hospital_id: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">-- Chọn bệnh viện --</option>
                    {doctorProfile?.hospitals?.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Ngày làm việc
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.work_date}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        work_date: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Bắt đầu
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.start_time}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          start_time: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Kết thúc
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.end_time}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          end_time: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Số bệnh nhân tối đa
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={scheduleForm.max_patients}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        max_patients: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="flex gap-2 md:col-span-4 justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setShowScheduleForm(false);
                      setEditingScheduleId(null);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" size="sm" variant="primary">
                    {editingScheduleId
                      ? "Cập nhật ca làm việc"
                      : "Lưu ca làm việc"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {loadingSchedules && (
              <p className="text-sm text-slate-500">
                Đang tải lịch làm việc...
              </p>
            )}
            {!loadingSchedules && schedules.length === 0 && (
              <p className="text-sm text-slate-500">
                Chưa có ca làm việc nào. Hãy thêm ca mới.
              </p>
            )}
            {schedules.map((entry) => (
              <Card key={entry.id} padding="sm" shadow="none">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                      🏥
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        {entry.hospital?.name
                          ? `Bệnh viện: ${entry.hospital.name}`
                          : `Bệnh viện ID: ${entry.hospital_id}`}
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {entry.work_date}
                      </p>
                      <p className="text-sm text-slate-500">
                        Tối đa {entry.max_patients ?? 10} bệnh nhân
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {entry.start_time?.slice(0, 5)} -{" "}
                      {entry.end_time?.slice(0, 5)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Edit3}
                        onClick={() => handleStartEditSchedule(entry)}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteSchedule(entry)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Appointments & Affiliations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Lịch hẹn sắp tới
                </h2>
                <p className="text-sm text-slate-500">
                  Quản lý trạng thái và thông tin bệnh nhân
                </p>
              </div>
              <Button size="sm" variant="ghost">
                Xem tất cả
              </Button>
            </div>
            <div className="space-y-4">
              {loadingAppointments && (
                <p className="text-sm text-slate-500">Đang tải lịch hẹn...</p>
              )}
              {!loadingAppointments && doctorAppointments.length === 0 && (
                <p className="text-sm text-slate-500">
                  Hôm nay chưa có lịch hẹn nào.
                </p>
              )}
              {doctorAppointments.slice(0, 6).map((appointment) => (
                <Card key={appointment.id} padding="sm" shadow="none">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-400">
                        #{appointment.id}
                      </p>
                      <h3 className="font-semibold text-slate-900">
                        {appointment.user?.full_name || "Bệnh nhân"}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {formatDateVN(appointment.appointment_date)} ·{" "}
                        {appointment.appointment_time?.slice(0, 5)} ·{" "}
                        {appointment.hospital?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Lý do: {appointment.symptoms}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {appointment.status === "confirmed" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Đã xác nhận
                        </span>
                      ) : appointment.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-400 text-slate-700 text-xs font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Đã khám xong
                        </span>
                      ) : appointment.status === "rejected" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          Đã từ chối
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          Chờ duyệt
                        </span>
                      )}
                      {appointment.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleConfirmAppointment(appointment)
                            }
                          >
                            Xác nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleRejectAppointment(appointment)}
                          >
                            Từ chối
                          </Button>
                        </div>
                      )}
                      {appointment.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteAppointment(appointment)}
                        >
                          Đã khám xong
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Liên kết bệnh viện
                </h2>
                <p className="text-sm text-slate-500">
                  Bác sĩ có thể làm việc tại nhiều cơ sở
                </p>
              </div>
              <Button size="sm" icon={Plus}>
                Thêm liên kết
              </Button>
            </div>

            <div className="space-y-4">
              {affiliations.map((item) => (
                <Card key={item.id} padding="sm" shadow="none">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.hospital}
                        </p>
                        <p className="text-sm text-slate-500">
                          Vai trò: {item.role}
                        </p>
                        <p className="text-xs text-slate-400">
                          Gắn kết từ {item.since}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      Quản lý
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Reviews & Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Phản hồi từ bệnh nhân
                </h2>
                <p className="text-sm text-slate-500">
                  Theo dõi chất lượng dịch vụ
                </p>
              </div>
              <Button size="sm" variant="ghost">
                Tải thêm
              </Button>
            </div>

            <div className="space-y-4">
              {loadingReviews && (
                <p className="text-sm text-slate-500">Đang tải đánh giá...</p>
              )}
              {!loadingReviews && doctorReviews.length === 0 && (
                <p className="text-sm text-slate-500">
                  Chưa có phản hồi nào từ bệnh nhân.
                </p>
              )}
              {doctorReviews.map((review) => (
                <Card key={review.id} padding="sm" shadow="none">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-semibold">
                      {(review.user?.full_name || "BN")
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {review.user?.full_name || "Bệnh nhân"}
                        </p>
                        <span className="text-xs text-slate-400">
                          {formatDateVN(review.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-amber-500">
                        ⭐ {review.rating} / 5
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Doanh thu & thanh toán
                </h2>
                <p className="text-sm text-slate-500">
                  Theo dõi khoản thu từ các lịch hẹn
                </p>
              </div>
              <Button size="sm" variant="outline" icon={Activity}>
                Báo cáo chi tiết
              </Button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2">Mã</th>
                    <th>Bệnh nhân</th>
                    <th>Ngày</th>
                    <th>Số tiền</th>
                    <th>Phương thức</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPayments && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-3 text-center text-slate-500"
                      >
                        Đang tải thanh toán...
                      </td>
                    </tr>
                  )}
                  {!loadingPayments && doctorPayments.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-3 text-center text-slate-500"
                      >
                        Chưa có thanh toán nào.
                      </td>
                    </tr>
                  )}
                  {doctorPayments.slice(0, 10).map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3 font-mono text-xs text-slate-400">
                        {payment.id}
                      </td>
                      <td>
                        {payment.appointment?.user?.full_name || "Bệnh nhân"}
                      </td>
                      <td className="text-slate-500">
                        {formatDateVN(payment.paid_at || payment.created_at)}
                      </td>
                      <td className="text-emerald-600 font-semibold">
                        {Number(payment.amount || 0).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="text-slate-500">
                        {payment.payment_method}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Callout */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-700 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">
                Cần hỗ trợ từ quản trị?
              </h3>
              <p className="text-sm text-white/70 max-w-2xl">
                Gửi yêu cầu cập nhật hồ sơ bác sĩ, liên kết bệnh viện mới hoặc
                hỗ trợ về lịch hẹn. Đội ngũ admin phản hồi trong vòng 24h.
              </p>
            </div>
            <Button variant="secondary" icon={MessageCircle}>
              Liên hệ nhanh
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
