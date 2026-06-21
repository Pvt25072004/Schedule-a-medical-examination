import '../../domain/entities/service_package.dart';
import '../../domain/repositories/service_package_repository.dart';
import '../datasources/service_package_remote_data_source.dart';

class ServicePackageRepoImpl implements ServicePackageRepository {
  final ServicePackageRemoteDataSource remoteDataSource;

  ServicePackageRepoImpl(this.remoteDataSource);
}
