import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/utils/api_config.dart';

class BannerService {
  static Future<List<dynamic>> fetchBanners() async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/hospital-admin/banners/active');
      final response = await http.get(url).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes));
        if (decoded is List) return decoded;
        if (decoded is Map && decoded.containsKey('data')) {
          return decoded['data'] as List<dynamic>;
        }
      }
      return [];
    } catch (e) {
      print('🔥 Lỗi fetchBanners: $e');
      return [];
    }
  }
}

