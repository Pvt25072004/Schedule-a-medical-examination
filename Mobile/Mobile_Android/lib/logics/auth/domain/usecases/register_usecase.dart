import '../entities/user_entity.dart';
import '../repositories/i_auth_repository.dart';

class RegisterUseCase {
  final IAuthRepository repository;

  RegisterUseCase(this.repository);

  Future<UserEntity> call(String email, String password, String fullName, String otp) async {
    return await repository.register(email, password, fullName, otp);
  }
}
