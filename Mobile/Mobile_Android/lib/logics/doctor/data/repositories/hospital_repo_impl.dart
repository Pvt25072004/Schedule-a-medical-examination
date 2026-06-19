import '../../domain/entities/hospital.dart';
import '../../domain/repositories/hospital_repository.dart';
import '../datasources/hospital_remote_data_source.dart';

class HospitalRepoImpl implements HospitalRepository {
  final HospitalRemoteDataSource remoteDataSource;
  HospitalRepoImpl(this.remoteDataSource);

}
