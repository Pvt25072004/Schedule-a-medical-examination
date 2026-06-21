abstract class UserRepository {
  Future<Map<String, dynamic>> fetchUserData(String uid);
  Future<bool> updateUserData(String uid, Map<String, dynamic> updates);
}
