import '../entities/payment.dart';
import '../repositories/payment_repository.dart';

class CreatepayosurlUseCase {
  final PaymentRepository repository;
  CreatepayosurlUseCase(this.repository);

  Future<String?> call({
    required int appointmentId,
    required double amount,
    required String orderInfo,
  }) async {
    return await repository.createPayosUrl(appointmentId, amount: amount, orderInfo: orderInfo, : );
  }
}
