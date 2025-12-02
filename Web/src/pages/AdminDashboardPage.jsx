import React, { useEffect, useState, useMemo } from "react";
import {
  Building,
  Stethoscope,
  Users,
  Layers,
  Activity,
  Shield,
  Banknote,
  Eye,
  ClipboardList,
  Search,
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Home,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { PAGES } from "../utils/constants";
import { formatDate } from "../utils/helpers";
import {
  getHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
} from "../services/admin.hospitals.api";
import {
  getDoctors,
  createDoctor,
  toggleDoctorActive,
  deleteDoctor,
} from "../services/admin.doctors.api";
import {
  getUsers,
  toggleUserActive,
  deleteUserAdmin,
} from "../services/admin.users.api";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/admin.categories.api";
import { getAllPayments } from "../services/admin.payments.api";
import { getAllReviews } from "../services/reviews.api";

const AdminDashboardPage = ({ navigate }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [hospitalForm, setHospitalForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    main_specialty: "",
    categoryIds: [],
  });
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    password: "",
    description: "",
    category_id: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
  });
  const [adminReviews, setAdminReviews] = useState([]);
  const [loadingReviewsAdmin, setLoadingReviewsAdmin] = useState(false);
  const [adminPayments, setAdminPayments] = useState([]);
  const [loadingPaymentsAdmin, setLoadingPaymentsAdmin] = useState(false);

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

  useEffect(() => {
    void loadHospitals();
    void loadDoctors();
    void loadUsers();
    void loadCategories();
    void loadAdminReviews();
    void loadAdminPayments();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const data = await getDoctors();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load doctors error:", e);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load users error:", e);
    } finally {
      setLoadingUsers(false);
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

  const loadAdminReviews = async () => {
    try {
      setLoadingReviewsAdmin(true);
      const data = await getAllReviews();
      setAdminReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load admin reviews error:", e);
    } finally {
      setLoadingReviewsAdmin(false);
    }
  };

  const loadAdminPayments = async () => {
    try {
      setLoadingPaymentsAdmin(true);
      const data = await getAllPayments();
      setAdminPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load admin payments error:", e);
    } finally {
      setLoadingPaymentsAdmin(false);
    }
  };

  const resetForm = () => {
    setEditingHospital(null);
    setHospitalForm({
      name: "",
      address: "",
      phone: "",
      email: "",
      main_specialty: "",
      categoryIds: [],
    });
  };

  const handleEditHospital = (hospital) => {
    setEditingHospital(hospital);
    setHospitalForm({
      name: hospital.name || "",
      address: hospital.address || "",
      phone: hospital.phone || "",
      email: hospital.email || "",
      main_specialty: hospital.main_specialty || "",
      // map categories -> ids (nếu có)
      categoryIds: Array.isArray(hospital.categories)
        ? hospital.categories.map((c) => c.id)
        : [],
    });
  };

  const handleSubmitHospital = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...hospitalForm,
        categoryIds: hospitalForm.categoryIds || [],
      };

      if (editingHospital) {
        await updateHospital(editingHospital.id, payload);
      } else {
        await createHospital(payload);
      }
      resetForm();
      void loadHospitals();
    } catch (err) {
      alert(err.message || "Không thể lưu bệnh viện");
    }
  };

  const handleDeleteHospital = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bệnh viện này?")) return;
    try {
      await deleteHospital(id);
      void loadHospitals();
    } catch (e) {
      alert(e.message || "Không thể xóa bệnh viện");
    }
  };

  const handleToggleDoctor = async (doctor) => {
    try {
      await toggleDoctorActive(doctor.id);
      void loadDoctors();
    } catch (e) {
      alert(e.message || "Không thể cập nhật trạng thái bác sĩ");
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bác sĩ này?")) return;
    try {
      await deleteDoctor(id);
      void loadDoctors();
    } catch (e) {
      alert(e.message || "Không thể xóa bác sĩ");
    }
  };

  const handleSubmitDoctor = async (e) => {
    e.preventDefault();
    try {
      await createDoctor({
        ...doctorForm,
        category_id: doctorForm.category_id
          ? Number(doctorForm.category_id)
          : undefined,
      });
      setDoctorForm({
        name: "",
        specialty: "",
        email: "",
        phone: "",
        password: "",
        description: "",
        category_id: "",
      });
      void loadDoctors();
    } catch (e) {
      alert(e.message || "Không thể tạo bác sĩ");
    }
  };

  const handleToggleUser = async (user) => {
    try {
      await toggleUserActive(user.id, user.is_active ?? true);
      void loadUsers();
    } catch (e) {
      alert(e.message || "Không thể cập nhật trạng thái người dùng");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      await deleteUserAdmin(id);
      void loadUsers();
    } catch (e) {
      alert(e.message || "Không thể xóa người dùng");
    }
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "" });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name || "" });
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: categoryForm.name });
      } else {
        await createCategory({ name: categoryForm.name });
      }
      resetCategoryForm();
      void loadCategories();
    } catch (e) {
      alert(e.message || "Không thể lưu chuyên khoa");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa chuyên khoa này?")) return;
    try {
      await deleteCategory(id);
      void loadCategories();
    } catch (e) {
      alert(e.message || "Không thể xóa chuyên khoa");
    }
  };

  // Ẩn tài khoản admin khỏi danh sách người dùng để tránh thao tác xóa / khóa nhầm
  const visibleUsers = users.filter((u) => u.role !== "admin");

  // Tính số sao trung bình cho mỗi doctor
  const doctorRatings = useMemo(() => {
    const doctorMap = new Map();

    adminReviews.forEach((review) => {
      const doctorId = review.doctor_id || review.doctor?.id;
      const doctorName = review.doctor?.name || review.doctor_name || "Bác sĩ";
      const rating = review.rating;

      if (doctorId && rating != null) {
        if (!doctorMap.has(doctorId)) {
          doctorMap.set(doctorId, {
            doctorId,
            doctorName,
            ratings: [],
            totalRating: 0,
            count: 0,
          });
        }

        const doctorData = doctorMap.get(doctorId);
        doctorData.ratings.push(rating);
        doctorData.totalRating += Number(rating);
        doctorData.count += 1;
      }
    });

    // Tính trung bình và sắp xếp theo số sao giảm dần
    return Array.from(doctorMap.values())
      .map((data) => ({
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        averageRating:
          data.count > 0 ? (data.totalRating / data.count).toFixed(1) : "0.0",
        totalReviews: data.count,
      }))
      .sort((a, b) => Number(b.averageRating) - Number(a.averageRating));
  }, [adminReviews]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/80">
              Admin workspace
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Trung tâm điều hành hệ thống
            </h1>
            <p className="text-white/90 max-w-2xl">
              Giám sát bệnh viện, bác sĩ, bệnh nhân, chuyên khoa và đảm bảo chất
              lượng dịch vụ thông qua đánh giá và thanh toán.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="ghost"
              icon={Home}
              onClick={() => navigate(PAGES.HOME)}
            >
              Về trang bệnh nhân
            </Button>
            <Button variant="primary" icon={Plus}>
              Tạo yêu cầu mới
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            {
              title: "Bệnh viện",
              value: "12",
              change: "+2 mới / tuần",
              icon: Building,
              color: "bg-indigo-50 text-indigo-600",
            },
            {
              title: "Bác sĩ",
              value: "58",
              change: "46 đang hoạt động",
              icon: Stethoscope,
              color: "bg-purple-50 text-purple-600",
            },
            {
              title: "Bệnh nhân",
              value: "4,230",
              change: "+180 tháng này",
              icon: Users,
              color: "bg-pink-50 text-pink-600",
            },
            {
              title: "Doanh thu",
              value: "1.2 tỷ",
              change: "+12% so với tháng trước",
              icon: Banknote,
              color: "bg-emerald-50 text-emerald-600",
            },
          ].map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500">{card.change}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Hospitals & Doctors */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Quản lý bệnh viện
                </h2>
                <p className="text-sm text-gray-500">
                  Thêm/Sửa/Xóa thông tin cơ sở y tế
                </p>
              </div>
              <Button
                size="sm"
                onClick={resetForm}
                variant={editingHospital ? "secondary" : "primary"}
              >
                {editingHospital ? "Tạo mới" : "Reset"}
              </Button>
            </div>

            {/* Form tạo / sửa bệnh viện */}
            <form onSubmit={handleSubmitHospital} className="mb-6 grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên bệnh viện
                  </label>
                  <input
                    type="text"
                    value={hospitalForm.name}
                    onChange={(e) =>
                      setHospitalForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chuyên khoa chính
                  </label>
                  <input
                    type="text"
                    value={hospitalForm.main_specialty}
                    onChange={(e) =>
                      setHospitalForm((prev) => ({
                        ...prev,
                        main_specialty: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={hospitalForm.address}
                  onChange={(e) =>
                    setHospitalForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={hospitalForm.phone}
                    onChange={(e) =>
                      setHospitalForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={hospitalForm.email}
                    onChange={(e) =>
                      setHospitalForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              {/* Chọn nhiều chuyên khoa cho bệnh viện */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên khoa áp dụng
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const checked = hospitalForm.categoryIds?.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className="inline-flex items-center gap-1 px-2 py-1 border rounded-full text-xs cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={!!checked}
                          onChange={(e) => {
                            setHospitalForm((prev) => {
                              const current = prev.categoryIds || [];
                              if (e.target.checked) {
                                return {
                                  ...prev,
                                  categoryIds: [...current, cat.id],
                                };
                              }
                              return {
                                ...prev,
                                categoryIds: current.filter(
                                  (id) => id !== cat.id
                                ),
                              };
                            });
                          }}
                        />
                        <span>{cat.name}</span>
                      </label>
                    );
                  })}
                  {!categories.length && (
                    <span className="text-xs text-gray-400">
                      Chưa có dữ liệu chuyên khoa
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {editingHospital && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={resetForm}
                  >
                    Hủy
                  </Button>
                )}
                <Button type="submit" variant="primary" size="sm">
                  {editingHospital ? "Cập nhật bệnh viện" : "Tạo bệnh viện"}
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              {loadingHospitals && (
                <p className="text-sm text-gray-500">Đang tải bệnh viện...</p>
              )}
              {!loadingHospitals && hospitals.length === 0 && (
                <p className="text-sm text-gray-500">
                  Chưa có bệnh viện nào. Hãy thêm mới.
                </p>
              )}
              {hospitals.map((hospital) => (
                <Card key={hospital.id} padding="sm" shadow="none">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {hospital.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {hospital.address}
                      </p>
                      <p className="text-sm text-gray-500">
                        Điện thoại: {hospital.phone} · Email: {hospital.email}
                      </p>
                      {hospital.main_specialty && (
                        <p className="text-sm text-gray-500">
                          Chuyên khoa chính: {hospital.main_specialty}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit3}
                        onClick={() => handleEditHospital(hospital)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteHospital(hospital.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Quản lý bác sĩ
                </h2>
                <p className="text-sm text-gray-500">
                  Phê duyệt & khóa tài khoản bác sĩ
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() =>
                  setDoctorForm({
                    name: "",
                    specialty: "",
                    email: "",
                    phone: "",
                    password: "",
                    description: "",
                  })
                }
              >
                Reset
              </Button>
            </div>

            {/* Form tạo bác sĩ */}
            <form onSubmit={handleSubmitDoctor} className="mb-6 grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên bác sĩ
                  </label>
                  <input
                    type="text"
                    value={doctorForm.name}
                    onChange={(e) =>
                      setDoctorForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chuyên khoa
                  </label>
                  <select
                    value={doctorForm.category_id}
                    onChange={(e) => {
                      const categoryId = e.target.value
                        ? Number(e.target.value)
                        : "";
                      const selected = categories.find(
                        (c) => c.id === Number(e.target.value)
                      );
                      setDoctorForm((prev) => ({
                        ...prev,
                        category_id: categoryId,
                        specialty: selected?.name || prev.specialty,
                      }));
                    }}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Chọn chuyên khoa</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) =>
                      setDoctorForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={doctorForm.phone}
                    onChange={(e) =>
                      setDoctorForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu đăng nhập
                  </label>
                  <input
                    type="password"
                    value={doctorForm.password}
                    onChange={(e) =>
                      setDoctorForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả ngắn
                  </label>
                  <input
                    type="text"
                    value={doctorForm.description}
                    onChange={(e) =>
                      setDoctorForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" variant="primary">
                  Tạo bác sĩ
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              {loadingDoctors && (
                <p className="text-sm text-gray-500">
                  Đang tải danh sách bác sĩ...
                </p>
              )}
              {!loadingDoctors && doctors.length === 0 && (
                <p className="text-sm text-gray-500">
                  Chưa có bác sĩ nào (hoặc API chưa trả dữ liệu).
                </p>
              )}
              {doctors.map((doctor) => (
                <Card key={doctor.id} padding="sm" shadow="none">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {doctor.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {doctor.specialty}
                        {doctor.category?.name
                          ? ` · Chuyên khoa: ${doctor.category.name}`
                          : ""}
                      </p>
                      <p className="text-xs text-gray-400">
                        Email: {doctor.email} · SĐT: {doctor.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-sm text-gray-600"
                        onClick={() => handleToggleDoctor(doctor)}
                      >
                        {doctor.is_active ? (
                          <>
                            <ToggleRight className="text-green-500" />
                            <span>Đang hoạt động</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="text-gray-400" />
                            <span>Tạm khóa</span>
                          </>
                        )}
                      </button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteDoctor(doctor.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Users & Categories */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Quản lý người dùng
                </h2>
                <p className="text-sm text-gray-500">
                  Danh sách bệnh nhân đã đăng ký
                </p>
              </div>
              <Button size="sm" variant="outline">
                Xuất danh sách
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">Tên</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th className="text-center">Lịch hẹn</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-3 text-center text-gray-500"
                      >
                        Đang tải người dùng...
                      </td>
                    </tr>
                  )}
                  {!loadingUsers && visibleUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-3 text-center text-gray-500"
                      >
                        Chưa có người dùng nào.
                      </td>
                    </tr>
                  )}
                  {!loadingUsers &&
                    visibleUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-3 font-medium text-gray-900">
                          {user.full_name}
                        </td>
                        <td className="text-gray-500">{user.email}</td>
                        <td className="text-gray-500">{user.phone}</td>
                        <td className="text-center">
                          {Array.isArray(user.appointments)
                            ? user.appointments.length
                            : ""}
                        </td>
                        <td className="text-right space-x-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-sm text-gray-600"
                            onClick={() => handleToggleUser(user)}
                          >
                            {user.is_active ?? true ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-green-500" />
                                <span>Đang hoạt động</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-gray-400" />
                                <span>Tạm ngưng</span>
                              </>
                            )}
                          </button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Danh mục / Chuyên khoa
                </h2>
                <p className="text-sm text-gray-500">
                  Quản lý danh sách chuyên khoa
                </p>
              </div>
              <Button
                size="sm"
                onClick={resetCategoryForm}
                variant={editingCategory ? "secondary" : "primary"}
              >
                {editingCategory ? "Tạo mới" : "Reset"}
              </Button>
            </div>

            {/* Form tạo / sửa chuyên khoa */}
            <form onSubmit={handleSubmitCategory} className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên chuyên khoa
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                {editingCategory && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={resetCategoryForm}
                  >
                    Hủy
                  </Button>
                )}
                <Button type="submit" size="sm" variant="primary">
                  {editingCategory ? "Cập nhật" : "Tạo chuyên khoa"}
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              {loadingCategories && (
                <p className="text-sm text-gray-500">Đang tải chuyên khoa...</p>
              )}
              {!loadingCategories && categories.length === 0 && (
                <p className="text-sm text-gray-500">
                  Chưa có chuyên khoa nào. Hãy thêm mới.
                </p>
              )}
              {categories.map((category) => (
                <Card key={category.id} padding="sm" shadow="none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {category.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit3}
                        onClick={() => handleEditCategory(category)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteCategory(category.id)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Monitoring */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Giám sát đánh giá
                </h2>
                <p className="text-sm text-gray-500">
                  Số sao trung bình của từng bác sĩ
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={Eye}>
                  Xem tất cả
                </Button>
                <Button variant="danger" size="sm" icon={Shield}>
                  Báo cáo
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {loadingReviewsAdmin && (
                <p className="text-sm text-gray-500">
                  Đang tải danh sách đánh giá...
                </p>
              )}
              {!loadingReviewsAdmin && doctorRatings.length === 0 && (
                <p className="text-sm text-gray-500">
                  Chưa có đánh giá nào cho bác sĩ.
                </p>
              )}
              {!loadingReviewsAdmin &&
                doctorRatings.map((doctorRating) => (
                  <Card key={doctorRating.doctorId} padding="sm" shadow="none">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {doctorRating.doctorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {doctorRating.totalReviews} đánh giá
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-amber-500">
                            ⭐ {doctorRating.averageRating}
                          </span>
                          <span className="text-sm text-gray-500">/ 5.0</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Giám sát thanh toán
                </h2>
                <p className="text-sm text-gray-500">
                  Đối soát doanh thu từng lịch hẹn
                </p>
              </div>
              <Button variant="outline" size="sm" icon={ClipboardList}>
                Xuất báo cáo
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">Mã</th>
                    <th>Bệnh nhân</th>
                    <th>Doctor</th>
                    <th>Số tiền</th>
                    <th>Phương thức</th>
                    <th>Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPaymentsAdmin && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-3 text-center text-gray-500"
                      >
                        Đang tải danh sách thanh toán...
                      </td>
                    </tr>
                  )}
                  {!loadingPaymentsAdmin && adminPayments.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-3 text-center text-gray-500"
                      >
                        Chưa có thanh toán nào.
                      </td>
                    </tr>
                  )}
                  {!loadingPaymentsAdmin &&
                    adminPayments.map((payment) => {
                      const patientName =
                        payment.appointment?.user?.full_name ||
                        payment.patient_name ||
                        "Bệnh nhân";
                      const doctorName =
                        payment.appointment?.doctor?.name ||
                        payment.doctor_name ||
                        "Bác sĩ";
                      const createdRaw =
                        payment.paid_at ||
                        payment.created_at ||
                        payment.createdAt;
                      const createdText = createdRaw
                        ? formatDate(createdRaw.toString().slice(0, 10))
                        : "";
                      const amountNumber =
                        typeof payment.amount === "number"
                          ? payment.amount
                          : Number(payment.amount || 0);
                      return (
                        <tr key={payment.id} className="border-b last:border-0">
                          <td className="py-3 font-mono text-xs text-gray-500">
                            {`PAY-${payment.id}`}
                          </td>
                          <td>{patientName}</td>
                          <td>{doctorName}</td>
                          <td className="text-emerald-600 font-semibold">
                            {amountNumber.toLocaleString("vi-VN")}đ
                          </td>
                          <td className="text-gray-500">
                            {payment.payment_method || payment.method || "-"}
                          </td>
                          <td className="text-gray-500">{createdText}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
