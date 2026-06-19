import '../../domain/entities/city.dart';
import '../../domain/repositories/city_repository.dart';
import '../datasources/city_remote_data_source.dart';

class CityRepoImpl implements CityRepository {
  final CityRemoteDataSource remoteDataSource;

  CityRepoImpl(this.remoteDataSource);

  @override
  Future<List<City>> getCities() async {
    return await remoteDataSource.fetchCities();
  }
}
