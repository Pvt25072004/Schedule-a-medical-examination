// Application constants
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin'
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PAGES = {
  WELCOME: 'welcome',
  LOGIN: 'login',
  REGISTER: 'register',
  HOME: 'home',
  BOOKING: 'booking',
  APPOINTMENTS: 'appointments',
  CHAT: 'chat',
  SETTINGS: 'settings'
};

export const CITIES = [
  { value: 'hcm', label: 'TP. Hồ Chí Minh' },
  { value: 'hn', label: 'Hà Nội' },
  { value: 'dn', label: 'Đà Nẵng' },
  { value: 'hp', label: 'Hải Phòng' },
  { value: 'ct', label: 'Cần Thơ' }
];

export const DOCTORS = [
  { id: 'dr1', name: 'BS. Nguyễn Văn A', specialty: 'Tim mạch', avatar: '👨‍⚕️' },
  { id: 'dr2', name: 'BS. Trần Thị B', specialty: 'Nhi khoa', avatar: '👩‍⚕️' },
  { id: 'dr3', name: 'BS. Lê Văn C', specialty: 'Da liễu', avatar: '👨‍⚕️' },
  { id: 'dr4', name: 'BS. Phạm Thị D', specialty: 'Nội tổng quát', avatar: '👩‍⚕️' },
  { id: 'dr5', name: 'BS. Hoàng Văn E', specialty: 'Tai mũi họng', avatar: '👨‍⚕️' }
];

export const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00', 
  '10:00 - 11:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00'
];

export const HEALTH_TIPS = [
  'Uống đủ 2 lít nước mỗi ngày giúp cơ thể luôn khỏe mạnh và tràn đầy năng lượng!',
  'Vận động ít nhất 30 phút mỗi ngày để duy trì sức khỏe tim mạch tốt.',
  'Ngủ đủ 7-8 tiếng mỗi đêm giúp cơ thể phục hồi và tái tạo năng lượng.',
  'Ăn nhiều rau xanh và trái cây tươi để bổ sung vitamin và khoáng chất.',
  'Khám sức khỏe định kỳ 6 tháng/lần để phát hiện sớm các vấn đề sức khỏe.'
];