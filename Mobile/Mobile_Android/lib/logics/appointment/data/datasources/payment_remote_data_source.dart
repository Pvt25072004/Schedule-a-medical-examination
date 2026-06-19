import 'package:dio/dio.dart';
import '../../../../utils/api_config.dart';
import '../models/payment_model.dart';

abstract class PaymentRemoteDataSource {
  Future<String?> createVnpayUrl({
    required int appointmentId,
    required double amount,
    required String orderInfo,
  });
  Future<String?> createPayosUrl({
    required int appointmentId,
    required double amount,
    required String orderInfo,
  });
}

class PaymentRemoteDataSourceImpl implements PaymentRemoteDataSource {
  final Dio dio;
  PaymentRemoteDataSourceImpl(this.dio);

  @override
  Future<String?> createVnpayUrl({
    required int appointmentId,
    required double amount,
    required String orderInfo,
  }) async {
    try {
      final response = await dio.post('${ApiConfig.baseUrl}/payments/vnpay/create-url', data: payload);
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return data as String?;
      } else {
        throw Exception('Failed to load');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
  @override
  Future<String?> createPayosUrl({
    required int appointmentId,
    required double amount,
    required String orderInfo,
  }) async {
    try {
      final response = await dio.post('${ApiConfig.baseUrl}/payments/payos/create-url', data: payload);
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return data as String?;
      } else {
        throw Exception('Failed to load');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}
