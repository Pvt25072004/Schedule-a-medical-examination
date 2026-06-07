# Hệ thống Đặt lịch Khám bệnh (Medical Examination Scheduling System)

Dự án Xây dựng Hệ thống Đặt lịch Khám bệnh đa cơ sở, cho phép bệnh nhân dễ dàng tìm kiếm bác sĩ, chuyên khoa, bệnh viện và đặt lịch hẹn trực tuyến. Hệ thống cung cấp các portal quản trị riêng biệt cho Bệnh nhân, Bác sĩ, Quản trị viên Bệnh viện (Hospital Admin) và Quản trị viên Hệ thống (System Admin).

## 📌 Tính năng chính

Hệ thống được chia làm 3 phân hệ chính: Backend API, Web Client (Bệnh nhân & Bác sĩ) và Web Admin (Admin Bệnh viện & Admin Hệ thống).

### 🧑‍⚕️ Phân hệ Bệnh nhân & Bác sĩ (Web Client)
- **Bệnh nhân:** 
  - Tìm kiếm bác sĩ, bệnh viện, chuyên khoa.
  - Đặt lịch hẹn khám trực tuyến.
  - Theo dõi lịch sử khám bệnh, hồ sơ bệnh án.
  - Yêu cầu hoàn tiền, quản lý lịch hẹn.
  - Đánh giá bác sĩ, bệnh viện.
- **Bác sĩ:**
  - Đăng ký hồ sơ bác sĩ trực tuyến.
  - Quản lý lịch làm việc cá nhân (Schedules).
  - Cập nhật hồ sơ, thông tin liên hệ và phí khám.
  - Xem danh sách cuộc hẹn, tạo hồ sơ bệnh án cho bệnh nhân.

### 🏢 Phân hệ Quản trị (Web Admin)
- **Admin Bệnh viện (Hospital Admin):**
  - Quản lý thông tin chung của Bệnh viện (Phí cơ sở, thông tin liên hệ).
  - Quản lý danh sách bác sĩ thuộc bệnh viện (thêm, sửa, khóa tài khoản).
  - Xem và quản lý tất cả lịch hẹn khám trong bệnh viện.
  - Thống kê doanh thu theo bệnh viện.
- **Admin Hệ thống (System Admin):**
  - Xét duyệt yêu cầu đăng ký mở bệnh viện, bác sĩ mới.
  - Quản lý danh mục chuyên khoa, người dùng toàn hệ thống.
  - Quản trị nội dung (Bài viết/Cẩm nang sức khỏe).
  - Thống kê doanh thu tổng.

## 🛠 Công nghệ sử dụng

- **Backend (API):** 🚀 NestJS (Node.js, TypeScript)
- **Frontend (Web & Web Admin):** ⚛️ ReactJS, Vite, TailwindCSS
- **Database:** 🐬 MySQL (quản lý bằng TypeORM)
- **Xác thực:** JWT (JSON Web Token), Passport.js, Bcrypt
- **Lưu trữ ảnh/file:** Cloudinary
- **AI/Chatbot:** GROQ API (Tích hợp trợ lý ảo - đang phát triển)

## 📁 Cấu trúc dự án

Dự án được tổ chức theo mô hình Monorepo với 3 thư mục chính:

```
/Schedule-a-medical-examination
├── 📂 Backend/backend-api/   # (Backend API - NestJS)
├── 📂 Web/                   # (Frontend Client & Doctor - ReactJS/Vite)
└── 📂 web-admin/             # (Frontend Admin - ReactJS/Vite)
```

## ⚙️ Hướng dẫn cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (v18.x trở lên)
- MySQL
- NPM hoặc Yarn

### 1. Cài đặt Backend (API)
```bash
cd Backend/backend-api
npm install
```
- Copy file `.env.example` thành `.env` và cấu hình kết nối MySQL, JWT, Cloudinary.
- Tự tạo database trong MySQL theo cấu hình trong `.env`.
```bash
npm run start:dev
```
API sẽ chạy tại: `http://localhost:3000`

### 2. Cài đặt Web Client (Bệnh nhân & Bác sĩ)
```bash
cd Web
npm install
```
- Copy file `.env.example` thành `.env` và trỏ `VITE_API_URL` tới `http://localhost:3000/api`.
```bash
npm run dev
```
Trang Client sẽ chạy tại `http://localhost:5173`.

### 3. Cài đặt Web Admin (Quản trị viên)
```bash
cd ../web-admin
npm install
```
- Copy file `.env.example` thành `.env` và thiết lập `VITE_API_URL`.
```bash
npm run dev
```
Trang Admin sẽ chạy tại `http://localhost:5174`.

## 🧑‍💻 Đội ngũ phát triển
Dự án được phát triển và quản lý bởi Hậu Nguyễn (reactjs_haunguyen).

## 📄 Giấy phép
Dự án được cấp phép theo giấy phép MIT. Xem file LICENSE để biết thêm chi tiết.
