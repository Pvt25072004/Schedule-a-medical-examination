import 'package:dio/dio.dart';
import '../../../../core/utils/api_config.dart';
import '../models/email_model.dart';

abstract class EmailRemoteDataSource {
  Future<void> sendOtpEmail(String email);
}

class EmailRemoteDataSourceImpl implements EmailRemoteDataSource {
  final Dio dio;
  EmailRemoteDataSourceImpl(this.dio);

  @override
  Future<void> sendOtpEmail(String email) async {
    try {
      final response = await dio.post('${ApiConfig.baseUrl}/auth/send-registration-otp', data: {'email': email});
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return;
      } else {
        throw Exception('Failed to load');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}

