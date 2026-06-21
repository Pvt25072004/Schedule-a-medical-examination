import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/utils/api_config.dart';

class NewsService {
  /// Lấy danh sách tin tức (báo) với phân trang
  static Future<List<dynamic>> fetchNews({int page = 1, int limit = 10}) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/news?page=$page&limit=$limit');
      
      final response = await http.get(
        url,
        headers: {'Content-Type': 'application/json'},
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes));
        if (decoded is List) return decoded;
        // Nếu backend trả về object { data: [], total: ... }
        if (decoded is Map && decoded.containsKey('data')) {
          return decoded['data'] as List<dynamic>;
        }
        return [];
      } else {
        throw Exception('Failed to load news');
      }
    } catch (e) {
      print('Lỗi gọi API News: $e');
      throw e;
    }
  }
}

