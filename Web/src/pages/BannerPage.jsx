import { useEffect, useState } from "react";
import {
  createHospitalBanner,
  deleteHospitalBanner,
  getHospitalBanners,
  updateHospitalBanner,
  uploadHospitalBannerImage,
} from "../services/admin.hospital.banner.api";

const initialForm = {
  title: "",
  description: "",
  image_url: "",
  image_public_id: "",
  redirect_url: "",
  is_active: true,
  priority: 0,
  start_date: "",
  end_date: "",
  category_id: "",
  doctor_id: "",
};

export default function BannerPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await getHospitalBanners();
      setBanners(data || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const formatPayload = (data) => {
    return {
      title: data.title,
      description: data.description || null,
      image_url: data.image_url,
      image_public_id: data.image_public_id || null,
      redirect_url: data.redirect_url || null,
      is_active: Boolean(data.is_active),
      priority: Number(data.priority) || 0,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      category_id: data.category_id ? Number(data.category_id) : null,
      doctor_id: data.doctor_id ? Number(data.doctor_id) : null,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      let imageData = {
        image_url: form.image_url,
        image_public_id: form.image_public_id,
      };

      if (selectedFile) {
        imageData = await uploadHospitalBannerImage(selectedFile);
      }

      const payload = formatPayload({
        ...form,
        image_url: imageData.image_url,
        image_public_id: imageData.image_public_id,
      });

      if (!payload.image_url) {
        throw new Error("Vui lòng chọn ảnh banner");
      }

      if (editingId) {
        await updateHospitalBanner(editingId, payload);
        setMessage("Cập nhật banner thành công");
      } else {
        await createHospitalBanner(payload);
        setMessage("Tạo banner thành công");
      }

      setForm(initialForm);
      setEditingId(null);
      setSelectedFile(null);
      setPreviewUrl("");
      await loadBanners();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);

    setForm({
      title: banner.title || "",
      description: banner.description || "",
      image_url: banner.image_url || "",
      image_public_id: banner.image_public_id || "",
      redirect_url: banner.redirect_url || "",
      is_active: Boolean(banner.is_active),
      priority: banner.priority ?? 0,
      start_date: banner.start_date ? banner.start_date.slice(0, 10) : "",
      end_date: banner.end_date ? banner.end_date.slice(0, 10) : "",
      category_id: banner.category_id || "",
      doctor_id: banner.doctor_id || "",
    });

    setPreviewUrl(banner.image_url || "");
    setSelectedFile(null);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa banner này?");

    if (!confirmDelete) return;

    try {
      setLoading(true);
      await deleteHospitalBanner(id);
      setMessage("Xóa banner thành công");
      await loadBanners();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setSelectedFile(null);
    setPreviewUrl("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý banner bệnh viện
          </h1>
          <p className="text-sm text-gray-500">
            Admin hospital có thể tạo, cập nhật, bật/tắt và xóa banner.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl bg-white p-5 shadow"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {editingId ? "Cập nhật banner" : "Tạo banner mới"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Tiêu đề
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Nhập tiêu đề banner"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Mô tả</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Nhập mô tả"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Ảnh banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full rounded-lg border px-3 py-2"
                />

                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Banner preview"
                    className="mt-3 h-36 w-full rounded-lg object-cover"
                  />
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Redirect URL
                </label>
                <input
                  name="redirect_url"
                  value={form.redirect_url}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="/doctors/1 hoặc /categories/2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Category ID
                  </label>
                  <input
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    type="number"
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Doctor ID
                  </label>
                  <input
                    name="doctor_id"
                    value={form.doctor_id}
                    onChange={handleChange}
                    type="number"
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Priority
                </label>
                <input
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Ngày bắt đầu
                  </label>
                  <input
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Ngày kết thúc
                  </label>
                  <input
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleChange}
                />
                Đang hoạt động
              </label>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {editingId ? "Cập nhật" : "Tạo mới"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="rounded-xl bg-white p-5 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Danh sách banner
              </h2>
              <button
                onClick={loadBanners}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Tải lại
              </button>
            </div>

            {loading && <p className="text-sm text-gray-500">Đang tải...</p>}

            <div className="space-y-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="overflow-hidden rounded-xl border bg-white"
                >
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="h-44 w-full object-cover"
                  />

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {banner.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {banner.description || "Không có mô tả"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          banner.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {banner.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>Priority: {banner.priority}</p>
                      <p>Doctor ID: {banner.doctor_id || "-"}</p>
                      <p>Category ID: {banner.category_id || "-"}</p>
                      <p>URL: {banner.redirect_url || "-"}</p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="rounded-lg bg-yellow-500 px-3 py-2 text-sm text-white hover:bg-yellow-600"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && banners.length === 0 && (
                <p className="text-sm text-gray-500">Chưa có banner nào.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
