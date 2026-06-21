import 'package:dio/dio.dart';
import '../../../../core/utils/api_config.dart';
import '../models/doctor_model.dart';

abstract class DoctorRemoteDataSource {
  Future<bool> applyForDoctor(Map<String, dynamic> data);
  Future<bool> registerGuestDoctor(Map<String, dynamic> data);
}

class DoctorRemoteDataSourceImpl implements DoctorRemoteDataSource {
  final Dio dio;
  DoctorRemoteDataSourceImpl(this.dio);

  @override
  Future<bool> applyForDoctor(Map<String, dynamic> data) async {
    try {
      final response = await dio.post('', data: data);
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
  Future<bool> registerGuestDoctor(Map<String, dynamic> data) async {
    try {
      final response = await dio.post('', data: data);
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

