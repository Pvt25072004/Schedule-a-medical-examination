import 'package:dio/dio.dart';
import '../../../../utils/api_config.dart';
import '../models/schedule_model.dart';

abstract class ScheduleRemoteDataSource {
}

class ScheduleRemoteDataSourceImpl implements ScheduleRemoteDataSource {
  final Dio dio;
  ScheduleRemoteDataSourceImpl(this.dio);

}
