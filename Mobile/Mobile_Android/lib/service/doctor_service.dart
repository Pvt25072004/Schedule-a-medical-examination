import 'package:dio/dio.dart';
import '../core/utils/api_config.dart';
import '../core/network/dio_client.dart';

class DoctorService {
  Dio get _dio => DioClient().dio;

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
      
      print('➡️ Gọi API Danh sách Bác sĩ: $urlStr');

      final response = await _dio.get(urlStr);

      if (response.statusCode == 200) {
        final decoded = response.data;
        if (decoded is List) return decoded;
        if (decoded is Map && decoded.containsKey('data')) return decoded['data'] as List<dynamic>;
        return [];
      } else {
        throw Exception('Lỗi tải danh sách bác sĩ: ${response.statusCode}');
      }
    } catch (e) {
      print('🔥 DoctorService Error: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> fetchDoctorProfile() async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/doctors/me';
      
      print('➡️ Lấy thông tin cá nhân Bác sĩ: $urlStr');
      final response = await _dio.get(urlStr);

      if (response.statusCode == 200) {
        final decoded = response.data;
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

  Future<List<dynamic>> fetchTopRatedDoctors() async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/doctors/top-rated';
      
      print('➡️ Gọi API Bác sĩ nổi bật: $urlStr');
      final response = await _dio.get(urlStr);

      if (response.statusCode == 200) {
        final decoded = response.data;
        if (decoded is List) return decoded;
        if (decoded is Map && decoded.containsKey('data')) return decoded['data'] as List<dynamic>;
        return [];
      }
      return [];
    } catch (e) {
      print('🔥 fetchTopRatedDoctors Error: $e');
      return [];
    }
  }
  Future<bool> applyForDoctor(Map<String, dynamic> data) async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/doctors/applications';
      
      final response = await _dio.post(urlStr, data: data);

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('🔥 applyForDoctor Error: $e');
      return false;
    }
  }

  Future<List<dynamic>> fetchMyApplications() async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/doctors/me/applications';
      
      final response = await _dio.get(urlStr);

      if (response.statusCode == 200) {
        return response.data as List<dynamic>;
      }
      return [];
    } catch (e) {
      print('🔥 fetchMyApplications Error: $e');
      return [];
    }
  }

  Future<bool> registerGuestDoctor(Map<String, dynamic> data) async {
    try {
      final urlStr = '${ApiConfig.baseUrl}/doctors/register-guest';
      
      final response = await _dio.post(urlStr, data: data);

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('🔥 registerGuestDoctor Error: $e');
      return false;
    }
  }
}

