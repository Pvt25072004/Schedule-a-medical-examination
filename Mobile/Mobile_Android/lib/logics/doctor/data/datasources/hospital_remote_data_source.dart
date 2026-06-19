import 'package:dio/dio.dart';
import '../../../../utils/api_config.dart';
import '../models/hospital_model.dart';

abstract class HospitalRemoteDataSource {
}

class HospitalRemoteDataSourceImpl implements HospitalRemoteDataSource {
  final Dio dio;
  HospitalRemoteDataSourceImpl(this.dio);

}
