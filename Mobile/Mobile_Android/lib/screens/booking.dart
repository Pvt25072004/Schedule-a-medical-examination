import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';

// --- Import các Steps (Giữ nguyên các tên file giả định của bạn) ---
import '../subscreens/booking/process_bar.dart';
import '../subscreens/booking/step1_area_selection.dart';
import '../subscreens/booking/step2_area_selection.dart';
import '../subscreens/booking/step3_area_selection.dart';
import '../subscreens/booking/step4_area_selection.dart';
import '../subscreens/booking/step5_area_selection.dart'; // step5_doctor_selection
import '../subscreens/booking/step6_area_selection.dart'; // step6_patient_info
import '../subscreens/booking/step7_area_selection.dart'; // step7_payment
import '../subscreens/booking/step8_area_selection.dart'; // step8_confirmation

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  int currentStep = 1; // Bắt đầu từ step 1

  // Màu chủ đạo giả định (cho AppBar)
  final Color primaryDarkColor = const Color(0xFF1B5E20);


  // Data state được truyền giữa các steps
  String selectedCity = '';
  Color? cityColor;
  String selectedHospital = '';
  String selectedSpecialty = '';
  Color specialtyColor = Colors.greenAccent;
  String selectedDoctor = '';
  double selectedPrice = 0.0;
  DateTime selectedDate = DateTime.now();
  String selectedTimeSlot = '';
  String fullName = '';
  String phone = '';
  String email = '';
  String reason = ''; // <-- Dùng biến này để lưu trạng thái
  String note = '';   // <-- Dùng biến này để lưu trạng thái

  // Callback để cập nhật state khi chuyển step
  void goToStep(int step, {Map<String, dynamic>? data}) {
    setState(() {
      // Logic chỉ cho phép chuyển tiến hoặc quay lại bước đã hoàn thành
      if (step > currentStep && step > 8) return;

      currentStep = step;
      if (data != null) {
        if (step == 2) {
          selectedCity = data['city'] ?? '';
          cityColor = data['color'];
        } else if (step == 3) {
          selectedHospital = data['hospital'] ?? '';
        } else if (step == 4) {
          selectedSpecialty = data['specialty'] ?? '';
          specialtyColor = data['color'] ?? Colors.greenAccent;
        } else if (step == 5) {
          // Step 5: Chọn Ngày/Giờ
          selectedDate = data['date'] is DateTime ? data['date'] : (data['date'] as DateTime? ?? DateTime.now());
          selectedTimeSlot = data['timeSlot'] ?? '';
        } else if (step == 6) {
          // Step 6: Chọn Bác sĩ
          selectedDoctor = data['doctor'] ?? '';

          // --- SỬA LỖI: ÉP KIỂU SANG DOUBLE ---
          final priceData = data['price'];
          if (priceData is int) {
            selectedPrice = priceData.toDouble();
          } else if (priceData is double) {
            selectedPrice = priceData;
          } else {
            selectedPrice = 0.0;
          }
          // ------------------------------------

        } else if (step == 7) {
          // Step 7: Thông tin Bệnh nhân
          fullName = data['fullName'] ?? '';
          phone = data['phone'] ?? '';
          email = data['email'] ?? '';
          reason = data['reason'] ?? '';
          note = data['note'] ?? '';
        }
        // Step 8 (Thanh toán) và Step 9 (Xác nhận) không cần lưu data tạm
      }
    });
  }

  // Back to previous step
  void goBack() {
    if (currentStep > 1) {
      setState(() => currentStep--);
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget body;
    switch (currentStep) {
      case 1:
        body = Step1AreaSelection(
          onNext: (data) => goToStep(2, data: data),
        );
        break;
      case 2:
        body = Step2HospitalSelection(
          cityName: selectedCity,
          cityColor: cityColor,
          onNext: (data) => goToStep(3, data: data),
          onBack: goBack,
        );
        break;
      case 3:
        body = Step3SpecialtySelection(
          cityName: selectedCity,
          hospitalName: selectedHospital,
          color: cityColor,
          onNext: (data) => goToStep(4, data: data),
          onBack: goBack,
        );
        break;
      case 4:
      // Step 4: Chọn Ngày/Giờ (Sử dụng specialtyColor cho accent)
        body = Step4DateTimeSelection(
          onNext: (data) => goToStep(5, data: data),
          onBack: goBack,
        );
        break;
      case 5:
      // Step 5: Chọn Bác sĩ
        body = Step5DoctorSelection(
          specialtyName: selectedSpecialty,
          hospitalName: selectedHospital,
          specialtyColor: specialtyColor,
          onNext: (data) => goToStep(6, data: data), // Chuyển sang Step 6 (Thông tin BN)
          onBack: goBack, // Quay lại Step 4
        );
        break;
      case 6:
      // Step 6: Thông tin Bệnh nhân
        body = Step6PatientInfo(
          initialReason: reason,
          initialNote: note,
          onNext: (data) => goToStep(7, data: data), // Chuyển sang Step 7 (Thanh Toán)
          onBack: goBack, // Quay lại Step 5
        );
        break;
      case 7:
      // Step 7: Thanh toán
        body = Step7Payment(
          hospitalName: selectedHospital,
          doctor: selectedDoctor,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          fullName: fullName,
          phone: phone,
          bookingPrice: selectedPrice,
          onNext: (data) => goToStep(8, data: data), // Chuyển sang Step 8 (Xác nhận)
          onBack: goBack, // Quay lại Step 6
        );
        break;
      case 8:
      default:
      // Step 8: Xác nhận Đặt lịch Thành công
        body = Step8Confirmation(
          hospitalName: selectedHospital,
          cityName: selectedCity,
          specialty: selectedSpecialty,
          doctor: selectedDoctor,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          price: selectedPrice,
          fullName: fullName,
          phone: phone,
          email: email,
          reason: reason,
          // Bấm đặt lịch mới sẽ quay về Step 1
          onBookNew: () => goToStep(1),
        );
        break;
    }

    // --- LOẠI BỎ LOGIC ĐỔI MÀU APPBAR, CHỈ DÙNG MÀU TRẮNG VÀ CHỮ TỐI ---
    const Color appBarColor = Colors.white;
    const Color foregroundColor = Colors.black87;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Row(
          children: [
            // Icon / Logo
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset(
                'assets/images/LOGOmain.jpg',
                width: 36,
                height: 36,
                fit: BoxFit.cover,
              ),
            ),

            const SizedBox(width: 10),

            // Text phần tên & mô tả
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'HealthCare VN',
                  style: TextStyle(
                    color: foregroundColor,
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                Text(
                  'Đặt lịch khám bệnh trực tuyến',
                  style: TextStyle(
                    color: foregroundColor.withOpacity(0.8),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
        // Nền luôn là màu trắng (hoặc màu mặc định)
        backgroundColor: appBarColor,
        foregroundColor: foregroundColor, // Chữ/icon luôn màu tối
        automaticallyImplyLeading: false,
        elevation: 0,
      ),
      body: Column(
        children: [
          const SizedBox(height: 10),
          BookingProgressBar(
            currentStep: currentStep,
            totalSteps: 8, // TỔNG CỘNG 8 BƯỚC
            onStepTap: (step) => goToStep(step),
          ),
          Expanded(child: body),
        ],
      ),
    );
  }
}