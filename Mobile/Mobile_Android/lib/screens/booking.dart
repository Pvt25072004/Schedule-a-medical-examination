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
  final Map<String, dynamic>? initialDoctorData;
  final Map<String, dynamic>? initialPackageData;

  const BookingScreen({super.key, this.initialDoctorData, this.initialPackageData});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  int currentStep = 1; // Bắt đầu từ step 1
  bool isDirectBooking = false;

  // Màu chủ đạo giả định (cho AppBar)
  final Color primaryDarkColor = const Color(0xFF1B5E20);


  // Data state được truyền giữa các steps
  int maxStepReached = 1;

  String selectedCity = '';
  Color? cityColor;
  String selectedHospital = '';
  int? selectedHospitalId; // MỚI: Lưu ID thật từ backend
  String selectedSpecialty = '';
  int? selectedCategoryId; // MỚI: Lưu ID thật từ backend
  Color specialtyColor = const Color(0xFF48A1F3);
  String selectedDoctor = '';
  int? selectedDoctorId; // MỚI: Lưu ID thật từ backend
  String? selectedRoomName; // MỚI: Tên phòng khám
  
  // -- Tích hợp Gói Khám --
  int? selectedPackageId;
  String selectedPackageName = '';
  bool isPackageBooking = false;

  double selectedPrice = 0.0;
  DateTime selectedDate = DateTime.now();
  String selectedTimeSlot = '';
  String fullName = '';
  String phone = '';
  String email = '';
  String reason = ''; // Dùng biến này để lưu trạng thái
  String note = '';   // Dùng biến này để lưu trạng thái
  String bookingCode = ''; // MỚI: Mã lịch khám trả về từ Backend

  // Thông tin người thân
  bool isForRelative = false;
  String? patientGender;
  String? patientDob;
  String? relationship;
  String? patientAddress;

  @override
  void initState() {
    super.initState();
    if (widget.initialDoctorData != null) {
      isDirectBooking = true;
      currentStep = 5; // Nhảy cóc đến bước chọn Ngày/Giờ
      maxStepReached = 5; // Cho phép hiển thị progress bar đến bước 5

      final doc = widget.initialDoctorData!;
      selectedDoctorId = doc['id'] != null ? int.tryParse(doc['id'].toString()) : null;
      selectedDoctor = doc['name'] ?? 'Bác sĩ';
      
      final category = doc['category'];
      if (category != null) {
        selectedCategoryId = category['id'] != null ? int.tryParse(category['id'].toString()) : null;
        selectedSpecialty = category['name'] ?? '';
      }

      // --- TÍNH TOÁN GIÁ THẬT (Chuẩn Enterprise) ---
      final double doctorFee = (doc['consultation_fee'] ?? 0).toDouble();
      double facilityFee = 0;

      final hospitals = doc['hospitals'] as List?;
      if (hospitals != null && hospitals.isNotEmpty) {
        final hos = hospitals.first;
        facilityFee = (hos['facility_fee'] ?? 0).toDouble();
        selectedHospitalId = hos['id'] != null ? int.tryParse(hos['id'].toString()) : null;
        selectedHospital = hos['name'] ?? '';
        selectedCity = 'Hà Nội'; // Fallback
      }
      
      
      selectedPrice = doctorFee + facilityFee;
    } else if (widget.initialPackageData != null) {
      isDirectBooking = true;
      isPackageBooking = true;
      currentStep = 4; // Nhảy đến chọn Bác sĩ
      maxStepReached = 4;

      final pkg = widget.initialPackageData!;
      selectedPackageId = pkg['id'] != null ? int.tryParse(pkg['id'].toString()) : null;
      selectedPackageName = pkg['name'] ?? 'Gói Khám';
      
      final priceVal = pkg['price'];
      if (priceVal is int) {
        selectedPrice = priceVal.toDouble();
      } else if (priceVal is double) {
        selectedPrice = priceVal;
      }
      
      // Giả định package có gán hospital
      if (pkg['hospital_id'] != null) {
        selectedHospitalId = int.tryParse(pkg['hospital_id'].toString());
      }
    }
  }

  // Callback để cập nhật state khi chuyển step
  void goToStep(int step, {Map<String, dynamic>? data}) {
    setState(() {
      if (isDirectBooking) {
        if (isPackageBooking && step < 4) return; // Nếu là Gói khám thì không được lùi về trước bước Chọn bác sĩ
        if (!isPackageBooking && step < 5) return; // Nếu là Khám theo Bác sĩ thì không được lùi về trước bước Chọn Ngày/Giờ
      }

      // Logic chỉ cho phép chuyển tiến tới bước đã hoàn thành
      if (data == null && step > maxStepReached) {
        // Ngăn chặn nhảy cóc tới bước chưa hoàn thành thông qua Progress Bar
        return;
      }

      currentStep = step;
      if (step > maxStepReached) {
        maxStepReached = step;
      }

      if (data != null) {
        if (step == 2) {
          selectedCity = data['city'] ?? '';
          cityColor = data['color'];
        } else if (step == 3) {
          selectedHospital = data['hospital'] ?? '';
          selectedHospitalId = data['hospitalId']; // Nhận ID Bệnh viện thật
        } else if (step == 4) {
          selectedSpecialty = data['specialty'] ?? '';
          selectedCategoryId = data['categoryId']; // Nhận ID Chuyên khoa thật
          specialtyColor = data['color'] ?? const Color(0xFF48A1F3);
        } else if (step == 5) {
          // Step 5: Đến từ Chọn Bác sĩ (Step 4)
          if (data != null && data.containsKey('doctor')) {
            selectedDoctor = data['doctor'] ?? selectedDoctor;
            selectedDoctorId = data['doctorId'] ?? selectedDoctorId;

            final priceData = data['price'];
            if (priceData is int) {
              selectedPrice = priceData.toDouble();
            } else if (priceData is double) {
              selectedPrice = priceData;
            }
          }
        } else if (step == 6) {
          // Step 6: Đến từ Chọn Ngày/Giờ (Step 5)
          if (data != null && data.containsKey('date')) {
            selectedDate = data['date'] is DateTime ? data['date'] : (data['date'] as DateTime? ?? DateTime.now());
            selectedTimeSlot = data['timeSlot'] ?? '';
            selectedRoomName = data['roomName'];
          }
        } else if (step == 7) {
          // Step 7: Thông tin Bệnh nhân
          fullName = data['fullName'] ?? '';
          phone = data['phone'] ?? '';
          email = data['email'] ?? '';
          reason = data['reason'] ?? '';
          note = data['note'] ?? '';
          isForRelative = data['isForRelative'] ?? false;
          patientGender = data['patientGender'];
          patientDob = data['patientDob'];
          relationship = data['relationship'];
          patientAddress = data['patientAddress'];
        } else if (step == 8) {
          // Step 8: Lưu mã xác nhận từ API Backend đặt lịch trả về
          bookingCode = data['bookingCode'] ?? '';
        }
      }
    });
  }

  // Back to previous step
  void goBack() {
    if (isDirectBooking) {
      if (isPackageBooking) {
        if (currentStep == 4) {
          Navigator.pop(context); // Quay về màn hình danh sách gói khám
          return;
        }
        if (currentStep == 5) {
          setState(() => currentStep = 4); // Từ chọn Ngày/Giờ lùi về chọn Bác sĩ
          return;
        }
      } else {
        if (currentStep == 5) {
          Navigator.pop(context); // Quay về màn hình hồ sơ bác sĩ
          return;
        }
      }
      if (currentStep == 6) {
        setState(() => currentStep = 5); // Từ thông tin BN lùi về chọn Ngày/Giờ
        return;
      }
    }

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
          hospitalId: selectedHospitalId,
          color: cityColor,
          onNext: (data) => goToStep(4, data: data),
          onBack: goBack,
        );
        break;
      case 4:
      // Step 4: Chọn Bác sĩ
        body = Step5DoctorSelection(
          cityName: selectedCity,
          specialtyName: selectedSpecialty,
          hospitalName: selectedHospital,
          hospitalId: selectedHospitalId,
          categoryId: selectedCategoryId,
          specialtyColor: specialtyColor,
          selectedDate: null,
          selectedTimeSlot: null,
          onNext: (data) => goToStep(5, data: data),
          onBack: goBack,
        );
        break;
      case 5:
      // Step 5: Chọn Ngày/Giờ
        body = Step4DateTimeSelection(
          doctorId: selectedDoctorId,
          onNext: (data) => goToStep(6, data: data),
          onBack: goBack,
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
          hospitalId: selectedHospitalId, // Truyền vào để gọi API
          roomName: selectedRoomName,
          doctor: selectedDoctor,
          doctorId: selectedDoctorId, // Truyền vào để gọi API
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          fullName: fullName,
          phone: phone,
          email: email,
          reason: reason,
          bookingPrice: selectedPrice,
          isForRelative: isForRelative,
          patientGender: patientGender,
          patientDob: patientDob,
          relationship: relationship,
          patientAddress: patientAddress,
          onNext: (data) => goToStep(8, data: data), // Chuyển sang Step 8 (Xác nhận)
          onBack: goBack, // Quay lại Step 6
        );
        break;
      case 8:
      default:
      // Step 8: Xác nhận Đặt lịch Thành công
        body = Step8Confirmation(
          bookingCode: bookingCode, // Truyền mã lịch thực từ Backend
          hospitalName: selectedHospital,
          roomName: selectedRoomName,
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

    return WillPopScope(
      onWillPop: () async {
        if (isDirectBooking) {
          if (isPackageBooking && (currentStep == 4 || currentStep == 8)) return true;
          if (!isPackageBooking && (currentStep == 5 || currentStep == 8)) return true;
          goBack();
          return false; // Chặn thoát, chỉ lùi step
        } else {
          if (currentStep == 1 || currentStep == 8) return true;
          goBack();
          return false;
        }
      },
      child: Scaffold(
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
          automaticallyImplyLeading: false, // Ẩn nút back mặc định
          elevation: 0,
          actions: [
            if (isDirectBooking)
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () {
                  Navigator.of(context).pop();
                },
                tooltip: 'Hủy đặt lịch',
              ),
          ],
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
      ),
    );
  }
}