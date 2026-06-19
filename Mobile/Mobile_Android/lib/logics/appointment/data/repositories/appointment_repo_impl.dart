import '../../domain/entities/appointment.dart';
import '../../domain/repositories/appointment_repository.dart';
import '../datasources/appointment_remote_data_source.dart';

class AppointmentRepoImpl implements AppointmentRepository {
  final AppointmentRemoteDataSource remoteDataSource;
  AppointmentRepoImpl(this.remoteDataSource);

  @override
  Future<int> getOrCreateUserId({
    required String email,
    required String fullName,
    required String phone,
  }) async {
    return await remoteDataSource.getOrCreateUserId(email, fullName: fullName, phone: phone, : );
  }
  @override
  Future<bool> updateAppointmentStatus({
    required int appointmentId,
    required String status,
    String? reason,
    String? bankName,
    String? bankAccount,
    String? accountName,
  }) async {
    return await remoteDataSource.updateAppointmentStatus(appointmentId, status: status, reason: reason, bankName: bankName, bankAccount: bankAccount, accountName: accountName, : );
  }
  @override
  Future<bool> requestRefund({
    required int appointmentId,
    required String bankName,
    required String bankAccount,
    required String accountName,
  }) async {
    return await remoteDataSource.requestRefund(appointmentId, bankName: bankName, bankAccount: bankAccount, accountName: accountName, : );
  }
  @override
  Future<bool> rescheduleAppointment({
    required int appointmentId,
    required int scheduleId,
    required int doctorId,
    required int hospitalId,
    required String appointmentDate,
    required String appointmentTime,
    String? doctorNameSnapshot,
    String? hospitalNameSnapshot,
  }) async {
    return await remoteDataSource.rescheduleAppointment(appointmentId, scheduleId: scheduleId, doctorId: doctorId, hospitalId: hospitalId, appointmentDate: appointmentDate, appointmentTime: appointmentTime, doctorNameSnapshot: doctorNameSnapshot, hospitalNameSnapshot: hospitalNameSnapshot, : );
  }
}
