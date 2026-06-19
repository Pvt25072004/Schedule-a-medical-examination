import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../models/user_model.dart';

class AuthRemoteDataSource {
  final DioClient _dioClient = DioClient();

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dioClient.dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );
      
      if (response.statusCode == 200) {
        return response.data;
      } else {
        throw Exception('Login failed');
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? e.message);
    }
  }

  Future<Map<String, dynamic>> register(String email, String password, String fullName, String otp) async {
    try {
      final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
      final dummyPhone = '0${timestamp.substring(timestamp.length - 9)}';

      final response = await _dioClient.dio.post(
        '/auth/register',
        data: {
          'full_name': fullName.isNotEmpty ? fullName : email.split('@')[0],
          'email': email,
          'phone': dummyPhone,
          'password': password,
          'otp': otp,
          'date_of_birth': '2000-01-01',
          'gender': 'male',
        },
      );

      if (response.statusCode == 201) {
        return response.data;
      } else {
        throw Exception('Registration failed');
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? e.message);
    }
  }

  Future<void> updateFcmToken(String userId, String fcmToken) async {
    try {
      await _dioClient.dio.patch(
        '/users/$userId',
        data: {'fcm_token': fcmToken},
      );
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? e.message);
    }
  }
}
