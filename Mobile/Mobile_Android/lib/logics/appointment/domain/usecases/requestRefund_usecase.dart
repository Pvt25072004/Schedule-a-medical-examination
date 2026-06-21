import '../entities/appointment.dart';
import '../repositories/appointment_repository.dart';

class RequestrefundUseCase {
  final AppointmentRepository repository;
  RequestrefundUseCase(this.repository);

  Future<bool> call({
    required int appointmentId,
    required String bankName,
    required String bankAccount,
    required String accountName,
  }) async {
    return await repository.requestRefund(appointmentId: appointmentId, bankName: bankName, bankAccount: bankAccount, accountName: accountName);
  }
}
