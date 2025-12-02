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
