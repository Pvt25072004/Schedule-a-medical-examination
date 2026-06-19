import '../entities/email.dart';
import '../repositories/email_repository.dart';

class SendotpemailUseCase {
  final EmailRepository repository;
  SendotpemailUseCase(this.repository);

  Future<void> call(String email) async {
    return await repository.sendOtpEmail(email);
  }
}
