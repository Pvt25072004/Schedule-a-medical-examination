import '../../domain/entities/doctor.dart';

class DoctorModel extends Doctor {
  DoctorModel({super.id});

  factory DoctorModel.fromJson(Map<String, dynamic> json) {
    return DoctorModel(id: json['_id'] ?? json['id']);
  }
}
