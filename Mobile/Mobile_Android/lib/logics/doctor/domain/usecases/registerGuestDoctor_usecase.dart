import '../entities/doctor.dart';
import '../repositories/doctor_repository.dart';

class RegisterguestdoctorUseCase {
  final DoctorRepository repository;
  RegisterguestdoctorUseCase(this.repository);

  Future<bool> call(Map<String, dynamic> data) async {
    return await repository.registerGuestDoctor(data);
  }
}
