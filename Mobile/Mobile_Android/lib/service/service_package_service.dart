import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/api_config.dart';

class ServicePackageService {
  Future<List<dynamic>> fetchPackages() async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/service-packages');
      final response = await http.get(
        url,
        headers: {'Content-Type': 'application/json'},
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      } else {
        return [];
      }
    } catch (e) {
      print('🔥 Lỗi fetchPackages: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> fetchPackageById(int id) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/service-packages/$id');
      final response = await http.get(
        url,
        headers: {'Content-Type': 'application/json'},
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
      } else {
        return null;
      }
    } catch (e) {
      print('🔥 Lỗi fetchPackageById: $e');
      return null;
    }
  }
}
