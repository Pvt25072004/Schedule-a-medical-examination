import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import '../utils/api_config.dart';

class DoctorService {
  Future<List<dynamic>> fetchDoctors({
    int? hospitalId,
    int? categoryId,
    DateTime? date,
    String? timeSlot,
  }) async {
    try {
      String urlStr = '${ApiConfig.baseUrl}/doctors';
      List<String> queryParams = [];
      
      if (hospitalId != null) {
        queryParams.add('hospitalId=$hospitalId');
      }
      if (categoryId != null) {
        queryParams.add('categoryId=$categoryId');
      }
      if (date != null) {
        final dateStr = "${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}";
        queryParams.add('date=$dateStr');
      }
      if (timeSlot != null && timeSlot.isNotEmpty) {
        queryParams.add('time=$timeSlot');
      }
      
      if (queryParams.isNotEmpty) {
        urlStr += '?${queryParams.join('&')}';
      }
      
      // Lấy Access Token từ hệ thống đăng nhập mới
      final token = AuthService.accessToken;
      final Map<String, String> headers = {
        'Content-Type': 'application/json',
      };
      
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
      
      print('➡️ Gọi API Danh sách Bác sĩ: $urlStr (Kèm Token: ${token != null})');

      final response = await http.get(
        Uri.parse(urlStr),
        headers: headers,
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      } else {
        throw Exception('Lỗi tải danh sách bác sĩ: ${response.statusCode}');
      }
    } catch (e) {
      print('🔥 DoctorService Error: $e');
      return [];
    }
  }

  /// Lấy thông tin chi tiết hồ sơ Bác sĩ hiện tại qua /doctors/me
  Future<Map<String, dynamic>?> fetchDoctorProfile() async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/doctors/me';
      final token = AuthService.accessToken;
      final Map<String, String> headers = {
        'Content-Type': 'application/json',
      };
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }

      print('➡️ Lấy thông tin cá nhân Bác sĩ: $urlStr');
      final response = await http.get(
        Uri.parse(urlStr),
        headers: headers,
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes));
        if (decoded is Map<String, dynamic>) {
          return decoded;
        }
        return null;
      }
      return null;
    } catch (e) {
      print('🔥 DoctorProfile Error: $e');
      return null;
    }
  }

  /// Lấy danh sách bác sĩ nổi bật (Top Rated) từ Backend
  Future<List<dynamic>> fetchTopRatedDoctors() async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/doctors/top-rated';
      final token = AuthService.accessToken;
      final Map<String, String> headers = {
        'Content-Type': 'application/json',
      };
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }

      print('➡️ Gọi API Bác sĩ nổi bật: $urlStr');
      final response = await http.get(
        Uri.parse(urlStr),
        headers: headers,
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      }
      return [];
    } catch (e) {
      print('🔥 fetchTopRatedDoctors Error: $e');
      return [];
    }
  }
}
