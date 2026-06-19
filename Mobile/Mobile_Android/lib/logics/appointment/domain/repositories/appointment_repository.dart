import '../entities/appointment.dart';

abstract class AppointmentRepository {
  Future<int> getOrCreateUserId({
    required String email,
    required String fullName,
    required String phone,
  });
  Future<bool> updateAppointmentStatus({
    required int appointmentId,
    required String status,
    String? reason,
    String? bankName,
    String? bankAccount,
    String? accountName,
  });
  Future<bool> requestRefund({
    required int appointmentId,
    required String bankName,
    required String bankAccount,
    required String accountName,
  });
  Future<bool> rescheduleAppointment({
    required int appointmentId,
    required int scheduleId,
    required int doctorId,
    required int hospitalId,
    required String appointmentDate,
    required String appointmentTime,
    String? doctorNameSnapshot,
    String? hospitalNameSnapshot,
  });
}
