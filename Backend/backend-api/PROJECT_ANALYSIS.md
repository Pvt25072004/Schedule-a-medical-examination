# Phân Tích Dự Án Backend API - Hệ Thống Đặt Lịch Khám Bệnh

## 📋 Tổng Quan Dự Án

Dự án là một hệ thống đặt lịch khám bệnh được xây dựng bằng **NestJS** (TypeScript), sử dụng **TypeORM** để quản lý database **MySQL**, tích hợp **Firebase Authentication** và **EmailJS** để gửi email.

## 🏗️ Kiến Trúc Dự Án

### Cấu Trúc Module

Dự án được tổ chức theo mô hình **Modular Architecture** của NestJS với các module chính:

1. **AuthModule** - Xác thực người dùng (Firebase)
2. **UsersModule** - Quản lý thông tin người dùng
3. **DoctorsModule** - Quản lý thông tin bác sĩ
4. **HospitalsModule** - Quản lý thông tin bệnh viện
5. **SchedulesModule** - Quản lý lịch làm việc của bác sĩ
6. **AppointmentsModule** - Quản lý lịch hẹn khám
7. **PaymentsModule** - Quản lý thanh toán
8. **ReviewsModule** - Quản lý đánh giá
9. **EmailModule** - Gửi email (EmailJS)
10. **FirebaseService** - Tích hợp Firebase Admin SDK

### Database Schema (Entities)

#### 1. **User Entity**

- Thông tin người dùng: tên, email, số điện thoại, ngày sinh, giới tính
- Xác thực: password_hash (Firebase)
- Hồ sơ: địa chỉ, CMND, avatar, ảnh CMND
- Quan hệ: OneToMany với Appointments

#### 2. **Doctor Entity**

- Thông tin bác sĩ: tên, chuyên khoa, email, số điện thoại
- Trạng thái: is_active
- Quan hệ:
  - OneToMany với Appointments
  - OneToMany với Schedules
  - ManyToMany với Hospitals

#### 3. **Hospital Entity**

- Thông tin bệnh viện: tên, địa chỉ, số điện thoại, email, chuyên khoa chính
- Quan hệ:
  - OneToMany với Appointments
  - ManyToMany với Doctors

#### 4. **Schedule Entity**

- Lịch làm việc của bác sĩ tại bệnh viện
- Thông tin: ngày làm việc, giờ bắt đầu/kết thúc, số bệnh nhân tối đa
- Quan hệ: ManyToOne với Doctor và Hospital

#### 5. **Appointment Entity**

- Lịch hẹn khám của bệnh nhân
- Thông tin: ngày giờ hẹn, loại khám (online/offline), triệu chứng
- Trạng thái: pending, confirmed, cancelled, completed, rejected
- Quan hệ:
  - ManyToOne với User, Doctor, Hospital
  - OneToOne với Payment

#### 6. **Payment Entity**

- Thông tin thanh toán
- Phí: base_fee, online_fee, VAT
- Phương thức: vnpay, momo, cash, atm, credit_card
- Trạng thái: pending, completed, failed, refunded
- Quan hệ: OneToOne với Appointment

#### 7. **Review Entity**

- Đánh giá sau khi khám
- Thông tin: rating (1-5), comment
- Quan hệ: ManyToOne với Appointment, User, Doctor

## 🔄 Luồng Hoạt Động Chính

### 1. Luồng Xác Thực (Authentication Flow)

```
User → POST /api/auth/register → Firebase Auth → Tạo User trong DB
User → POST /api/auth/login → Firebase Auth → Trả về JWT Token
User → POST /api/auth/request-reset → Tạo OTP → Gửi Email → Lưu OTP vào Cache
User → POST /api/auth/verify-reset → Xác thực OTP → Đổi mật khẩu Firebase
```

**Hiện trạng:**

- ✅ Có AuthService với requestReset và verifyReset
- ✅ Có FirebaseService tích hợp
- ✅ Có EmailService để gửi OTP
- ❌ Thiếu login/register endpoints
- ❌ Thiếu JWT Strategy và Guards
- ❌ Thiếu DTOs cho login/register

### 2. Luồng Đặt Lịch Khám (Appointment Booking Flow)

```
User → Xem danh sách Doctors/Hospitals
User → Xem Schedules của Doctor tại Hospital
User → Tạo Appointment (pending)
User → Tạo Payment (pending)
User → Thanh toán → Payment (completed) → Appointment (confirmed)
Doctor → Xác nhận/hủy Appointment
Sau khi khám → Appointment (completed) → User có thể Review
```

**Hiện trạng:**

- ✅ Có đầy đủ Entities và quan hệ
- ❌ AppointmentsService chỉ có stub methods
- ❌ Thiếu logic kiểm tra lịch trống
- ❌ Thiếu logic tự động cập nhật số slot còn lại
- ❌ Thiếu validation DTOs

### 3. Luồng Thanh Toán (Payment Flow)

```
Appointment tạo → Payment tạo (pending)
User chọn phương thức thanh toán
→ VNPay/Momo: Tích hợp gateway → Webhook callback
→ Cash: Chờ xác nhận từ admin
Payment (completed) → Appointment (confirmed)
```

**Hiện trạng:**

- ✅ Có Payment Entity với các phương thức thanh toán
- ❌ PaymentsService chỉ có stub methods
- ❌ Thiếu tích hợp VNPay/Momo
- ❌ Thiếu webhook handlers
- ❌ Thiếu logic refund

### 4. Luồng Quản Lý Lịch (Schedule Management Flow)

```
Admin/Doctor → Tạo Schedule cho Doctor tại Hospital
→ Xác định: ngày, giờ, số bệnh nhân tối đa
User → Xem available schedules
→ Khi đặt lịch → Giảm số slot còn lại
```

**Hiện trạng:**

- ✅ Có Schedule Entity
- ❌ SchedulesService chỉ có stub methods
- ❌ Thiếu logic kiểm tra conflict schedules
- ❌ Thiếu API lấy available slots

## ⚠️ Những Thứ Còn Thiếu Cần Bổ Sung

### 🔴 Mức Độ Ưu Tiên Cao

#### 1. **Authentication & Authorization**

**Thiếu:**

- [ ] JWT Strategy (Passport JWT)
- [ ] JWT Guards để bảo vệ routes
- [ ] Role-based guards (User, Doctor, Admin)
- [ ] Login/Register endpoints hoàn chỉnh
- [ ] Refresh token mechanism
- [ ] DTOs với validation cho login/register

**Cần bổ sung:**

```typescript
// src/auth/strategies/jwt.strategy.ts
// src/auth/guards/jwt-auth.guard.ts
// src/auth/guards/roles.guard.ts
// src/auth/dto/login.dto.ts
// src/auth/dto/register.dto.ts
```

#### 2. **TypeORM Repositories**

**Thiếu:**

- [ ] TypeOrmModule.forFeature() trong các modules
- [ ] Inject Repository vào Services
- [ ] Implement CRUD operations thực tế

**Cần bổ sung trong:**

- UsersModule
- AppointmentsModule
- SchedulesModule
- PaymentsModule
- ReviewsModule
- HospitalsModule

#### 3. **DTOs với Validation**

**Thiếu:**

- [ ] Tất cả DTOs đều rỗng
- [ ] Class-validator decorators
- [ ] Validation pipes

**Cần bổ sung:**

```typescript
// Ví dụ CreateAppointmentDto
export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsInt()
  doctor_id: number;

  @IsNotEmpty()
  @IsInt()
  hospital_id: number;

  @IsNotEmpty()
  @IsDateString()
  appointment_date: string;

  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
  appointment_time: string;

  @IsEnum(['online', 'offline'])
  examination_type: string;

  @IsOptional()
  @IsString()
  symptoms?: string;
}
```

#### 4. **Business Logic Implementation**

**Thiếu:**

- [ ] AppointmentsService: Logic đặt lịch, kiểm tra slot, cập nhật status
- [ ] SchedulesService: Logic tạo lịch, kiểm tra conflict, lấy available slots
- [ ] PaymentsService: Logic thanh toán, tích hợp gateway, webhook
- [ ] ReviewsService: Logic đánh giá, tính rating trung bình
- [ ] UsersService: CRUD operations
- [ ] HospitalsService: CRUD operations

#### 5. **Error Handling**

**Thiếu:**

- [ ] Global exception filter
- [ ] Custom exceptions
- [ ] Error response format chuẩn
- [ ] Validation error handling

**Cần bổ sung:**

```typescript
// src/common/filters/http-exception.filter.ts
// src/common/exceptions/
```

### 🟡 Mức Độ Ưu Tiên Trung Bình

#### 6. **Payment Gateway Integration**

**Thiếu:**

- [ ] VNPay integration
- [ ] Momo integration
- [ ] Webhook handlers
- [ ] Payment status update logic
- [ ] Refund logic

#### 7. **Notification System**

**Thiếu:**

- [ ] Email notifications cho:
  - Appointment confirmed
  - Appointment reminder
  - Payment success/failed
  - Appointment cancelled
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] SMS notifications (tùy chọn)

#### 8. **File Upload**

**Thiếu:**

- [ ] Upload avatar cho User/Doctor
- [ ] Upload CMND images
- [ ] Storage service (Firebase Storage hoặc AWS S3)
- [ ] File validation và size limits

#### 9. **Search & Filter**

**Thiếu:**

- [ ] Search doctors by specialty, name
- [ ] Search hospitals by location, specialty
- [ ] Filter appointments by status, date
- [ ] Pagination cho tất cả list endpoints

#### 10. **Caching Strategy**

**Thiếu:**

- [ ] Cache danh sách doctors (ít thay đổi)
- [ ] Cache danh sách hospitals
- [ ] Cache schedules (cần invalidate khi có thay đổi)
- [ ] Redis integration (thay vì in-memory cache)

### 🟢 Mức Độ Ưu Tiên Thấp (Nice to Have)

#### 11. **Testing**

**Thiếu:**

- [ ] Unit tests cho Services
- [ ] Integration tests cho Controllers
- [ ] E2E tests cho các luồng chính
- [ ] Test coverage reports

#### 12. **Documentation**

**Thiếu:**

- [ ] Swagger/OpenAPI documentation
- [ ] API documentation chi tiết
- [ ] Postman collection
- [ ] README với hướng dẫn setup

#### 13. **Logging & Monitoring**

**Thiếu:**

- [ ] Structured logging (Winston, Pino)
- [ ] Request logging middleware
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

#### 14. **Security Enhancements**

**Thiếu:**

- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Helmet.js for security headers
- [ ] Input sanitization
- [ ] SQL injection prevention (TypeORM đã có nhưng cần verify)

#### 15. **Database Migrations**

**Thiếu:**

- [ ] Migration files thay vì synchronize: true
- [ ] Seed data cho development
- [ ] Migration rollback strategy

#### 16. **Background Jobs**

**Thiếu:**

- [ ] Cron jobs cho:
  - Gửi reminder trước 24h
  - Tự động hủy appointment quá hạn chưa thanh toán
  - Cleanup old data
- [ ] Queue system (Bull/BullMQ) cho email sending

#### 17. **Admin Features**

**Thiếu:**

- [ ] Admin endpoints riêng
- [ ] Dashboard statistics
- [ ] User management
- [ ] Appointment management
- [ ] Payment management

#### 18. **Advanced Features**

**Thiếu:**

- [ ] Appointment rescheduling
- [ ] Waitlist system
- [ ] Doctor availability calendar
- [ ] Multi-language support
- [ ] Analytics và reporting

## 📝 Checklist Triển Khai

### Phase 1: Core Functionality (Ưu tiên cao nhất)

- [ ] Setup JWT authentication hoàn chỉnh
- [ ] Implement TypeORM repositories cho tất cả modules
- [ ] Tạo DTOs với validation đầy đủ
- [ ] Implement CRUD operations cho Users, Doctors, Hospitals
- [ ] Implement Appointment booking logic
- [ ] Implement Schedule management logic
- [ ] Global exception filter và error handling
- [ ] Basic payment creation logic

### Phase 2: Payment & Notifications

- [ ] Tích hợp VNPay
- [ ] Tích hợp Momo
- [ ] Webhook handlers
- [ ] Email notifications
- [ ] Payment status management

### Phase 3: Enhancements

- [ ] File upload system
- [ ] Search & filter
- [ ] Pagination
- [ ] Caching với Redis
- [ ] Background jobs

### Phase 4: Production Ready

- [ ] Testing suite
- [ ] API documentation (Swagger)
- [ ] Logging & monitoring
- [ ] Security enhancements
- [ ] Database migrations
- [ ] Deployment configuration

## 🔧 Cấu Hình Cần Thiết

### Environment Variables (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=medical_booking_db

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Firebase
GOOGLE_CREDENTIALS={"type":"service_account",...}
DATABASE_URL=https://your-project.firebaseio.com

# EmailJS
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key

# Payment Gateways
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key

# Server
PORT=3000
NODE_ENV=development

# Redis (nếu dùng)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 📚 Tài Liệu Tham Khảo

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Passport JWT Strategy](https://github.com/mikenicholson/passport-jwt)
- [Class Validator](https://github.com/typestack/class-validator)
- [VNPay Integration Guide](https://sandbox.vnpayment.vn/apis/)

## 🎯 Kết Luận

Dự án đã có cấu trúc tốt với các entities và quan hệ database được thiết kế hợp lý. Tuy nhiên, phần lớn business logic và integration còn thiếu. Ưu tiên nên tập trung vào:

1. **Authentication & Authorization** - Nền tảng bảo mật
2. **Core Business Logic** - Chức năng chính của ứng dụng
3. **Payment Integration** - Tính năng thanh toán
4. **Error Handling & Validation** - Đảm bảo chất lượng code

Sau khi hoàn thành Phase 1 và Phase 2, dự án sẽ có đủ chức năng cơ bản để có thể triển khai và sử dụng thực tế.
