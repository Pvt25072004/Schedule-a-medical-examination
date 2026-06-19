import '../../domain/entities/payment.dart';
import '../../domain/repositories/payment_repository.dart';
import '../datasources/payment_remote_data_source.dart';

class PaymentRepoImpl implements PaymentRepository {
  final PaymentRemoteDataSource remoteDataSource;
  PaymentRepoImpl(this.remoteDataSource);

  @override
  Future<String?> createVnpayUrl({
    required int appointmentId,
    required double amount,
    required String orderInfo,
  }) async {
    return await remoteDataSource.createVnpayUrl(appointmentId, amount: amount, orderInfo: orderInfo, : );
  }
  @override
  Future<String?> createPayosUrl({
    required int appointmentId,
    required double amount,
    required String orderInfo,
  }) async {
    return await remoteDataSource.createPayosUrl(appointmentId, amount: amount, orderInfo: orderInfo, : );
  }
}
