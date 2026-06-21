import '../repositories/user_repository.dart';

class GetUserDataUseCase {
  final UserRepository repository;

  GetUserDataUseCase(this.repository);

  Future<Map<String, dynamic>> call(String uid) async {
    return await repository.fetchUserData(uid);
  }
}
