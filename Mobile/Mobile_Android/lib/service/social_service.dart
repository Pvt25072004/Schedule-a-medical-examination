import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/api_config.dart';
import 'auth_service.dart';

class SocialService {
  Future<List<dynamic>> fetchPosts({int page = 1, int limit = 10}) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/posts?page=$page&limit=$limit');
      final headers = <String, String>{};
      final token = AuthService.accessToken;
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
      final response = await http.get(url, headers: headers).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes));
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
      final token = AuthService.accessToken;
      if (token == null) return false;

      final url = Uri.parse('${ApiConfig.baseUrl}/likes/toggle/$postId');
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(ApiConfig.timeout);

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('🔥 Lỗi likePost: $e');
      return false;
    }
  }

  Future<bool> checkLikeStatus(int postId) async {
    try {
      final token = AuthService.accessToken;
      if (token == null) return false;

      final url = Uri.parse('${ApiConfig.baseUrl}/likes/check/$postId');
      final response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $token',
        },
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes));
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
      final url = Uri.parse('${ApiConfig.baseUrl}/comments/post/$postId');
      final response = await http.get(url).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      }
      return [];
    } catch (e) {
      print('🔥 Lỗi fetchComments: $e');
      return [];
    }
  }

  Future<bool> commentPost(int postId, String content) async {
    try {
      final token = AuthService.accessToken;
      if (token == null) return false;

      final url = Uri.parse('${ApiConfig.baseUrl}/comments');
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'post_id': postId,
          'content': content
        }),
      ).timeout(ApiConfig.timeout);

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('🔥 Lỗi commentPost: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>?> fetchFanpageDetail(int hospitalId) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/fanpages/hospital/$hospitalId');
      final response = await http.get(url).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      print('🔥 Lỗi fetchFanpageDetail: $e');
      return null;
    }
  }

  Future<List<dynamic>> fetchPostsByFanpage(int hospitalId, {int page = 1, int limit = 10}) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/posts/hospital/$hospitalId?page=$page&limit=$limit');
      final headers = <String, String>{};
      final token = AuthService.accessToken;
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
      final response = await http.get(url, headers: headers).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes));
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
