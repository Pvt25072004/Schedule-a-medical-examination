import '../../domain/entities/category.dart';
import '../../domain/repositories/category_repository.dart';
import '../datasources/category_remote_data_source.dart';

class CategoryRepoImpl implements CategoryRepository {
  final CategoryRemoteDataSource remoteDataSource;
  CategoryRepoImpl(this.remoteDataSource);

}
