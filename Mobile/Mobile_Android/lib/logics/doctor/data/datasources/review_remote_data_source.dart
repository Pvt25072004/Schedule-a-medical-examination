import 'package:dio/dio.dart';
import '../../../../core/utils/api_config.dart';
import '../models/review_model.dart';

abstract class ReviewRemoteDataSource {
  Future<bool> createReview({
    required int userId,
    required int doctorId,
    required int appointmentId,
    required int rating,
    String? comment,
  });
  Future<bool> updateReview({
    required int reviewId,
    required int rating,
    String? comment,
  });
}

class ReviewRemoteDataSourceImpl implements ReviewRemoteDataSource {
  final Dio dio;
  ReviewRemoteDataSourceImpl(this.dio);

  @override
  Future<bool> createReview({
    required int userId,
    required int doctorId,
    required int appointmentId,
    required int rating,
    String? comment,
  }) async {
    try {
      final response = await dio.post('${ApiConfig.baseUrl}/reviews');
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return data as bool;
      } else {
        throw Exception('Failed to load');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
  @override
  Future<bool> updateReview({
    required int reviewId,
    required int rating,
    String? comment,
  }) async {
    try {
      final response = await dio.get('${ApiConfig.baseUrl}/reviews/$reviewId');
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return data as bool;
      } else {
        throw Exception('Failed to load');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}

