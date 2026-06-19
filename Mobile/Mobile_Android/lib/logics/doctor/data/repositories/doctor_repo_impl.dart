import '../../domain/entities/doctor.dart';
import '../../domain/repositories/doctor_repository.dart';
import '../datasources/doctor_remote_data_source.dart';

class DoctorRepoImpl implements DoctorRepository {
  final DoctorRemoteDataSource remoteDataSource;
  DoctorRepoImpl(this.remoteDataSource);

  @override
  Future<bool> applyForDoctor(Map<String, dynamic> data) async {
    return await remoteDataSource.applyForDoctor(Map<String, data);
  }
  @override
  Future<bool> registerGuestDoctor(Map<String, dynamic> data) async {
    return await remoteDataSource.registerGuestDoctor(Map<String, data);
  }
}
