import '../entities/appointment.dart';
import '../repositories/appointment_repository.dart';

class UpdateappointmentstatusUseCase {
  final AppointmentRepository repository;
  UpdateappointmentstatusUseCase(this.repository);

  Future<bool> call({
    required int appointmentId,
    required String status,
    String? reason,
    String? bankName,
    String? bankAccount,
    String? accountName,
  }) async {
    return await repository.updateAppointmentStatus(appointmentId: appointmentId, status: status, reason: reason, bankName: bankName, bankAccount: bankAccount, accountName: accountName);
  }
}
