import 'package:dio/dio.dart';
import '../../../../core/utils/api_config.dart';
import '../models/appointment_model.dart';

abstract class AppointmentRemoteDataSource {
  Future<List<dynamic>> fetchUserAppointments(int userId);
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
  Future<List<dynamic>> fetchUserAppointments(int userId) async {
    try {
      final response = await dio.get('${ApiConfig.baseUrl}/appointments/user/$userId');
      if (response.statusCode == 200) {
        return response.data as List<dynamic>;
      } else {
        return [];
      }
    } catch (e) {
      print('🔥 fetchUserAppointments Error: $e');
      return [];
    }
  }

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
      final response = await dio.post('', data: {});
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
      final response = await dio.put('', data: {});
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

