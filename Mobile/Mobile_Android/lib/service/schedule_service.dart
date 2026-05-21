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

  Future<List<String>> fetchAvailableTimes(int doctorId, String date) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/appointments/available-times?doctorId=$doctorId&date=$date');
      final response = await http.get(
        url,
        headers: {'Content-Type': 'application/json'},
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
        return data.cast<String>();
      } else {
        print('Lỗi lấy giờ trống: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      print('🔥 fetchAvailableTimes Error: $e');
      return [];
    }
  }
}
