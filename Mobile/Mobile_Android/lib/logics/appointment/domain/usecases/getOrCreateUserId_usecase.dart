import '../entities/appointment.dart';
import '../repositories/appointment_repository.dart';

class GetorcreateuseridUseCase {
  final AppointmentRepository repository;
  GetorcreateuseridUseCase(this.repository);

  Future<int> call({
    required String email,
    required String fullName,
    required String phone,
  }) async {
    return await repository.getOrCreateUserId(email: email, fullName: fullName, phone: phone);
  }
}
