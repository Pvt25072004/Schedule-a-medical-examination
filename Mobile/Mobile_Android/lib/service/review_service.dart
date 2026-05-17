import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import '../utils/api_config.dart';

class ReviewService {
  /// Tạo đánh giá mới cho bác sĩ
  Future<bool> createReview({
    required int userId,
    required int doctorId,
    required int appointmentId,
    required int rating,
    String? comment,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/reviews');
      final token = AuthService.accessToken;

      final Map<String, String> headers = {
        'Content-Type': 'application/json',
      };
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }

      final body = jsonEncode({
        'user_id': userId,
        'doctor_id': doctorId,
        'appointment_id': appointmentId,
        'rating': rating,
        'comment': comment ?? '',
      });

      print('➡️ Gửi Đánh giá lên API: $url (Body: $body)');
      final response = await http.post(
        url,
        headers: headers,
        body: body,
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        print('✅ Đánh giá thành công!');
        return true;
      } else {
        final errMsg = jsonDecode(utf8.decode(response.bodyBytes))['message'] ?? 'Lỗi máy chủ';
        print('❌ Lỗi tạo đánh giá (${response.statusCode}): $errMsg');
        return false;
      }
    } catch (e) {
      print('🔥 ReviewService createReview Error: $e');
      return false;
    }
  }

  /// Lấy danh sách các đánh giá của Bác sĩ
  Future<List<dynamic>> fetchDoctorReviews(int doctorId) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/reviews/doctor/$doctorId');
      final response = await http.get(url).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      }
      return [];
    } catch (e) {
      print('🔥 ReviewService fetchDoctorReviews Error: $e');
      return [];
    }
  }
  /// Cập nhật đánh giá
  Future<bool> updateReview({
    required int reviewId,
    required int rating,
    String? comment,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/reviews/$reviewId');
      final token = AuthService.accessToken;

      final Map<String, String> headers = {
        'Content-Type': 'application/json',
      };
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }

      final body = jsonEncode({
        'rating': rating,
        'comment': comment ?? '',
      });

      print('➡️ Cập nhật Đánh giá: $url (Body: $body)');
      final response = await http.patch(
        url,
        headers: headers,
        body: body,
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        print('✅ Cập nhật đánh giá thành công!');
        return true;
      } else {
        print('❌ Lỗi cập nhật đánh giá (${response.statusCode})');
        return false;
      }
    } catch (e) {
      print('🔥 ReviewService updateReview Error: $e');
      return false;
    }
  }
}
