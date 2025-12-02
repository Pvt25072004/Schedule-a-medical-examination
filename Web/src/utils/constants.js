// Pages
export const PAGES = {
  HOME: '/',
  WELCOME: '/welcome',
// ... (các hằng số khác không thay đổi)
};

// Appointment Status, User Roles (Không thay đổi)
export const APPOINTMENT_STATUS = { /* ... */ };
export const USER_ROLES = { /* ... */ };

// ==========================================================
// THAY ĐỔI: Chuyển sang Mảng Đối tượng có ID và Name
// ==========================================================

// Cities (Đã sửa)
export const AREAS = [
  { id: 1, name: 'Hà Nội' },
  { id: 2, name: 'TP. Hồ Chí Minh' },
  { id: 3, name: 'Đà Nẵng' },
  { id: 4, name: 'Hải Phòng' },
  { id: 5, name: 'Cần Thơ' },
  { id: 6, name: 'Biên Hòa' },
  { id: 7, name: 'Nha Trang' },
  { id: 8, name: 'Huế' },
  { id: 9, name: 'Buôn Ma Thuột' },
  { id: 10, name: 'Vũng Tàu' }
];

// Hospitals (Đã sửa - Thêm areaId để kích hoạt lọc)
// Note: areaId là giả lập để khớp với logic filteredHospitals của bạn
export const HOSPITALS = [
  { id: 101, name: 'Bệnh viện Đa khoa Quốc tế', areaId: 1, specialtyId: 1 }, // Hà Nội
  { id: 102, name: 'Phòng khám Đa khoa Medpro', areaId: 2, specialtyId: 2 }, // TP.HCM
  { id: 103, name: 'Nha khoa Paris', areaId: 2, specialtyId: 3 }, // TP.HCM
  { id: 104, name: 'Bệnh viện Đại học Y Dược', areaId: 1, specialtyId: 4 }, // Hà Nội
  { id: 105, name: 'Bệnh viện Vinmec', areaId: 3, specialtyId: 5 } // Đà Nẵng
];

// Specialties (Đã sửa - Thêm hospitalId để khớp với logic lọc chuyên khoa)
export const SPECIALTIES = [
  {
    id: 1,
    name: 'Tim mạch',
    icon: '❤️',
    description: 'Khám và điều trị các bệnh về tim mạch',
    hospitalId: 101 // Có sẵn ở BV Đa khoa Quốc tế
  },
  {
    id: 2,
    name: 'Nội khoa',
    icon: '🩺',
    description: 'Khám tổng quát và điều trị nội khoa',
    hospitalId: 102 // Có sẵn ở PK Medpro
  },
  {
    id: 3,
    name: 'Nha khoa',
    icon: '🦷',
    description: 'Chăm sóc và điều trị răng miệng',
    hospitalId: 103
  },
  {
    id: 4,
    name: 'Da liễu',
    icon: '💆',
    description: 'Điều trị các bệnh về da',
    hospitalId: 104
  },
  {
    id: 5,
    name: 'Tai Mũi Họng',
    icon: '👂',
    description: 'Khám và điều trị tai mũi họng',
    hospitalId: 105
  },
  {
    id: 6,
    name: 'Mắt',
    icon: '👁️',
    description: 'Khám và điều trị các bệnh về mắt',
    hospitalId: 101 // Có sẵn ở BV Đa khoa Quốc tế
  }
];

// Doctors (Đã sửa - Thêm specialtyId để khớp với logic lọc bác sĩ)
export const DOCTORS = [
  {
    id: 1,
    name: 'BS. Nguyễn Văn An',
    specialty: 'Tim mạch',
    specialtyId: 1, // Liên kết với Specialty ID 1
    avatar: '👨‍⚕️',
    rating: 4.8,
    reviews: 256,
    experience: 15,
    hospital: 'Bệnh viện Đa khoa Quốc tế',
    consultationFee: 500000 // Đổi tên trường để thống nhất
  },
  {
    id: 2,
    name: 'BS. Trần Thị Bình',
    specialty: 'Nội khoa',
    specialtyId: 2, // Liên kết với Specialty ID 2
    avatar: '👩‍⚕️',
    rating: 4.9,
    reviews: 189,
    experience: 12,
    hospital: 'Phòng khám Đa khoa Medpro',
    consultationFee: 350000
  },
  {
    id: 3,
    name: 'BS. Lê Hoàng Cường',
    specialty: 'Nha khoa',
    specialtyId: 3, // Liên kết với Specialty ID 3
    avatar: '👨‍⚕️',
    rating: 4.7,
    reviews: 143,
    experience: 10,
    hospital: 'Nha khoa Paris',
    consultationFee: 300000
  }
];

// Time Slots (Không thay đổi)
export const TIME_SLOTS = [
// ...
];

// Health Tips (Không thay đổi)
export const HEALTH_TIPS = [
// ...
];