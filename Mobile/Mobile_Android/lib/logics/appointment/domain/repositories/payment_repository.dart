import '../entities/payment.dart';

abstract class PaymentRepository {
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
