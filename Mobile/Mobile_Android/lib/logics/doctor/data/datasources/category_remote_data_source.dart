import 'package:dio/dio.dart';
import '../../../../core/utils/api_config.dart';
import '../models/category_model.dart';

abstract class CategoryRemoteDataSource {
}

class CategoryRemoteDataSourceImpl implements CategoryRemoteDataSource {
  final Dio dio;
  CategoryRemoteDataSourceImpl(this.dio);

}

