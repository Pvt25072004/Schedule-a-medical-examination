import '../repositories/appointment_repository.dart';

class FetchUserAppointmentsUseCase {
  final AppointmentRepository repository;

  FetchUserAppointmentsUseCase(this.repository);

  Future<List<dynamic>> call(int userId) async {
    return await repository.fetchUserAppointments(userId);
  }
}
