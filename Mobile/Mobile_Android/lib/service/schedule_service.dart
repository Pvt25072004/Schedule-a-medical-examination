import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/api_config.dart';

class ScheduleService {
  Future<List<dynamic>> fetchDoctorSchedules(int doctorId) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/schedules?doctorId=$doctorId');
      final response = await http.get(
        url,
        headers: {'Content-Type': 'application/json'},
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      } else {
        print('Lỗi lấy lịch khám: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      print('🔥 ScheduleService Error: $e');
      return [];
    }
  }
}
