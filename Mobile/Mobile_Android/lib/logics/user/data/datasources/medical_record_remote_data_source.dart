import 'package:dio/dio.dart';
import '../../../../core/utils/api_config.dart';
import '../models/medical_record_model.dart';

abstract class MedicalRecordRemoteDataSource {
}

class MedicalRecordRemoteDataSourceImpl implements MedicalRecordRemoteDataSource {
  final Dio dio;
  MedicalRecordRemoteDataSourceImpl(this.dio);

}

