import 'package:dio/dio.dart';
import '../../../../utils/api_config.dart';
import '../models/appointment_model.dart';

abstract class AppointmentRemoteDataSource {
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

class AppointmentRemoteDataSourceImpl implements AppointmentRemoteDataSource {
  final Dio dio;
  AppointmentRemoteDataSourceImpl(this.dio);

  @override
  Future<int> getOrCreateUserId({
    required String email,
    required String fullName,
    required String phone,
  }) async {
    try {
      final response = await dio.post('${ApiConfig.baseUrl}/users');
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return data as int;
      } else {
        throw Exception('Failed to load');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
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
    try {
      final response = await dio.get('');
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return data as bool;
      } else {
        throw Exception('Failed to load');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
  @override
  Future<bool> requestRefund({
    required int appointmentId,
    required String bankName,
    required String bankAccount,
    required String accountName,
  }) async {
    try {
      final response = await dio.post('', data: payload);
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return data as bool;
      } else {
        throw Exception('Failed to load');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
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
    try {
      final response = await dio.put('', data: payload);
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return data as bool;
      } else {
        throw Exception('Failed to load');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}
