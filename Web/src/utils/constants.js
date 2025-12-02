// Pages
export const PAGES = {
  HOME: "/",
  WELCOME: "/welcome",
  LOGIN: "/login",
  REGISTER: "/register",
  BOOKING: "/booking",
  APPOINTMENTS: "/appointments",
  CHAT: "/chat",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  YOUR_PAGE: "/your-page",
  ADMIN_DASHBOARD: "/admin",
  DOCTOR_DASHBOARD: "/doctor",
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
};

// User Roles
export const USER_ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
};

// Cities (value + label để dễ dùng cho select)
export const CITIES = [
  { value: "ha-noi", label: "Hà Nội" },
  { value: "ho-chi-minh", label: "TP. Hồ Chí Minh" },
  { value: "da-nang", label: "Đà Nẵng" },
  { value: "hai-phong", label: "Hải Phòng" },
  { value: "can-tho", label: "Cần Thơ" },
  { value: "bien-hoa", label: "Biên Hòa" },
  { value: "nha-trang", label: "Nha Trang" },
  { value: "hue", label: "Huế" },
  { value: "buon-ma-thuot", label: "Buôn Ma Thuột" },
  { value: "vung-tau", label: "Vũng Tàu" },
];

// Specialties
export const SPECIALTIES = [
  {
    id: 1,
    name: "Tim mạch",
    icon: "❤️",
    description: "Khám và điều trị các bệnh về tim mạch",
  },
  {
    id: 2,
    name: "Nội khoa",
    icon: "🩺",
    description: "Khám tổng quát và điều trị nội khoa",
  },
  {
    id: 3,
    name: "Nha khoa",
    icon: "🦷",
    description: "Chăm sóc và điều trị răng miệng",
  },
  {
    id: 4,
    name: "Da liễu",
    icon: "💆",
    description: "Điều trị các bệnh về da",
  },
  {
    id: 5,
    name: "Tai Mũi Họng",
    icon: "👂",
    description: "Khám và điều trị tai mũi họng",
  },
  {
    id: 6,
    name: "Mắt",
    icon: "👁️",
    description: "Khám và điều trị các bệnh về mắt",
  },
];

// Doctors
export const DOCTORS = [
  {
    id: 1,
    name: "BS. Nguyễn Văn An",
    specialty: "Tim mạch",
    avatar: "👨‍⚕️",
    rating: 4.8,
    reviews: 256,
    experience: 15,
    hospital: "Bệnh viện Đa khoa Quốc tế",
    price: 500000,
  },
  {
    id: 2,
    name: "BS. Trần Thị Bình",
    specialty: "Nội khoa",
    avatar: "👩‍⚕️",
    rating: 4.9,
    reviews: 189,
    experience: 12,
    hospital: "Phòng khám Đa khoa Medpro",
    price: 350000,
  },
  {
    id: 3,
    name: "BS. Lê Hoàng Cường",
    specialty: "Nha khoa",
    avatar: "👨‍⚕️",
    rating: 4.7,
    reviews: 143,
    experience: 10,
    hospital: "Nha khoa Paris",
    price: 300000,
  },
];

// Time Slots
export const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

// Health Tips
export const HEALTH_TIPS = [
  {
    id: 1,
    title: "Uống đủ nước mỗi ngày",
    description: "Nên uống ít nhất 2 lít nước mỗi ngày để cơ thể khỏe mạnh",
    icon: "💧",
    date: "2025-11-15",
  },
  {
    id: 2,
    title: "Tập thể dục đều đặn",
    description: "Dành ít nhất 30 phút mỗi ngày cho hoạt động thể chất",
    icon: "🏃",
    date: "2025-11-14",
  },
  {
    id: 3,
    title: "Ngủ đủ giấc",
    description: "Ngủ 7-8 tiếng mỗi đêm giúp cơ thể phục hồi tốt",
    icon: "😴",
    date: "2025-11-13",
  },
];
