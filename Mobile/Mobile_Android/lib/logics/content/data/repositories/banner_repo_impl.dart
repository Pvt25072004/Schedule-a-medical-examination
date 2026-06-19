import '../../domain/entities/banner.dart';
import '../../domain/repositories/banner_repository.dart';
import '../datasources/banner_remote_data_source.dart';

class BannerRepoImpl implements BannerRepository {
  final BannerRemoteDataSource remoteDataSource;
  BannerRepoImpl(this.remoteDataSource);

}
