import 'package:dio/dio.dart';
import '../core/utils/api_config.dart';
import '../core/network/dio_client.dart';

class MedicalRecordService {
  Dio get _dio => DioClient().dio;

  Future<List<dynamic>> fetchMyRecords() async {
    try {
      final response = await _dio.get('${ApiConfig.baseUrl}/medical-records/my-records');

      if (response.statusCode == 200) {
        return response.data as List<dynamic>;
      }
      return [];
    } catch (e) {
      print('🔥 Lỗi fetchMyRecords: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> fetchRecordByAppointment(int appointmentId) async {
    try {
      final response = await _dio.get('${ApiConfig.baseUrl}/medical-records/appointment/$appointmentId');

      if (response.statusCode == 200) {
        final data = response.data;
        if (data is List && data.isNotEmpty) {
           return data.first as Map<String, dynamic>;
        } else if (data is Map<String, dynamic>) {
           return data;
        }
      }
      return null;
    } catch (e) {
      print('🔥 Lỗi fetchRecordByAppointment: $e');
      return null;
    }
  }
}

