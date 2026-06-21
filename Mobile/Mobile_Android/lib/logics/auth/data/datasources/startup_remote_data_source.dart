import 'package:dio/dio.dart';
import '../../../../core/utils/api_config.dart';
import '../models/startup_model.dart';

abstract class StartupRemoteDataSource {
}

class StartupRemoteDataSourceImpl implements StartupRemoteDataSource {
  final Dio dio;
  StartupRemoteDataSourceImpl(this.dio);

}

