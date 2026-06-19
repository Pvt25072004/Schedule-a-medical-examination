import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/i_auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';
import '../models/user_model.dart';

class AuthRepoImpl implements IAuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepoImpl(this.remoteDataSource);

  @override
  Future<UserEntity> login(String email, String password) async {
    final response = await remoteDataSource.login(email, password);
    final userModel = UserModel.fromJson(response['user']);
    final token = response['access_token'];

    await _saveLocalSession(userModel, token);
    return userModel;
  }

  @override
  Future<UserEntity> register(String email, String password, String fullName, String otp) async {
    final response = await remoteDataSource.register(email, password, fullName, otp);
    final userModel = UserModel.fromJson(response['user']);
    final token = response['access_token'];

    await _saveLocalSession(userModel, token);
    return userModel;
  }

  @override
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('app_user');
    
    if (userJson != null) {
      final user = UserModel.fromJson(jsonDecode(userJson));
      try {
        await remoteDataSource.updateFcmToken(user.id, '');
      } catch (_) {}
    }

    await prefs.remove('app_user');
    await prefs.remove('auth_token'); // Make sure to match the key used in DioClient
  }

  @override
  Future<UserEntity?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('app_user');
    if (userJson != null) {
      return UserModel.fromJson(jsonDecode(userJson));
    }
    return null;
  }

  @override
  Future<void> syncFcmToken() async {
    final user = await getCurrentUser();
    if (user != null) {
      try {
        final fcmToken = await FirebaseMessaging.instance.getToken();
        if (fcmToken != null) {
          await remoteDataSource.updateFcmToken(user.id, fcmToken);
        }
      } catch (_) {}
    }
  }

  Future<void> _saveLocalSession(UserModel user, String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('app_user', jsonEncode(user.toJson()));
    await prefs.setString('auth_token', token); // Key must match DioClient header retrieval

    await syncFcmToken();
  }
}
