import '../../domain/entities/medical_record.dart';
import '../../domain/repositories/medical_record_repository.dart';
import '../datasources/medical_record_remote_data_source.dart';

class MedicalRecordRepoImpl implements MedicalRecordRepository {
  final MedicalRecordRemoteDataSource remoteDataSource;
  MedicalRecordRepoImpl(this.remoteDataSource);

}
