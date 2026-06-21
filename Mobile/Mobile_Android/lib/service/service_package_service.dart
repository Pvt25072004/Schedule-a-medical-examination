import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/utils/api_config.dart';

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

  Future<List<dynamic>> fetchPopularPackages() async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/service-packages');
      final response = await http.get(
        url,
        headers: {'Content-Type': 'application/json'},
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes));
        List<dynamic> allPackages = [];
        if (decoded is List) allPackages = decoded;
        else if (decoded is Map && decoded.containsKey('data')) allPackages = decoded['data'] as List<dynamic>;
        
        // Sắp xếp theo số người đặt nhiều nhất (nếu có trường booking_count, nếu không thì giữ nguyên)
        allPackages.sort((a, b) {
          final countA = a['booking_count'] ?? a['total_bookings'] ?? 0;
          final countB = b['booking_count'] ?? b['total_bookings'] ?? 0;
          return (countB as num).compareTo(countA as num);
        });
        
        return allPackages.take(6).toList();
      } else {
        return [];
      }
    } catch (e) {
      print('🔥 Lỗi fetchPopularPackages: $e');
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

