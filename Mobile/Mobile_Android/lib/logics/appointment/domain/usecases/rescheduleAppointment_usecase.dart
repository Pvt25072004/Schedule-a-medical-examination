import '../entities/appointment.dart';
import '../repositories/appointment_repository.dart';

class RescheduleappointmentUseCase {
  final AppointmentRepository repository;
  RescheduleappointmentUseCase(this.repository);

  Future<bool> call({
    required int appointmentId,
    required int scheduleId,
    required int doctorId,
    required int hospitalId,
    required String appointmentDate,
    required String appointmentTime,
    String? doctorNameSnapshot,
    String? hospitalNameSnapshot,
  }) async {
    return await repository.rescheduleAppointment(appointmentId: appointmentId, scheduleId: scheduleId, doctorId: doctorId, hospitalId: hospitalId, appointmentDate: appointmentDate, appointmentTime: appointmentTime, doctorNameSnapshot: doctorNameSnapshot, hospitalNameSnapshot: hospitalNameSnapshot);
  }
}
