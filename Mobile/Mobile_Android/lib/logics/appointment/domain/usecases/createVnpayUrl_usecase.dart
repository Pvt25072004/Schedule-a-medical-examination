import '../entities/payment.dart';
import '../repositories/payment_repository.dart';

class CreatevnpayurlUseCase {
  final PaymentRepository repository;
  CreatevnpayurlUseCase(this.repository);

  Future<String?> call({
    required int appointmentId,
    required double amount,
    required String orderInfo,
  }) async {
    return await repository.createVnpayUrl(appointmentId, amount: amount, orderInfo: orderInfo, : );
  }
}
