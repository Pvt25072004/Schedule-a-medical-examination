import '../entities/city.dart';
import '../repositories/city_repository.dart';

class GetCitiesUseCase {
  final CityRepository repository;

  GetCitiesUseCase(this.repository);

  Future<List<City>> call() async {
    return await repository.getCities();
  }
}
