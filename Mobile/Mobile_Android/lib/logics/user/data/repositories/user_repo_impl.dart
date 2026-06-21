import '../../domain/repositories/user_repository.dart';
import '../datasources/user_remote_data_source.dart';

class UserRepoImpl implements UserRepository {
  final UserRemoteDataSource remoteDataSource;

  UserRepoImpl(this.remoteDataSource);

  @override
  Future<Map<String, dynamic>> fetchUserData(String uid) async {
    return await remoteDataSource.fetchUserData(uid);
  }

  @override
  Future<bool> updateUserData(String uid, Map<String, dynamic> updates) async {
    return await remoteDataSource.updateUserData(uid, updates);
  }
}
