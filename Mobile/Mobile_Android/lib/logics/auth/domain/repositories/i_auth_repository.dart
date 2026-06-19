import '../entities/user_entity.dart';

abstract class IAuthRepository {
  Future<UserEntity> login(String email, String password);
  Future<UserEntity> register(String email, String password, String fullName, String otp);
  Future<void> logout();
  Future<UserEntity?> getCurrentUser();
  Future<void> syncFcmToken();
}
