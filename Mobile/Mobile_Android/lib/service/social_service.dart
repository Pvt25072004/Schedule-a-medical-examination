import 'package:dio/dio.dart';
import '../core/utils/api_config.dart';
import '../core/network/dio_client.dart';

class SocialService {
  Dio get _dio => DioClient().dio;
  Future<List<dynamic>> fetchPosts({int page = 1, int limit = 10}) async {
    try {
      final url = '${ApiConfig.baseUrl}/posts?page=$page&limit=$limit';
      
      final response = await _dio.get(url);

      if (response.statusCode == 200) {
        final decoded = response.data;
        if (decoded is List) return decoded;
        if (decoded is Map && decoded.containsKey('data')) {
          return decoded['data'] as List<dynamic>;
        }
      }
      return [];
    } catch (e) {
      print('🔥 Lỗi fetchPosts: $e');
      return [];
    }
  }

  Future<bool> likePost(int postId) async {
    try {
      final url = '${ApiConfig.baseUrl}/likes/toggle/$postId';
      final response = await _dio.post(url);

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('🔥 Lỗi likePost: $e');
      return false;
    }
  }

  Future<bool> checkLikeStatus(int postId) async {
    try {
      final url = '${ApiConfig.baseUrl}/likes/check/$postId';
      final response = await _dio.get(url);

      if (response.statusCode == 200) {
        final decoded = response.data;
        return decoded['is_liked'] == true;
      }
      return false;
    } catch (e) {
      print('🔥 Lỗi checkLikeStatus: $e');
      return false;
    }
  }

  Future<List<dynamic>> fetchComments(int postId) async {
    try {
      final url = '${ApiConfig.baseUrl}/comments/post/$postId';
      final response = await _dio.get(url);

      if (response.statusCode == 200) {
        return response.data as List<dynamic>;
      }
      return [];
    } catch (e) {
      print('🔥 Lỗi fetchComments: $e');
      return [];
    }
  }

  Future<bool> commentPost(int postId, String content) async {
    try {
      final url = '${ApiConfig.baseUrl}/comments';
      final response = await _dio.post(
        url,
        data: {
          'post_id': postId,
          'content': content
        },
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('🔥 Lỗi commentPost: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>?> fetchFanpageDetail(int hospitalId) async {
    try {
      final url = '${ApiConfig.baseUrl}/fanpages/hospital/$hospitalId';
      final response = await _dio.get(url);

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      print('🔥 Lỗi fetchFanpageDetail: $e');
      return null;
    }
  }

  Future<List<dynamic>> fetchPostsByFanpage(int hospitalId, {int page = 1, int limit = 10}) async {
    try {
      final url = '${ApiConfig.baseUrl}/posts/hospital/$hospitalId?page=$page&limit=$limit';
      final response = await _dio.get(url);

      if (response.statusCode == 200) {
        final decoded = response.data;
        if (decoded is List) return decoded;
        if (decoded is Map && decoded.containsKey('data')) {
          return decoded['data'] as List<dynamic>;
        }
      }
      return [];
    } catch (e) {
      print('🔥 Lỗi fetchPostsByFanpage: $e');
      return [];
    }
  }
}

