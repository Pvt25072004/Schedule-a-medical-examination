import 'package:dio/dio.dart';
import '../core/utils/api_config.dart';
import '../core/network/dio_client.dart';

class AppointmentService {
  Dio get _dio => DioClient().dio;

  Future<int> getOrCreateUserId({
    required String email,
    required String fullName,
    required String phone,
  }) async {
    try {
      final listResponse = await _dio.get('${ApiConfig.baseUrl}/users');

      if (listResponse.statusCode == 200) {
        final List<dynamic> users = listResponse.data;
        final existingUser = users.firstWhere(
          (u) => u['email'].toString().toLowerCase() == email.toLowerCase(),
          orElse: () => null,
        );

        if (existingUser != null) {
          return existingUser['id'] as int;
        }
      }

      final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
      final validPhone = cleanPhone.length >= 10 ? cleanPhone.substring(0, 10) : '0999999999';

      final createResponse = await _dio.post(
        '${ApiConfig.baseUrl}/users',
        data: {
          'full_name': fullName.isNotEmpty ? fullName : 'Khách hàng',
          'email': email,
          'phone': validPhone,
          'gender': 'other',
          'role': 'patient',
          'password_hash': 'firebase_bridged', 
        },
      );

      if (createResponse.statusCode == 201) {
        final Map<String, dynamic> newUser = createResponse.data;
        return newUser['id'] as int;
      } else {
        print('⚠️ Không thể tự động tạo user trên Backend: ${createResponse.data}');
      }
    } catch (e) {
      print('🔥 Lỗi đồng bộ hóa Bridge User: $e');
    }

    return 1; 
  }

  Future<Map<String, dynamic>?> createAppointment({
    required int doctorId,
    required int hospitalId,
    required String date,
    required String time,
    required String symptoms,
    required String patientEmail,
    required String patientName,
    required String patientPhone,
    String? patientGender,
    String? patientDob,
    String? relationship,
    String? patientAddress,
    String? currentUserId, // Thêm trường này
  }) async {
    try {
      int realUserId = 1;

      if (currentUserId != null && currentUserId.isNotEmpty) {
        final parsedId = int.tryParse(currentUserId);
        if (parsedId != null) {
          realUserId = parsedId;
          print('✅ Dùng trực tiếp User ID từ Session mới: $realUserId');
        }
      } else {
        print('⚠️ Không tìm thấy session, dùng luồng Bridge...');
        realUserId = await getOrCreateUserId(
          email: patientEmail,
          fullName: patientName,
          phone: patientPhone,
        );
      }

      final payload = {
        'user_id': realUserId,
        'doctor_id': doctorId,
        'hospital_id': hospitalId,
        'appointment_date': date,
        'appointment_time': time,
        'examination_type': 'offline',
        'symptoms': symptoms.isNotEmpty ? symptoms : 'Đặt lịch qua Mobile App',
        if (patientGender != null) 'patientGender': patientGender,
        if (patientDob != null) 'patientDob': patientDob,
        if (relationship != null) 'relationship': relationship,
        if (patientAddress != null) 'patientAddress': patientAddress,
      };

      print('🚀 Gửi payload đặt lịch: $payload');

      final response = await _dio.post(
        '${ApiConfig.baseUrl}/appointments',
        data: payload,
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        final errorMsg = response.data['message'] ?? 'Lỗi không rõ';
        throw Exception(errorMsg);
      }
    } catch (e) {
      print('🔥 AppointmentService Error: $e');
      rethrow; 
    }
  }

  Future<List<dynamic>> fetchUserAppointments(int userId) async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/appointments/user/$userId';
      print('➡️ Lấy lịch khám của Bệnh nhân: $urlStr');
      final response = await _dio.get(urlStr);

      if (response.statusCode == 200) {
        return response.data as List<dynamic>;
      }
      return [];
    } catch (e) {
      print('🔥 fetchUserAppointments Error: $e');
      return [];
    }
  }

  Future<List<dynamic>> fetchDoctorAppointments({required int doctorId, String? date}) async {
    try {
      String urlStr = '${ApiConfig.baseUrl}/appointments/doctor/$doctorId';
      if (date != null && date.isNotEmpty) {
        urlStr += '?date=$date';
      }

      print('➡️ Lấy lịch khám của Bác sĩ: $urlStr');
      final response = await _dio.get(urlStr);

      if (response.statusCode == 200) {
        return response.data as List<dynamic>;
      }
      return [];
    } catch (e) {
      print('🔥 fetchDoctorAppointments Error: $e');
      return [];
    }
  }

  Future<bool> updateAppointmentStatus({
    required int appointmentId,
    required String status,
    String? reason,
    String? bankName,
    String? bankAccount,
    String? accountName,
  }) async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/appointments/$appointmentId/status';
      final payload = {
        'status': status,
        if (reason != null) 'reason': reason,
        if (bankName != null) 'refund_bank_name': bankName,
        if (bankAccount != null) 'refund_bank_account': bankAccount,
        if (accountName != null) 'refund_account_name': accountName,
      };

      print('🚀 Cập nhật Trạng thái Lịch hẹn: $urlStr -> $status');
      final response = await _dio.patch(
        urlStr,
        data: payload,
      );

      if (response.statusCode == 200) {
        return true;
      }
      print('🔥 updateAppointmentStatus Failed with status ${response.statusCode}: ${response.data}');
      return false;
    } catch (e) {
      print('🔥 updateAppointmentStatus Error: $e');
      return false;
    }
  }

  Future<bool> requestRefund({
    required int appointmentId,
    required String bankName,
    required String bankAccount,
    required String accountName,
  }) async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/appointments/$appointmentId/request-refund';
      final payload = {
        'bankName': bankName,
        'bankAccount': bankAccount,
        'accountName': accountName,
      };

      print('🚀 Yêu cầu hoàn tiền: $urlStr');
      final response = await _dio.post(
        urlStr,
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
      print('🔥 requestRefund Failed with status ${response.statusCode}: ${response.data}');
      return false;
    } catch (e) {
      print('🔥 requestRefund Error: $e');
      return false;
    }
  }

  Future<bool> rescheduleAppointment({
    required int appointmentId,
    required int scheduleId,
    required int doctorId,
    required int hospitalId,
    required String appointmentDate,
    required String appointmentTime,
    String? doctorNameSnapshot,
    String? hospitalNameSnapshot,
  }) async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/appointments/$appointmentId/reschedule';
      final payload = {
        'schedule_id': scheduleId,
        'doctor_id': doctorId,
        'hospital_id': hospitalId,
        'appointment_date': appointmentDate,
        'appointment_time': appointmentTime,
        if (doctorNameSnapshot != null) 'doctor_name_snapshot': doctorNameSnapshot,
        if (hospitalNameSnapshot != null) 'hospital_name_snapshot': hospitalNameSnapshot,
      };

      print('🚀 Dời lịch hẹn: $urlStr');
      final response = await _dio.put(
        urlStr,
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
      print('🔥 reschedule Failed with status ${response.statusCode}: ${response.data}');
      return false;
    } catch (e) {
      print('🔥 reschedule Error: $e');
      return false;
    }
  }
}

