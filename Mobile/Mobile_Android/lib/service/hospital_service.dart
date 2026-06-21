import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/utils/api_config.dart';

class HospitalService {
  Future<List<dynamic>> fetchHospitals({String? city}) async {
    try {
      String urlStr = '${ApiConfig.baseUrl}/hospitals';
      if (city != null && city.isNotEmpty) {
        urlStr += '?city=${Uri.encodeComponent(city)}';
      }
      
      final response = await http.get(
        Uri.parse(urlStr),
        headers: {'Content-Type': 'application/json'},
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      } else {
        throw Exception('Lỗi tải danh sách bệnh viện: ${response.statusCode}');
      }
    } catch (e) {
      print('🔥 HospitalService Error: $e');
      // Trả về mảng rỗng khi lỗi kết nối để UI không crash
      return [];
    }
  }
}

