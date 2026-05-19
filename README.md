# Hệ thống Đặt lịch Khám bệnh (BookingCare Project)

Dự án Xây dựng Hệ thống Đặt lịch Khám bệnh, cho phép bệnh nhân dễ dàng tìm kiếm bác sĩ, chuyên khoa và đặt lịch hẹn trực tuyến. Hệ thống cũng cung cấp trang quản trị cho phòng khám/bác sĩ để quản lý lịch hẹn, bệnh nhân và các nghiệp vụ liên quan.

Mục lục
Tính năng chính

Công nghệ sử dụng

Cấu trúc dự án

Hướng dẫn cài đặt

Tài liệu API

Đội ngũ phát triển

Giấy phép

Tính năng chính
Hệ thống bao gồm 3 sản phẩm chính: Web Client, Web Admin, và Mobile App, tất cả đều sử dụng chung một hệ thống API.

🧑‍💼 Dành cho Bệnh nhân (Client)
Xác thực: Đăng ký, Đăng nhập (local, Google, Facebook).

Tìm kiếm: Tìm kiếm thông tin bác sĩ, chuyên khoa, phòng khám.

Đặt lịch: Đặt lịch hẹn trực tuyến theo ngày giờ mong muốn.

Thanh toán: Tích hợp thanh toán qua VNPAY, Momo.

Quản lý tài khoản: Quản lý thông tin cá nhân, hồ sơ bệnh nhân.

Lịch sử: Xem lại lịch sử khám, các lịch hẹn sắp tới.

Đánh giá: Để lại đánh giá, bình luận cho bác sĩ/phòng khám.

🔒 Dành cho Quản trị viên (Admin)
Dashboard: Biểu đồ, thống kê tổng quan về doanh thu, lịch hẹn.

Quản lý Lịch hẹn: Xác nhận, từ chối, sắp xếp lịch hẹn của bệnh nhân.

Quản lý Bác sĩ: Thêm, xóa, sửa thông tin và lịch làm việc của bác sĩ.

Quản lý Bệnh nhân: Quản lý danh sách, thông tin chi tiết của bệnh nhân.

Quản lý Chuyên khoa: Thêm, xóa, sửa các chuyên khoa của phòng khám.

Quản lý Tin tức: Viết và đăng tải các bài viết, cẩm nang sức khỏe.

Công nghệ sử dụng
Dự án được xây dựng theo kiến trúc Monorepo, tách biệt rõ ràng Backend và Frontend.

Backend (API): 🚀 NestJS (Node.js, TypeScript)

Frontend (Web Client & Admin): ⚛️ ReactJS (TypeScript)

Mobile App: 📱 Flutter

Database: 🐬 MySQL

Quản lý Database: TypeORM

Xác thực: JWT (JSON Web Token), Passport.js

Thanh toán: VNPAY, Momo

DevOps (Dự kiến): Docker, AWS

Cấu trúc dự án
Dự án được tổ chức theo mô hình Monorepo với 4 thư mục chính, giúp dễ dàng quản lý và triển khai độc lập.

/booking-project
├── 📂 api/ (Backend - NestJS - Phụ trách: Tiến)
├── 📂 web-admin/ (Frontend Admin - ReactJS - Phụ trách: Tiến)
├── 📂 web-client/ (Frontend Client - ReactJS - Phụ trách: Lương)
└── 📂 app/ (Mobile App - Flutter - Phụ trách: Sang)
Hướng dẫn Cài đặt và Chạy dự án
Yêu cầu chung
Node.js (v18.x trở lên)

[liên kết đáng ngờ đã bị xóa] (v8.x)

Git

1. Tải dự án về máy
   Bash

git clone https://github.com/your-username/booking-project.git
cd booking-project 2. Cài đặt Backend (API)
Phần này sẽ khởi chạy máy chủ API tại http://localhost:3000.

Bash

# Di chuyển vào thư mục API

cd api

# Cài đặt các thư viện

npm install

# Tạo file .env để lưu cấu hình

# (Copy nội dung từ file .env.example và chỉnh sửa lại)

cp .env.example .env
Mở file .env và cập nhật thông tin kết nối Database MySQL của bạn:

Ini, TOML

# .env

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=booking_db
JWT_SECRET=your_super_secret_key
Lưu ý: Bạn cần tự tạo database booking_db trong MySQL trước.

Bash

# Chạy server ở chế độ development (tự động reload khi code thay đổi)

npm run start:dev 3. Cài đặt Frontend (Web Admin / Web Client)
Các bước tương tự cho cả web-admin và web-client. (Ví dụ cho web-admin)

Bash

# Mở một terminal mới, di chuyển vào thư mục web-admin

cd web-admin

# Cài đặt các thư viện

npm install

# Tạo file .env

cp .env.example .env
Cập nhật file .env để trỏ đến địa chỉ API:

Ini, TOML

# .env

REACT_APP_API_URL=http://localhost:3000
Bash

# Khởi chạy trang web

npm start
Web Admin sẽ chạy tại http://localhost:3001 (hoặc cổng khác do React chỉ định).

Tài liệu API
Dự án sử dụng Swagger để tự động tạo tài liệu API.

Sau khi khởi động server API, bạn có thể truy cập tài liệu và thử nghiệm các endpoint tại:

http://localhost:3000/api

Đội ngũ phát triển
Dự án được thực hiện bởi:

Phạm Văn Tiền (@tienphamvan) - Project Leader - Backend (NestJS) & Web Admin (ReactJS)

[Tên thành viên Lương] (@username-luong) - Frontend (Web Client)

[Tên thành viên Sang] (@username-sang) - Mobile App (Flutter)

Giấy phép
Dự án này được cấp phép theo Giấy phép MIT. Xem file LICENSE để biết thêm chi tiết.
