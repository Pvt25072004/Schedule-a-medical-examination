import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/api_config.dart';
import 'auth_service.dart';

class MedicalRecordService {
  Map<String, String> _getHeaders() {
    final token = AuthService.accessToken;
    final headers = {'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  /// Lấy danh sách hồ sơ bệnh án của User
  Future<List<dynamic>> fetchMyRecords() async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/medical-records/my-records');
      final response = await http.get(url, headers: _getHeaders()).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      }
      return [];
    } catch (e) {
      print('🔥 Lỗi fetchMyRecords: $e');
      return [];
    }
  }

  /// Lấy hồ sơ bệnh án theo Lịch hẹn (Appointment)
  Future<Map<String, dynamic>?> fetchRecordByAppointment(int appointmentId) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/medical-records/appointment/$appointmentId');
      final response = await http.get(url, headers: _getHeaders()).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        if (data is List && data.isNotEmpty) {
           return data.first;
        } else if (data is Map<String, dynamic>) {
           return data;
        }
      }
      return null;
    } catch (e) {
      print('🔥 Lỗi fetchRecordByAppointment: $e');
      return null;
    }
  }
}
