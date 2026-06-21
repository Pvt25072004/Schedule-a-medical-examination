import 'package:dio/dio.dart';
import '../../../../core/utils/api_config.dart';
import '../models/social_model.dart';

abstract class SocialRemoteDataSource {
  Future<bool> likePost(int postId);
  Future<bool> checkLikeStatus(int postId);
  Future<bool> commentPost(int postId, String content);
}

class SocialRemoteDataSourceImpl implements SocialRemoteDataSource {
  final Dio dio;
  SocialRemoteDataSourceImpl(this.dio);

  @override
  Future<bool> likePost(int postId) async {
    try {
      final response = await dio.post('${ApiConfig.baseUrl}/likes/toggle/$postId');
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
  Future<bool> checkLikeStatus(int postId) async {
    try {
      final response = await dio.get('${ApiConfig.baseUrl}/likes/check/$postId');
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
  Future<bool> commentPost(int postId, String content) async {
    try {
      final response = await dio.post('${ApiConfig.baseUrl}/comments');
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

