import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import '../utils/api_config.dart';

class PaymentService {
  Map<String, String> _getHeaders() {
    final token = AuthService.accessToken;
    final headers = {'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<String?> createVnpayUrl({
    required int appointmentId,
    required double amount,
    required String orderInfo,
  }) async {
    try {
      final payload = {
        'appointment_id': appointmentId,
        'amount': amount,
        'orderInfo': orderInfo,
      };

      print('🚀 Gọi API tạo URL VNPAY: ${jsonEncode(payload)}');

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/payments/vnpay/create-url'),
        headers: _getHeaders(),
        body: jsonEncode(payload),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        return data['url'] as String?;
      } else {
        print('🔥 Lỗi từ backend VNPAY: ${response.body}');
        return null;
      }
    } catch (e) {
      print('🔥 PaymentService Error (VNPAY): $e');
      return null;
    }
  }

  /// Lấy thông tin thanh toán của lịch hẹn
  Future<Map<String, dynamic>?> checkPaymentStatus(int appointmentId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/payments/appointment/$appointmentId'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      }
      return null;
    } catch (e) {
      print('🔥 Check Payment Error: $e');
      return null;
    }
  }
}
