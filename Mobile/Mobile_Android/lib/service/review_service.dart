import 'package:dio/dio.dart';
import '../core/utils/api_config.dart';
import '../core/network/dio_client.dart';

class ReviewService {
  Dio get _dio => DioClient().dio;
  /// Tạo đánh giá mới cho bác sĩ
  Future<bool> createReview({
    required int userId,
    required int doctorId,
    required int appointmentId,
    required int rating,
    String? comment,
  }) async {
    try {
      final url = '${ApiConfig.baseUrl}/reviews';
      
      final body = {
        'user_id': userId,
        'doctor_id': doctorId,
        'appointment_id': appointmentId,
        'rating': rating,
        'comment': comment ?? '',
      };

      print('➡️ Gửi Đánh giá lên API: $url (Body: $body)');
      final response = await _dio.post(url, data: body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        print('✅ Đánh giá thành công!');
        return true;
      } else {
        final errMsg = response.data['message'] ?? 'Lỗi máy chủ';
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
      final url = '${ApiConfig.baseUrl}/reviews/doctor/$doctorId';
      final response = await _dio.get(url);

      if (response.statusCode == 200) {
        return response.data as List<dynamic>;
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
      final url = '${ApiConfig.baseUrl}/reviews/$reviewId';
      
      final body = {
        'rating': rating,
        'comment': comment ?? '',
      };

      print('➡️ Cập nhật Đánh giá: $url (Body: $body)');
      final response = await _dio.patch(url, data: body);

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

