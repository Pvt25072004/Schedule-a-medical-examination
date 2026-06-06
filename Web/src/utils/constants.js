// Pages
export const PAGES = {
  HOME: "/",
  WELCOME: "/welcome",
  LOGIN: "/login",
  REGISTER: "/register",
  BOOKING: "/booking",
  BOOK_DOCTOR: "/book-doctor",
  BOOK_PACKAGE: "/book-package/:id",
  APPOINTMENTS: "/appointments",
  CHAT: "/chat",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  YOUR_PAGE: "/your-page",

  DOCTOR_DASHBOARD: "/doctor",
  DOCTORS: "/doctors",
  FANPAGE: "/fanpage",
  FANPAGE_DETAIL: "/fanpage/:id",
  NEWS: "/news",
  APPLY_DOCTOR: "/apply-doctor",
  HOSPITAL_REGISTRATION: "/hospital-registration",
  SERVICE_PACKAGES: "/service-packages",
  MEDICAL_RECORDS: "/medical-records",
  ABOUT: "/about",
  FAQ: "/faq",
  BOOKING_GUIDE: "/booking-guide",
  PRIVACY_POLICY: "/privacy-policy",
  TERMS: "/terms",
  SPECIALTIES: "/specialties",
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
  AWAITING_PAYMENT: "awaiting_payment",
};

// API Endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// User Roles
export const USER_ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
};

// Regions (Miền)
export const REGIONS = [
  { value: "mien-bac", label: "Miền Bắc" },
  { value: "mien-trung", label: "Miền Trung" },
  { value: "mien-nam", label: "Miền Nam" },
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
