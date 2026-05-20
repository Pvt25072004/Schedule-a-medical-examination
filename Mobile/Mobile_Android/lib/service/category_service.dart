import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/api_config.dart';

class CategoryService {
  Future<List<dynamic>> fetchCategories() async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/categories');
      
      final response = await http.get(
        url,
        headers: {'Content-Type': 'application/json'},
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      } else {
        throw Exception('Lỗi tải danh mục: ${response.statusCode}');
      }
    } catch (e) {
      print('🔥 CategoryService Error: $e');
      return [];
    }
  }
}
