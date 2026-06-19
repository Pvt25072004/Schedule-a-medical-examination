import '../../domain/entities/schedule.dart';
import '../../domain/repositories/schedule_repository.dart';
import '../datasources/schedule_remote_data_source.dart';

class ScheduleRepoImpl implements ScheduleRepository {
  final ScheduleRemoteDataSource remoteDataSource;
  ScheduleRepoImpl(this.remoteDataSource);

}
