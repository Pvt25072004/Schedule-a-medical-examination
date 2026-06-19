import '../../domain/entities/hospital.dart';

class HospitalModel extends Hospital {
  HospitalModel({super.id});

  factory HospitalModel.fromJson(Map<String, dynamic> json) {
    return HospitalModel(id: json['_id'] ?? json['id']);
  }
}
