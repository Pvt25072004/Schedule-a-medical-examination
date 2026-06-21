import 'package:flutter/material.dart';
import '../domain/entities/appointment.dart';
import '../domain/usecases/getOrCreateUserId_usecase.dart';
import '../domain/usecases/updateAppointmentStatus_usecase.dart';
import '../domain/usecases/requestRefund_usecase.dart';
import '../domain/usecases/rescheduleAppointment_usecase.dart';
import '../domain/usecases/fetchUserAppointments_usecase.dart';

class AppointmentProvider extends ChangeNotifier {
  final GetorcreateuseridUseCase getOrCreateUserIdUseCase;
  final UpdateappointmentstatusUseCase updateAppointmentStatusUseCase;
  final RequestrefundUseCase requestRefundUseCase;
  final RescheduleappointmentUseCase rescheduleAppointmentUseCase;
  final FetchUserAppointmentsUseCase fetchUserAppointmentsUseCase;

  AppointmentProvider({
    required this.getOrCreateUserIdUseCase,
    required this.updateAppointmentStatusUseCase,
    required this.requestRefundUseCase,
    required this.rescheduleAppointmentUseCase,
    required this.fetchUserAppointmentsUseCase,
  });

  bool _isLoading = false;
  String? _errorMessage;
  List<dynamic> _userAppointments = [];

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<dynamic> get userAppointments => _userAppointments;

  Future<void> fetchUserAppointments(int userId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _userAppointments = await fetchUserAppointmentsUseCase(userId);
    } catch (e) {
      _errorMessage = e.toString();
      _userAppointments = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> executeGetorcreateuserid({
    required String email,
    required String fullName,
    required String phone,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await getOrCreateUserIdUseCase(email: email, fullName: fullName, phone: phone);
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  Future<bool> executeUpdateappointmentstatus({
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
      final result = await updateAppointmentStatusUseCase(appointmentId: appointmentId, status: status, reason: reason, bankName: bankName, bankAccount: bankAccount, accountName: accountName);
      return result;
    } catch(e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  Future<bool> executeRequestrefund({
    required int appointmentId,
    required String bankName,
    required String bankAccount,
    required String accountName,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await requestRefundUseCase(appointmentId: appointmentId, bankName: bankName, bankAccount: bankAccount, accountName: accountName);
      return result;
    } catch(e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  Future<bool> executeRescheduleappointment({
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
      final result = await rescheduleAppointmentUseCase(appointmentId: appointmentId, scheduleId: scheduleId, doctorId: doctorId, hospitalId: hospitalId, appointmentDate: appointmentDate, appointmentTime: appointmentTime, doctorNameSnapshot: doctorNameSnapshot, hospitalNameSnapshot: hospitalNameSnapshot);
      return result;
    } catch(e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
