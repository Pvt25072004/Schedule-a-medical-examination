# Phân tích Tính năng Hệ thống (Web Admin & Backend API)

Dựa trên việc rà soát kiến trúc dự án và quy trình hoạt động của hệ thống Đặt lịch khám, dưới đây là tổng hợp các tính năng **Thiếu**, **Thừa/Không cần thiết** và **Gợi ý tối ưu**.

## 1. Tính năng Thừa / Không cần thiết (Đã xử lý hoặc cần cân nhắc)
- **Form Tạo Bệnh viện (Web Admin):** Không còn cần thiết vì luồng tạo mới đã được chuyển qua tính năng "Đăng ký đối tác" của Guest (Hospital Registrations). *Tôi đã loại bỏ form này ở phiên trước và chỉ giữ lại Xem/Sửa/Xóa.*
- **Global RolesGuard (Backend):** Việc cấu hình `RolesGuard` ở mức toàn cục (APP_GUARD) trong `auth.module.ts` là **dư thừa và gây lỗi nghiêm trọng** (gây ra lỗi 403 vừa rồi). Hệ thống đã khai báo Guard ở từng Controller nên không cần khai báo toàn cục. *Đã được gỡ bỏ.*
- **Tạo mới tài khoản Bệnh nhân / Bác sĩ thủ công (Web Admin):** Form tạo mới người dùng trong `UserManagement` hiện tại cho phép chọn role `patient`, `doctor`. Trong thực tế, bệnh nhân và bác sĩ sẽ tự đăng ký qua luồng riêng (App/Web), Admin thường chỉ tạo thêm tài khoản `admin` hoặc cấp quyền đặc biệt. Dù hơi thừa nhưng vẫn có thể giữ lại để phục vụ hỗ trợ người dùng khi cần.

## 2. Tính năng Thiếu (Cần bổ sung)
- **Bảo mật API Quản lý Ứng tuyển Bác sĩ (Backend):** Trong `doctors.controller.ts`, API `GET /doctors/hospitals/:hospitalId/applications` (Lấy danh sách bác sĩ xin vào bệnh viện) đang **thiếu kiểm tra phân quyền**. Bất kỳ ai có Token đăng nhập cũng có thể gọi API này. Cần bổ sung `RolesGuard` để chỉ `admin` hoặc `admin_hospital` sở hữu `hospitalId` đó mới xem được.
- **Trang Quản lý Bác sĩ riêng cho Admin Bệnh viện (Web Admin):** Admin của bệnh viện cần có một trang riêng để duyệt/loại bỏ/quản lý Bác sĩ thuộc biên chế của mình. Hiện tại, tính năng này có thể chưa được hiển thị rõ ràng trên thanh Navbar cho `admin_hospital`.
- **Đổi mật khẩu cho Admin (Web Admin):** Tính năng cho phép Admin tự đổi mật khẩu (Change Password) ngay bên trong giao diện Profile vẫn chưa được tích hợp hoàn chỉnh.

## 3. Nhật ký kiểm tra (Logs)
- **Dọn dẹp mã Debug:** Đã thực hiện rà soát toàn bộ source code ở cả hai thư mục `Schedule-a-medical-examination` và `web-admin`. 
- Toàn bộ lệnh `console.log` hiển thị các thông tin gỡ lỗi 403 (như `--- DEBUG RolesGuard ---`) đã được **xóa sạch** khỏi hệ thống. Code đã sẵn sàng cho môi trường Production.
