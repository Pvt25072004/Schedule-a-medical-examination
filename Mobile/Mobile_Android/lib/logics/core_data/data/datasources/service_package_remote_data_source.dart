import 'package:dio/dio.dart';
import '../../../../core/utils/api_config.dart';
import '../models/service_package_model.dart';

abstract class ServicePackageRemoteDataSource {
  // TODO: Add methods
}

class ServicePackageRemoteDataSourceImpl implements ServicePackageRemoteDataSource {
  final Dio dio;

  ServicePackageRemoteDataSourceImpl(this.dio);
}

