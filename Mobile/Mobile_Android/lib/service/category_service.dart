import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/api_config.dart';

class CategoryService {
  Future<List<dynamic>> fetchCategories({int? hospitalId}) async {
    try {
      final urlStr = hospitalId != null 
          ? '${ApiConfig.baseUrl}/categories?hospitalId=$hospitalId' 
          : '${ApiConfig.baseUrl}/categories';
      final url = Uri.parse(urlStr);
      
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
