import '../../domain/entities/email.dart';
import '../../domain/repositories/email_repository.dart';
import '../datasources/email_remote_data_source.dart';

class EmailRepoImpl implements EmailRepository {
  final EmailRemoteDataSource remoteDataSource;
  EmailRepoImpl(this.remoteDataSource);

  @override
  Future<void> sendOtpEmail(String email) async {
    return await remoteDataSource.sendOtpEmail(email);
  }
}
