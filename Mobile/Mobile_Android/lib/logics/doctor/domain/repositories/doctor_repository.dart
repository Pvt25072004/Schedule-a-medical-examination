import '../entities/doctor.dart';

abstract class DoctorRepository {
  Future<bool> applyForDoctor(Map<String, dynamic> data);
  Future<bool> registerGuestDoctor(Map<String, dynamic> data);
}
