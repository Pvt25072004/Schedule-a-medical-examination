import '../entities/email.dart';

abstract class EmailRepository {
  Future<void> sendOtpEmail(String email);
}
