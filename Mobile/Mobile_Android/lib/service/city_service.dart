import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/api_config.dart';

class CityService {
  Future<List<dynamic>> fetchCities() async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/cities');
      final response = await http.get(
        url,
        headers: {'Content-Type': 'application/json'},
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes));
        if (decoded is List) return decoded;
        if (decoded is Map && decoded.containsKey('data')) return decoded['data'] as List<dynamic>;
        return [];
      } else {
        return [];
      }
    } catch (e) {
      print('🔥 Lỗi fetchCities: $e');
      return [];
    }
  }
}
