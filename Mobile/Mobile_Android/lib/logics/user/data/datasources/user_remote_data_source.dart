import 'package:dio/dio.dart';
import 'dart:convert';
import '../../../../core/utils/api_config.dart';

abstract class UserRemoteDataSource {
  Future<Map<String, dynamic>> fetchUserData(String uid);
  Future<bool> updateUserData(String uid, Map<String, dynamic> updates);
}

class UserRemoteDataSourceImpl implements UserRemoteDataSource {
  final Dio dio;

  UserRemoteDataSourceImpl(this.dio);

  @override
  Future<Map<String, dynamic>> fetchUserData(String uid) async {
    try {
      final response = await dio.get('${ApiConfig.baseUrl}/users/$uid');
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to load user data');
      }
    } catch (e) {
      throw Exception('Error fetching user data: $e');
    }
  }

  @override
  Future<bool> updateUserData(String uid, Map<String, dynamic> updates) async {
    try {
      final response = await dio.patch(
        '${ApiConfig.baseUrl}/users/$uid',
        data: updates,
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      throw Exception('Error updating user data: $e');
    }
  }
}
