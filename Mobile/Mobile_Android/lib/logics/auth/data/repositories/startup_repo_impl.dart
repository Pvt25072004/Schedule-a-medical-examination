import '../../domain/entities/startup.dart';
import '../../domain/repositories/startup_repository.dart';
import '../datasources/startup_remote_data_source.dart';

class StartupRepoImpl implements StartupRepository {
  final StartupRemoteDataSource remoteDataSource;
  StartupRepoImpl(this.remoteDataSource);

}
