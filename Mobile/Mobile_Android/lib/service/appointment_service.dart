import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import '../utils/api_config.dart';

class AppointmentService {
  /// Lấy Access Token hiện tại
  Map<String, String> _getHeaders() {
    final token = AuthService.accessToken;
    final headers = {'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  /// Đồng bộ hóa tài khoản Firebase sang SQL Server (NestJS) - Dùng làm fallback dự phòng
  Future<int> getOrCreateUserId({
    required String email,
    required String fullName,
    required String phone,
  }) async {
    try {
      // BƯỚC 1: Kiểm tra xem user đã tồn tại trên SQL hay chưa qua GET /users
      final listResponse = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/users'),
        headers: _getHeaders(),
      ).timeout(ApiConfig.timeout);

      if (listResponse.statusCode == 200) {
        final List<dynamic> users = jsonDecode(listResponse.body);
        final existingUser = users.firstWhere(
          (u) => u['email'].toString().toLowerCase() == email.toLowerCase(),
          orElse: () => null,
        );

        if (existingUser != null) {
          return existingUser['id'] as int;
        }
      }

      // BƯỚC 2: Nếu chưa tồn tại, tiến hành tạo mới tự động (Bridge)
      final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
      final validPhone = cleanPhone.length >= 10 ? cleanPhone.substring(0, 10) : '0999999999';

      final createResponse = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/users'),
        headers: _getHeaders(),
        body: jsonEncode({
          'full_name': fullName.isNotEmpty ? fullName : 'Khách hàng',
          'email': email,
          'phone': validPhone,
          'gender': 'other',
          'role': 'patient',
          'password_hash': 'firebase_bridged', 
        }),
      ).timeout(ApiConfig.timeout);

      if (createResponse.statusCode == 201) {
        final Map<String, dynamic> newUser = jsonDecode(createResponse.body);
        return newUser['id'] as int;
      } else {
        print('⚠️ Không thể tự động tạo user trên Backend: ${createResponse.body}');
      }
    } catch (e) {
      print('🔥 Lỗi đồng bộ hóa Bridge User: $e');
    }

    return 1; 
  }

  /// Tạo lịch hẹn mới trên hệ thống
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
  }) async {
    try {
      int realUserId = 1;

      // KIỂM TRA ƯU TIÊN: Dùng trực tiếp User ID từ session đã đăng nhập của AuthService mới!
      final currentUser = AuthService.currentUser;
      if (currentUser != null && currentUser.uid.isNotEmpty) {
        final parsedId = int.tryParse(currentUser.uid);
        if (parsedId != null) {
          realUserId = parsedId;
          print('✅ Dùng trực tiếp User ID từ Session mới: $realUserId');
        }
      } else {
        // FALLBACK: Dùng cơ chế Bridge nếu chạy luồng không bắt buộc login cũ
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

      print('🚀 Gửi payload đặt lịch: ${jsonEncode(payload)}');

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/appointments'),
        headers: _getHeaders(),
        body: jsonEncode(payload),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
      } else {
        final errorMsg = jsonDecode(utf8.decode(response.bodyBytes))['message'] ?? 'Lỗi không rõ';
        throw Exception(errorMsg);
      }
    } catch (e) {
      print('🔥 AppointmentService Error: $e');
      rethrow; 
    }
  }

  /// Lấy danh sách lịch hẹn của Bệnh nhân theo mã Bệnh nhân (User ID)
  Future<List<dynamic>> fetchUserAppointments(int userId) async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/appointments/user/$userId';
      print('➡️ Lấy lịch khám của Bệnh nhân: $urlStr');
      final response = await http.get(
        Uri.parse(urlStr),
        headers: _getHeaders(),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      }
      return [];
    } catch (e) {
      print('🔥 fetchUserAppointments Error: $e');
      return [];
    }
  }

  /// Lấy danh sách lịch hẹn của Bác sĩ theo mã Bác sĩ và Ngày khám (tuỳ chọn)
  Future<List<dynamic>> fetchDoctorAppointments({required int doctorId, String? date}) async {
    try {
      String urlStr = '${ApiConfig.baseUrl}/appointments/doctor/$doctorId';
      if (date != null && date.isNotEmpty) {
        urlStr += '?date=$date';
      }

      print('➡️ Lấy lịch khám của Bác sĩ: $urlStr');
      final response = await http.get(
        Uri.parse(urlStr),
        headers: _getHeaders(),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      }
      return [];
    } catch (e) {
      print('🔥 fetchDoctorAppointments Error: $e');
      return [];
    }
  }

  /// Cập nhật trạng thái Lịch hẹn (Ví dụ: Xác nhận, Hoàn tất, Từ chối)
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
      final response = await http.patch(
        Uri.parse(urlStr),
        headers: _getHeaders(),
        body: jsonEncode(payload),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return true;
      }
      print('🔥 updateAppointmentStatus Failed with status ${response.statusCode}: ${response.body}');
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
      final response = await http.post(
        Uri.parse(urlStr),
        headers: _getHeaders(),
        body: jsonEncode(payload),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
      print('🔥 requestRefund Failed with status ${response.statusCode}: ${response.body}');
      return false;
    } catch (e) {
      print('🔥 requestRefund Error: $e');
      return false;
    }
  }
}
