import '../../domain/entities/service_package.dart';
import '../../domain/repositories/service_package_repository.dart';
import '../datasources/service_package_remote_data_source.dart';

class ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}RepoImpl implements ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}Repository {
  final ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}RemoteDataSource remoteDataSource;

  ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}RepoImpl(this.remoteDataSource);
}
