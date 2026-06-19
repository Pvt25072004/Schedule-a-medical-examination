import 'package:dio/dio.dart';
import '../../../../utils/api_config.dart';
import '../models/service_package_model.dart';

abstract class ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}RemoteDataSource {
  // TODO: Add methods
}

class ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}RemoteDataSourceImpl implements ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}RemoteDataSource {
  final Dio dio;

  ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}RemoteDataSourceImpl(this.dio);
}
