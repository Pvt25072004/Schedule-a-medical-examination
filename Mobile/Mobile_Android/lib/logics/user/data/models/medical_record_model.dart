import '../../domain/entities/medical_record.dart';

class MedicalRecordModel extends MedicalRecord {
  MedicalRecordModel({super.id});

  factory MedicalRecordModel.fromJson(Map<String, dynamic> json) {
    return MedicalRecordModel(id: json['_id'] ?? json['id']);
  }
}
