import '../entities/doctor.dart';
import '../repositories/doctor_repository.dart';

class ApplyfordoctorUseCase {
  final DoctorRepository repository;
  ApplyfordoctorUseCase(this.repository);

  Future<bool> call(Map<String, dynamic> data) async {
    return await repository.applyForDoctor(Map<String, data);
  }
}
