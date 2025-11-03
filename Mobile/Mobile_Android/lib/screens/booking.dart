import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import '../subscreens/booking/process_bar.dart';
import '../subscreens/booking/step1_area_selection.dart';
import '../subscreens/booking/step2_area_selection.dart';
import '../subscreens/booking/step3_area_selection.dart';
import '../subscreens/booking/step4_area_selection.dart';
import '../subscreens/booking/step5_area_selection.dart';
import '../subscreens/booking/step6_area_selection.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  int currentStep = 1; // Bắt đầu từ step 1

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
  String reason = '';
  String note = '';

  // Callback để cập nhật state khi chuyển step
  void goToStep(int step, {Map<String, dynamic>? data}) {
    setState(() {
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
          selectedDate = data['date'] ?? DateTime.now();
          selectedTimeSlot = data['timeSlot'] ?? '';
        } else if (step == 6) {
          fullName = data['fullName'] ?? '';
          phone = data['phone'] ?? '';
          email = data['email'] ?? '';
          reason = data['reason'] ?? '';
          note = data['note'] ?? '';
        }
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
        body = Step4DateTimeSelection(
          onNext: (data) => goToStep(5, data: data),
          onBack: () => goToStep(3),
        );
        break;
      case 5:
        body = Step5PatientInfo(
          onNext: (data) => goToStep(6, data: data),
          onBack: () => goToStep(4),
        );
        break;
      case 6:
      default:
        body = Step6Confirmation(
          cityName: selectedCity,
          hospitalName: selectedHospital,
          specialty: selectedSpecialty,
          doctor: selectedDoctor,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          price: selectedPrice,
          fullName: fullName,
          phone: phone,
          email: email,
          reason: reason,
          note: note,
          onConfirm: () {
            showAppSnackBar(context, 'Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận.');
          },
          onBack: () => goToStep(5),
        );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Row(
          children: [
            // Icon / Logo
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                gradient: const LinearGradient(
                  colors: [Color(0xFF2FA8E0), Color(0xFF4BE29D)], // xanh blue-green
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: const Icon(Icons.favorite, color: Colors.white, size: 20),
            ),

            const SizedBox(width: 10),

            // Text phần tên & mô tả
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Text(
                  'HealthCare VN',
                  style: TextStyle(
                    color: Colors.black87,
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                Text(
                  'Đặt lịch khám bệnh trực tuyến',
                  style: TextStyle(
                    color: Colors.black54,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
        backgroundColor: currentStep == 6 ? Colors.green : (currentStep == 4 ? specialtyColor : Colors.white),
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
        elevation: 0,
      ),
      body: Column(
        children: [
          SizedBox(height: 10),
          BookingProgressBar(
            currentStep: currentStep,
            totalSteps: 6,
            onStepTap: (step) => goToStep(step), // Pass callback for tappable steps
          ),
          Expanded(child: body),
        ],
      ),
    );
  }
}