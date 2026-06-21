import 'dart:convert';
import 'package:dio/dio.dart';
import '../core/utils/api_config.dart';
import '../core/network/dio_client.dart';

class PaymentService {
  Dio get _dio => DioClient().dio;

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

      final response = await _dio.post(
        '${ApiConfig.baseUrl}/payments/vnpay/create-url',
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return data['url'] as String?;
      } else {
        print('🔥 Lỗi từ backend VNPAY: ${response.data}');
        return null;
      }
    } catch (e) {
      print('🔥 PaymentService Error (VNPAY): $e');
      return null;
    }
  }

  Future<String?> createPayosUrl({
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

      print('🚀 Gọi API tạo URL PayOS: ${jsonEncode(payload)}');

      final response = await _dio.post(
        '${ApiConfig.baseUrl}/payments/payos/create-url',
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return data['url'] as String?;
      } else {
        print('🔥 Lỗi từ backend PayOS: ${response.data}');
        return null;
      }
    } catch (e) {
      print('🔥 PaymentService Error (PayOS): $e');
      return null;
    }
  }

  /// Lấy thông tin thanh toán của lịch hẹn
  Future<Map<String, dynamic>?> checkPaymentStatus(int appointmentId) async {
    try {
      final response = await _dio.get(
        '${ApiConfig.baseUrl}/payments/appointment/$appointmentId',
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      print('🔥 Check Payment Error: $e');
      return null;
    }
  }
}

