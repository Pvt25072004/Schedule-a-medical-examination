import 'package:flutter/material.dart';
import '../domain/entities/appointment.dart';
import '../domain/usecases/getOrCreateUserId_usecase.dart';
import '../domain/usecases/updateAppointmentStatus_usecase.dart';
import '../domain/usecases/requestRefund_usecase.dart';
import '../domain/usecases/rescheduleAppointment_usecase.dart';

class AppointmentProvider extends ChangeNotifier {
  final GetorcreateuseridUseCase getOrCreateUserIdUseCase;
  final UpdateappointmentstatusUseCase updateAppointmentStatusUseCase;
  final RequestrefundUseCase requestRefundUseCase;
  final RescheduleappointmentUseCase rescheduleAppointmentUseCase;

  AppointmentProvider({
    required this.getOrCreateUserIdUseCase,
    required this.updateAppointmentStatusUseCase,
    required this.requestRefundUseCase,
    required this.rescheduleAppointmentUseCase,
  });

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> executeGetorcreateuserid({
    required String email,
    required String fullName,
    required String phone,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await getOrCreateUserIdUseCase(email, fullName: fullName, phone: phone, : );
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  Future<void> executeUpdateappointmentstatus({
    required int appointmentId,
    required String status,
    String? reason,
    String? bankName,
    String? bankAccount,
    String? accountName,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await updateAppointmentStatusUseCase(appointmentId, status: status, reason: reason, bankName: bankName, bankAccount: bankAccount, accountName: accountName, : );
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  Future<void> executeRequestrefund({
    required int appointmentId,
    required String bankName,
    required String bankAccount,
    required String accountName,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await requestRefundUseCase(appointmentId, bankName: bankName, bankAccount: bankAccount, accountName: accountName, : );
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  Future<void> executeRescheduleappointment({
    required int appointmentId,
    required int scheduleId,
    required int doctorId,
    required int hospitalId,
    required String appointmentDate,
    required String appointmentTime,
    String? doctorNameSnapshot,
    String? hospitalNameSnapshot,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await rescheduleAppointmentUseCase(appointmentId, scheduleId: scheduleId, doctorId: doctorId, hospitalId: hospitalId, appointmentDate: appointmentDate, appointmentTime: appointmentTime, doctorNameSnapshot: doctorNameSnapshot, hospitalNameSnapshot: hospitalNameSnapshot, : );
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
