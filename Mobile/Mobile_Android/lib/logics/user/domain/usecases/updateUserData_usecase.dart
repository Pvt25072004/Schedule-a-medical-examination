import '../repositories/user_repository.dart';

class UpdateUserDataUseCase {
  final UserRepository repository;

  UpdateUserDataUseCase(this.repository);

  Future<bool> call(String uid, Map<String, dynamic> updates) async {
    return await repository.updateUserData(uid, updates);
  }
}
