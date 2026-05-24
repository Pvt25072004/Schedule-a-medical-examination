# 🏗️ KIẾN TRÚC HỆ THỐNG & DIAGRAMS

## Mục Lục
1. [Entity Relationship Diagram (ERD)](#1-entity-relationship-diagram-erd)
2. [Use Case Diagram](#2-use-case-diagram)
3. [Sequence Diagrams](#3-sequence-diagrams)
4. [Component Diagram](#4-component-diagram)
5. [Deployment Diagram](#5-deployment-diagram)
6. [State Machine Diagram](#6-state-machine-diagram)
7. [Data Flow Diagram (DFD)](#7-data-flow-diagram-dfd)

---

## 1. Entity Relationship Diagram (ERD)

### 1.1 Database Schema Overview

```
┌──────────────────┐
│     USERS        │
├──────────────────┤
│ PK: id           │
│ email (UNIQUE)   │
│ phone            │
│ password_hash    │
│ firebase_uid     │
│ full_name        │
│ avatar_url       │
│ role             │◄──┐
│ status           │   │ 1:N
│ created_at       │   │
│ updated_at       │   │
└──────────────────┘   │
        ▲              │
        │ 1:N          │
        │              │
    ┌───┴──────────────┴─────────┬──────────────┐
    │                            │              │
┌───┴────────┐          ┌────────┴──────┐    ┌─┴─────────┐
│   DOCTORS  │          │   PATIENTS     │    │  ADMINS   │
├────────────┤          ├────────────────┤    ├───────────┤
│ PK: id     │          │ PK: id         │    │ PK: id    │
│ FK: user_id├──────┐   │ FK: user_id├─┐│    │ FK: user_id
│ specialty  │      │   │ medical_history││    │           │
│ license    │      │   │ allergies   ││    │           │
│ experience │      │   │ insurance_id││    │           │
│ clinic_id  │      │   │             ││    │           │
│ hourly_rate│      │   │             ││    │           │
│ rating     │      │   │             ││    │           │
│ bio        │      │   └─────────────┘│    │           │
└────────────┘      │                  │    └───────────┘
     │ 1:N          │                  │
     │              │                  │
     │         ┌────┴────────────────┐ │
     │         │                     │ │
   ┌─┴─────────▼─────┐  ┌───────────┴─┴──┐
   │  APPOINTMENTS   │  │   INSURANCES   │
   ├─────────────────┤  ├────────────────┤
   │ PK: id          │  │ PK: id         │
   │ FK: patient_id  │  │ name           │
   │ FK: doctor_id   │  │ provider       │
   │ date            │  │ coverage_rate  │
   │ time            │  │ max_claim      │
   │ status          │  │ valid_from     │
   │ symptom_desc    │  │ valid_to       │
   │ payment_status  │  │ created_at     │
   │ created_at      │  └────────────────┘
   └─────────────────┘
         │ 1:N
         │
    ┌────┴──────────────┐
    │                   │
┌───┴────────────┐  ┌──┴──────────┐
│    PAYMENTS    │  │  PRESCRIPTIONS
├────────────────┤  ├──────────────┤
│ PK: id         │  │ PK: id       │
│ FK: appt_id    │  │ FK: appt_id  │
│ amount         │  │ doctor_notes │
│ gateway        │  │ medicines    │
│ tx_id          │  │ dosage       │
│ status         │  │ created_at   │
│ created_at     │  └──────────────┘
└────────────────┘

    ┌─────────────────────────────────────┐
    │      SPECIALTIES                    │
    ├─────────────────────────────────────┤
    │ PK: id                              │
    │ name                                │
    │ description                         │
    │ icon_url                            │
    │ created_at                          │
    └─────────────────────────────────────┘
            ▲
            │ N:N (through DOCTORS)
            │
    ┌─────────────────────────────────────┐
    │      CLINICS                        │
    ├─────────────────────────────────────┤
    │ PK: id                              │
    │ name                                │
    │ address                             │
    │ phone                               │
    │ email                               │
    │ working_hours_start                 │
    │ working_hours_end                   │
    │ created_at                          │
    └─────────────────────────────────────┘
```

### 1.2 Table Definitions

**USERS Table:**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  firebase_uid VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role ENUM('patient', 'doctor', 'admin') NOT NULL,
  status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**DOCTORS Table:**
```sql
CREATE TABLE doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  specialty_id INT NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  experience_years INT,
  clinic_id INT,
  hourly_rate DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0,
  bio TEXT,
  certificate_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (specialty_id) REFERENCES specialties(id),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  INDEX (license_number),
  INDEX (specialty_id)
);
```

**APPOINTMENTS Table:**
```sql
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
  symptom_description TEXT,
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  INDEX (patient_id),
  INDEX (doctor_id),
  INDEX (appointment_date),
  UNIQUE KEY unique_appointment (doctor_id, appointment_date, appointment_time)
);
```

**PAYMENTS Table:**
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  gateway ENUM('vnpay', 'momo') NOT NULL,
  transaction_id VARCHAR(100) UNIQUE,
  status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
  response_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  INDEX (transaction_id),
  INDEX (status)
);
```

**MESSAGES Table:**
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  conversation_id VARCHAR(100),
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  INDEX (conversation_id),
  INDEX (created_at)
);
```

---

## 2. Use Case Diagram

### 2.1 Actors
- **Patient:** Bệnh nhân sử dụng hệ thống
- **Doctor:** Bác sĩ nhận lịch hẹn
- **Admin:** Quản trị viên hệ thống
- **Payment Gateway:** VNPAY/Momo
- **Chatbot AI:** Tư vấn tự động

### 2.2 Use Cases

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────────┐        ┌──────────────┐  ┌────────────┐ │
│  │   Patient    │        │    Doctor    │  │   Admin    │ │
│  └──────────────┘        └──────────────┘  └────────────┘ │
│         │                      │                   │       │
│         │                      │                   │       │
│    ┌────┴──────────────────────┼──────────────────┼───────┐
│    │                           │                  │       │
│    │  Register & Login         │                  │       │
│    │  • Local Signup           │                  │       │
│    │  • Google OAuth           │                  │       │
│    │  • Facebook OAuth         │  Update Profile  │       │
│    │  • 2FA Setup              │  • Schedule      │       │
│    │  • Forgot Password        │  • Status        │       │
│    │                           │  • Availability  │       │
│    │  Search Doctors           │                  │       │
│    │  • By Specialty           │                  │       │
│    │  • By Location            │                  │       │
│    │  • By Price               │                  │       │
│    │  • Filter Results         │                  │       │
│    │  • Sort by Rating         │                  │       │
│    │                           │                  │       │
│    │  View Doctor Details      │                  │       │
│    │  • Experience             │                  │       │
│    │  • Reviews                │                  │       │
│    │  • Available Time Slots   │                  │       │
│    │  • Clinic Info            │                  │       │
│    │                           │                  │       │
│    │  Book Appointment         │                  │       │
│    │  • Select Date/Time       │                  │       │
│    │  • Enter Symptoms         │                  │       │
│    │  • Choose Payment Method  │                  │       │
│    │  • Confirm Booking        │                  │       │
│    │                           │                  │       │
│    │  Make Payment             │  Accept/Reject   │ Dashboard
│    │  • VNPAY                  │  Appointments    │ • View Stats
│    │  • Momo                   │  • Check Details │ • Revenue Report
│    │  • View Receipt           │  • Confirm       │ • User Analytics
│    │                           │  • Reject        │
│    │  Chat with Doctor         │  • Reschedule    │ Manage Doctors
│    │  • Send Messages          │                  │ • Add/Edit/Delete
│    │  • Share Files            │  Chat with       │ • Verify Licenses
│    │  • Real-time Updates      │  Patients        │ • Assign Clinic
│    │                           │  • Respond       │
│    │  Chat with Chatbot        │  • Send Notes    │ Manage Patients
│    │  • Ask Symptoms           │  • Share Files   │ • View Profile
│    │  • Get Recommendations    │                  │ • View History
│    │  • FAQ                    │  View My         │
│    │                           │  Appointments    │ Manage Payments
│    │  View Appointment History │  • Upcoming      │ • View Transactions
│    │  • Upcoming               │  • History       │ • Process Refund
│    │  • Completed              │  • Cancel        │
│    │  • Cancelled              │                  │ Manage Content
│    │  • Reschedule             │  View Ratings    │ • Create Articles
│    │                           │  • Comments      │ • Publish News
│    │  Rate & Review            │                  │ • Manage FAQ
│    │  • Star Rating            │                  │
│    │  • Write Comment          │                  │ System Admin
│    │  • Upload Photos          │                  │ • User Roles
│    │                           │                  │ • Permissions
│    │  Manage Profile           │                  │ • System Logs
│    │  • Update Info            │                  │
│    │  • Medical History        │                  │
│    │  • Allergies              │                  │
│    │  • Insurance              │                  │
│    │                           │                  │
└────┴──────────────────────────┴──────────────────┴───────┘
```

### 2.3 Main Use Case Descriptions

**UC1: Book Appointment**
- **Actors:** Patient, Payment Gateway
- **Precondition:** Patient is logged in, Doctor available
- **Main Flow:**
  1. Patient searches for doctor
  2. Selects doctor and views available slots
  3. Chooses date, time, and enters symptoms
  4. Reviews appointment details
  5. Selects payment method
  6. Completes payment via VNPAY/Momo
  7. Appointment confirmed
- **Alternative Flows:**
  - Payment fails → retry or cancel
  - Doctor cancels → patient notified & refunded
- **Postcondition:** Appointment created, payment processed

**UC2: Real-time Messaging**
- **Actors:** Patient, Doctor
- **Precondition:** Appointment exists
- **Main Flow:**
  1. Patient/Doctor initiates chat
  2. Sends message/file
  3. Real-time notification sent
  4. Receiver reads message
  5. Sender sees "read" status
- **Postcondition:** Message stored & delivered

**UC3: Chat with Chatbot**
- **Actors:** Patient, Chatbot AI
- **Precondition:** Patient logged in
- **Main Flow:**
  1. Patient describes symptoms
  2. Chatbot analyzes input
  3. Provides initial recommendation
  4. Suggests relevant specialty
  5. Offers to book with specialist
- **Postcondition:** Symptom info stored, booking created if patient agrees

---

## 3. Sequence Diagrams

### 3.1 Book Appointment Sequence

```
Patient         Browser          API            Database      Payment
  │                │               │               │          Gateway
  │                │               │               │            │
  │─ Search ──────→│               │               │            │
  │                │─ GET /doctors─→               │            │
  │                │               │─ Query ──────→│            │
  │                │               │←─ Doctors ────│            │
  │                │←─ Results ────│               │            │
  │                │               │               │            │
  │─ Select Doctor─→               │               │            │
  │                │               │               │            │
  │─ View Slots ───→               │               │            │
  │                │─ GET /slots ──→               │            │
  │                │               │─ Check ──────→│            │
  │                │               │←─ Slots ──────│            │
  │                │←─ Show ───────│               │            │
  │                │               │               │            │
  │─ Book ─────────→               │               │            │
  │                │─ POST /appointments          │            │
  │                │               │─ Create ─────→│            │
  │                │               │               │ Status: pending
  │                │               │←─ ID ────────│            │
  │                │←─ Confirm ────│               │            │
  │                │               │               │            │
  │─ Pay ──────────→               │               │            │
  │                │─ POST /payment─→               │            │
  │                │               │               │            ├─ Init
  │                │               │─ Create ─────→│            │ Payment
  │                │               │               │ Status:    │
  │                │               │               │ processing │
  │                │───────────────────────────────────┤ Create │
  │                │                               │            │ Transaction
  │                │←──────────────────── Redirect URL ────────│
  │                │←─ Redirect ────│               │            │
  │                │               │               │            │
  │─ Enter Card ───→               │               │            │
  │  (Secured)     │               │               │            │
  │                │               │               │            ├─ Validate
  │                │               │               │            │ Card
  │                │               │               │            │
  │                │               │               │    Success│
  │                │               │← Callback ────│←──────────│
  │                │               │               │            │
  │                │               │─ Update ─────→│            │
  │                │               │ Status: paid  │            │
  │                │               │               │            │
  │                │       Update  │               │            │
  │                │←─ Appointment─│               │            │
  │                │     Confirmed │               │            │
  │                │               │               │            │
  │─ Confirmation ← ┤               │               │            │
  │   Email/SMS    │               │               │            │
  │                │               │               │            │
```

### 3.2 Real-time Messaging Sequence

```
Patient         WebSocket          API            Database      Doctor
  │                │               │               │              │
  │─ Connect ─────→│               │               │              │
  │                │─ Authenticate─→               │              │
  │                │               │─ Verify ─────→│              │
  │                │               │←─ OK ────────│              │
  │                │←─ Connected ──│               │              │
  │                │               │               │              │
  │─ Send Msg ────→│               │               │              │
  │ "Hello Doc"    │               │               │              │
  │                │─ Emit Event ──→               │              │
  │                │               │─ Save ───────→│              │
  │                │               │               │ Status: sent │
  │                │               │               │              │
  │                │        Real-time WebSocket Connection
  │                │               │               │              │
  │                │── Broadcast ──────────────────────────────→  │
  │                │  "New Message"│               │              │
  │                │               │               │              │
  │                │←─ Receive ────────────────────────────────────│
  │                │               │               │              │
  │  ding! 📱      │               │               │              │
  │  (Notification)│               │               │              │
  │                │               │               │              │
  │                │               │               │              ├─ Read
  │                │                               │              │ Message
  │                │                               │              │
  │ ←─ Doctor Typing Indicator ──────────────────────────────────│
  │                │               │               │              │
  │                │                   Update      │              │
  │                │                   is_read ────→              │
  │                │               │               │              │
  │ ←─ Read Receipt ──────────────────────────────│              │
  │  (timestamp)   │               │               │              │
  │                │               │               │              │
  │─ Send Reply ───→               │               │              │
  │                │               │               │              │
  │                │── Broadcast ──────────────────────────────→  │
  │                │               │               │              │
```

### 3.3 Chatbot Consultation Sequence

```
Patient         Web UI          API            Chatbot AI      Database
  │                │               │               │              │
  │─ Start Chat ───→│               │               │              │
  │                │─ Initialize ──→               │              │
  │                │               │─ New Session─→│              │
  │                │               │               │─ Create ─────→
  │                │               │←─ Session ID ─│              │
  │                │←─ Welcome ────│               │              │
  │                │               │               │              │
  │─ Describe ─────→               │               │              │
  │ Symptoms       │               │               │              │
  │                │─ POST /chat ──→               │              │
  │                │               │─ Analyze ────→              │
  │                │               │               │              │
  │                │               │               ├─ NLP Analysis
  │                │               │               │ • Extract symptoms
  │                │               │               │ • Identify specialty
  │                │               │               │
  │                │               │←─ Response ───│
  │                │               │               │
  │                │←─ Display ────│               │              │
  │                │ - Initial Advice             │              │
  │                │ - Specialty Match            │              │
  │                │ - Top Doctors                │              │
  │                │               │               │              │
  │─ Ask Follow-up─→               │               │              │
  │ Question       │               │               │              │
  │                │─ POST /chat ──→               │              │
  │                │               │─ Context ────→              │
  │                │               │ Analysis     │              │
  │                │               │               │              │
  │                │               │←─ Answer ─────│              │
  │                │               │               │              │
  │                │←─ Display ────│               │              │
  │                │               │               │              │
  │─ Book Doctor ──→               │               │              │
  │                │               │               │              │
  │                │─ POST /appointments          │              │
  │                │               │─ Create ─────────────────→  │
  │                │               │               │   Appointment
  │                │               │               │              │
  │                │               │←─ ID ────────────────────────│
  │                │←─ Confirmed ──│               │              │
  │                │               │               │              │
```

---

## 4. Component Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                                    │
├──────────────────────┬────────────────────┬──────────────────────┤
│   Web Client         │    Web Admin       │   Mobile App         │
│   (React + Redux)    │    (React + Redux) │   (Flutter)          │
├──────────────────────┼────────────────────┼──────────────────────┤
│ • Pages/Components   │ • Dashboard        │ • Screens            │
│ • State Management   │ • Management Pages │ • Widgets            │
│ • HTTP Client        │ • Statistics       │ • State Provider     │
│ • Authentication    │ • User Management  │ • HTTP Client        │
│ • Real-time Chat    │ • Charts/Exports   │ • Notifications      │
└──────────────────────┴────────────────────┴──────────────────────┘
                              ▼
         ┌────────────────────────────────────────┐
         │      API GATEWAY (Load Balancer)       │
         │    - Route requests                    │
         │    - Rate limiting                     │
         │    - CORS handling                     │
         └────────────────────────────────────────┘
                              ▼
    ┌─────────────────────────────────────────────────────┐
    │          API LAYER (NestJS v11)                     │
    ├──────────────────────────────────────────────────────┤
    │                                                      │
    │  ┌──────────────────────────────────────────────┐   │
    │  │        Controllers                          │   │
    │  ├──────────────────────────────────────────────┤   │
    │  │ • AuthController                            │   │
    │  │ • DoctorController                          │   │
    │  │ • AppointmentController                     │   │
    │  │ • PaymentController                         │   │
    │  │ • MessageController                         │   │
    │  │ • ChatbotController                         │   │
    │  │ • AdminController                           │   │
    │  └──────────────────────────────────────────────┘   │
    │                      ▼                              │
    │  ┌──────────────────────────────────────────────┐   │
    │  │        Services (Business Logic)             │   │
    │  ├──────────────────────────────────────────────┤   │
    │  │ • AuthService                               │   │
    │  │ • DoctorService                             │   │
    │  │ • AppointmentService                        │   │
    │  │ • PaymentService                            │   │
    │  │ • MessageService                            │   │
    │  │ • ChatbotService                            │   │
    │  │ • EmailService                              │   │
    │  │ • SMSService                                │   │
    │  └──────────────────────────────────────────────┘   │
    │                      ▼                              │
    │  ┌──────────────────────────────────────────────┐   │
    │  │        Middlewares                          │   │
    │  ├──────────────────────────────────────────────┤   │
    │  │ • Authentication (JWT)                      │   │
    │  │ • Authorization (Roles)                     │   │
    │  │ • Logging                                   │   │
    │  │ • Error Handling                            │   │
    │  │ • CORS                                      │   │
    │  └──────────────────────────────────────────────┘   │
    │                                                      │
    └──────────────────────────────────────────────────────┘
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │      DATA ACCESS LAYER                              │
    ├──────────────────────────────────────────────────────┤
    │                                                      │
    │  ┌──────────────────┐      ┌──────────────────┐    │
    │  │   TypeORM (ORM)  │      │   Database       │    │
    │  ├──────────────────┤      │   MySQL 8        │    │
    │  │ • Repositories   │◄────►├──────────────────┤    │
    │  │ • Entities       │      │ • 15+ Tables     │    │
    │  │ • Migrations     │      │ • Indexes        │    │
    │  │ • Queries        │      │ • Relationships  │    │
    │  └──────────────────┘      └──────────────────┘    │
    │                                                      │
    │  ┌──────────────────┐                               │
    │  │   Cache Layer    │                               │
    │  │   (Redis)        │                               │
    │  ├──────────────────┤                               │
    │  │ • Sessions       │                               │
    │  │ • Query Cache    │                               │
    │  │ • Rate Limiting  │                               │
    │  └──────────────────┘                               │
    │                                                      │
    └──────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────┐
    │      EXTERNAL SERVICES LAYER                         │
    ├──────────────────────────────────────────────────────┤
    │                                                      │
    │  ┌─────────────────┐  ┌──────────────────────────┐  │
    │  │ Authentication  │  │   Payment Gateways       │  │
    │  ├─────────────────┤  ├──────────────────────────┤  │
    │  │ • Firebase Auth │  │ • VNPAY                  │  │
    │  │ • Google OAuth  │  │ • Momo                   │  │
    │  │ • Facebook Auth │  │ • Transaction Logging    │  │
    │  └─────────────────┘  └──────────────────────────┘  │
    │                                                      │
    │  ┌────────────────┐  ┌────────────────────────────┐  │
    │  │ AI Chatbot     │  │ File Storage & CDN         │  │
    │  ├────────────────┤  ├────────────────────────────┤  │
    │  │ • OpenAI API   │  │ • Cloudinary              │  │
    │  │ • NLP Engine   │  │ • Image Upload/Process    │  │
    │  │ • FAQs         │  │ • Video Hosting           │  │
    │  └────────────────┘  └────────────────────────────┘  │
    │                                                      │
    │  ┌────────────────┐  ┌────────────────────────────┐  │
    │  │ Notifications  │  │ Email & SMS               │  │
    │  ├────────────────┤  ├────────────────────────────┤  │
    │  │ • Push         │  │ • SendGrid                │  │
    │  │ • WebSocket    │  │ • Twilio                  │  │
    │  │ • Real-time    │  │ • Templates               │  │
    │  └────────────────┘  └────────────────────────────┘  │
    │                                                      │
    └──────────────────────────────────────────────────────┘
```

---

## 5. Deployment Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                           AWS CLOUD                                    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    USERS CLIENTS                                │  │
│  │  ┌─────────┐  ┌────────────┐  ┌──────────────┐  ┌───────────┐  │  │
│  │  │Web App  │  │ Web Admin  │  │Mobile App    │  │ 3rd Party │  │  │
│  │  │(React)  │  │ (React)    │  │ (Flutter)    │  │ Integr.   │  │  │
│  │  └─────────┘  └────────────┘  └──────────────┘  └───────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                              │                                         │
│                    ┌─────────▼──────────┐                              │
│                    │  CloudFront CDN    │                              │
│                    │  (Static Assets)   │                              │
│                    └─────────┬──────────┘                              │
│                              │                                         │
│         ┌────────────────────┼────────────────────┐                   │
│         │                    │                    │                   │
│    ┌────▼──────┐    ┌────────▼────────┐   ┌──────▼────────┐          │
│    │ ALB (Load │    │  Elastic        │   │ API Gateway   │          │
│    │ Balancer) │    │  Container      │   │ (WebSocket)   │          │
│    │           │    │  Service (ECS)  │   │               │          │
│    └────┬──────┘    └────────┬────────┘   └──────┬────────┘          │
│         │                    │                    │                   │
│    ┌────▼──────────────────┐ │                    │                   │
│    │   API Servers         │ │                    │                   │
│    │  (NestJS - 3 nodes)   │ │                    │                   │
│    │                       │ │                    │                   │
│    │ Instance 1            │ │                    │                   │
│    │ Instance 2            │ │                    │                   │
│    │ Instance 3            │ │                    │                   │
│    └────┬──────────────────┘ │                    │                   │
│         │                    │                    │                   │
│         └────────┬───────────┴────────┬───────────┘                   │
│                  │                    │                               │
│         ┌────────▼──────────────────┐ │                               │
│         │   RDS MySQL Cluster       │ │                               │
│         │                           │ │                               │
│         │ Master Instance           │ │                               │
│         │ Replica 1 (Read)          │ │                               │
│         │ Replica 2 (Read)          │ │                               │
│         └────────────────────────────┘ │                               │
│                                        │                               │
│         ┌──────────────────────────────▼──┐                            │
│         │   ElastiCache (Redis)            │                            │
│         │ - Session Store                  │                            │
│         │ - Query Cache                    │                            │
│         │ - Rate Limiting                  │                            │
│         └──────────────────────────────────┘                            │
│                                                                         │
│         ┌──────────────────────────────────┐                            │
│         │   S3 Storage                      │                            │
│         │ - Images                          │                            │
│         │ - Documents                       │                            │
│         │ - Backups                         │                            │
│         └──────────────────────────────────┘                            │
│                                                                         │
│         ┌──────────────────────────────────┐                            │
│         │   CloudWatch Monitoring           │                            │
│         │ - Metrics                         │                            │
│         │ - Logs                            │                            │
│         │ - Alarms                          │                            │
│         │ - Auto-scaling                    │                            │
│         └──────────────────────────────────┘                            │
│                                                                         │
│         ┌──────────────────────────────────┐                            │
│         │   VPC & Security Groups           │                            │
│         │ - Private/Public Subnets          │                            │
│         │ - NAT Gateway                     │                            │
│         │ - SSL/TLS (AWS Certificate)       │                            │
│         └──────────────────────────────────┘                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Firebase   │  │   VNPAY      │  │   Momo       │  │  Cloudinary │ │
│  │   Auth/DB    │  │   Payment    │  │   Payment    │  │  CDN        │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  OpenAI API  │  │  SendGrid    │  │   Twilio     │  │  Jitsi      │ │
│  │  Chatbot     │  │  Email       │  │   SMS        │  │  Video Call │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. State Machine Diagram

### 6.1 Appointment State Machine

```
                    ┌──────────────────┐
                    │     Created      │
                    └────────┬─────────┘
                             │
                    ┌────────▼──────────┐
                    │    Pending        │ ◄── Waiting for payment
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │   Confirming      │ ◄── Admin reviewing
                    └────┬───────┬──────┘
                         │       │
        ┌────────────────┘       └──────────────┐
        │                                       │
   ┌────▼─────────┐                   ┌────────▼───────┐
   │  Rejected    │                   │   Confirmed    │
   │              │                   │                │
   │  User: Email │                   │ User: Email    │
   │  Refund: Yes │                   │ Refund: No     │
   └──────────────┘                   └────────┬───────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │   Payment Pending   │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │    Payment Done    │
                                    │ (Status: Paid)     │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │  In Progress       │
                                    │ (Appointment Time) │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │    Completed      │
                                    │ (Appointment Done)│
                                    └────────────────────┘

                    ┌──────────────────────────┐
                    │   Cancelled             │ ◄── From any state
                    │                         │     (except Completed)
                    │  User: Email Notify     │
                    │  Refund: Depends        │
                    └─────────────────────────┘
```

### 6.2 Payment State Machine

```
        ┌──────────────┐
        │   Created    │
        │  (No Amount) │
        └────────┬─────┘
                 │
        ┌────────▼─────────┐
        │   Initiated       │
        │ (Waiting for User)
        └────┬────────┬────┘
             │        │
       ┌─────▼──┐  ┌──▼────────┐
       │ Failed │  │ Processing │
       │        │  │ (On gateway)
       └────────┘  └──┬────────┘
                      │
                 ┌────▼─────┐
                 │ Succeeded │
                 │ (Paid)    │
                 └────┬──────┘
                      │
            ┌─────────▼───────────┐
            │ Refund Initiated    │
            │ (Customer requested)│
            └─────────┬───────────┘
                      │
            ┌─────────▼───────────┐
            │    Refunded         │
            │ (Money returned)    │
            └─────────────────────┘
```

---

## 7. Data Flow Diagram (DFD)

### 7.1 Context Diagram (Level 0)

```
┌─────────────────────────────────────────────────────────────┐
│                    External Entities                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌────────┐  ┌────────┐  ┌─────────┐       │
│  │ Patient  │  │ Doctor │  │ Admin  │  │Payment  │       │
│  │          │  │        │  │        │  │Gateway  │       │
│  └────┬─────┘  └───┬────┘  └───┬────┘  └────┬────┘       │
│       │            │           │            │            │
│       │            │           │            │            │
│       └────────────┼───────────┼────────────┘            │
│                    │           │                         │
│                    ▼           ▼                         │
│            ┌──────────────────────────┐                 │
│            │   Medical Booking        │                 │
│            │   System                 │                 │
│            │                          │                 │
│            │ • Authentication         │                 │
│            │ • Search                 │                 │
│            │ • Booking                │                 │
│            │ • Payment                │                 │
│            │ • Messaging              │                 │
│            │ • Reporting              │                 │
│            │                          │                 │
│            └──────────────────────────┘                 │
│                    │           │                         │
│       ┌────────────┘           └──────────────┐         │
│       │                                       │         │
│       ▼                                       ▼         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ • Appointments                                  │  │
│  │ • Payments                                      │  │
│  │ • Messages                                      │  │
│  │ • Reports                                       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 7.2 DFD Level 1 - Main Processes

```
     Patient                                    Admin
       │                                          │
       │ 1. Search Request                        │
       ├──────────────────┐                       │
       │                  │                       │
       │          ┌───────▼────────┐              │
       │          │  1.0 Search    │              │
       │          │  Doctor Data   │              │
       │          └───────┬────────┘              │
       │                  │                       │
       │            ┌─────▼──────┐                │
       │            │  Doctor    │                │
       │            │  Database  │                │
       │            └────────────┘                │
       │                                          │
       │ 2. Book Appointment                      │
       ├──────────────────┐                       │
       │                  │                       │
       │          ┌───────▼────────────┐          │
       │          │  2.0 Book          │          │
       │          │  Appointment       │          │
       │          └───────┬────────────┘          │
       │                  │                       │
       │            ┌─────▼─────────────┐         │
       │            │ Appointment       │         │
       │            │ Database          │         │
       │            └──────────────────┘         │
       │                                          │
       │ 3. Make Payment                          │
       ├──────────────────┐                       │
       │                  │                       │
       │          ┌───────▼────────────┐          │
       │          │  3.0 Process       │          │
       │          │  Payment           │          │
       │          └───────┬────────────┘          │
       │                  │                       │
       │            ┌─────▼──────────┐            │
       │            │ Payment        │            │
       │            │ Gateway        │            │
       │            └────────────────┘            │
       │                                          │
       │ 4. Send/Receive Messages                 │
       ├──────────────────┐                       │
       │                  │                       │
       │          ┌───────▼────────────┐          │
       │          │  4.0 Messaging    │          │
       │          │  Service          │          │
       │          └───────┬────────────┘          │
       │                  │                       │
       │            ┌─────▼──────────┐            │
       │            │ Message        │            │
       │            │ Database       │            │
       │            └────────────────┘            │
       │                                          │
       │────────────────────────────────────────→ │
       │ 5. View Appointment                      │
       │    (Admin Function)                      │
       │                          ┌───────────────┤
       │                          │               │
       │                    ┌─────▼────────────┐  │
       │                    │  5.0 Manage      │  │
       │                    │  Appointments    │  │
       │                    └─────┬────────────┘  │
       │                          │               │
       │                    ┌─────▼──────────┐    │
       │                    │Appointment DB  │    │
       │                    └────────────────┘    │
       │                                          │
```

---

**Document Version:** 1.0  
**Last Updated:** 23/05/2026  
**Status:** ✅ Complete

*All diagrams created using ASCII art for easy version control and documentation compatibility.*
