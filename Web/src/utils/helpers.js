// Generate ID
export const generateId = () => {
  return "MD" + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Format Date
export const formatDate = (date) => {
  if (!date) return "";

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

// Format Currency
export const formatCurrency = (amount) => {
  if (!amount) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Get Relative Date
export const getRelativeDate = (date) => {
  if (!date) return "";

  const now = new Date();
  const d = new Date(date);
  const diff = now - d;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return "Vừa xong";
};

// Get Status Color
export const getStatusColor = (status) => {
  const colors = {
    pending: "yellow",
    confirmed: "green",
    completed: "blue",
    cancelled: "red",
    rejected: "red",
    awaiting_payment: "orange",
  };
  return colors[status] || "gray";
};

// Get Status Text
export const getStatusText = (status) => {
  const texts = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    rejected: "Bị từ chối",
    awaiting_payment: "Chờ thanh toán",
  };
  return texts[status] || status;
};

// Get Initials
export const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Validate Email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate Phone (10-11 digits, khớp với backend DTO)
export const validatePhone = (phone) => {
  const re = /^[0-9]{10,11}$/;
  return re.test(phone);
};

// Validate Password
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Format Time
export const formatTime = (time) => {
  if (!time) return "";
  return time;
};

export const getCategoryIcon = (name) => {
  if (!name) return "🏥";
  const normalized = name.toLowerCase();
  if (normalized.includes("tim")) return "❤️";
  if (normalized.includes("nội")) return "🩺";
  if (normalized.includes("nha") || normalized.includes("răng")) return "🦷";
  if (normalized.includes("da")) return "💆";
  if (
    normalized.includes("tai") ||
    normalized.includes("mũi") ||
    normalized.includes("họng")
  )
    return "👂";
  if (normalized.includes("mắt") || normalized.includes("nhãn")) return "👁️";
  if (normalized.includes("nhi")) return "👶";
  if (normalized.includes("thần kinh")) return "🧠";
  if (normalized.includes("xương") || normalized.includes("khớp")) return "🦴";
  if (normalized.includes("tiêu hóa") || normalized.includes("dạ dày"))
    return "胃";
  if (normalized.includes("phụ sản") || normalized.includes("thai"))
    return "🤰";
  if (normalized.includes("phổi") || normalized.includes("hô hấp")) return "🫁";
  return "🏥";
};

// Check if date is today
export const isToday = (date) => {
  const today = new Date();
  const d = new Date(date);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

// Check if date is tomorrow
export const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(date);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
};

// Remove diacritics for fuzzy search
export const removeDiacritics = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

// Smart search string normalization (removes diacritics, spaces, punctuation)
export const normalizeForSearch = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove Vietnamese accents
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]/g, ""); // Remove spaces, punctuation, and hashtags
};

