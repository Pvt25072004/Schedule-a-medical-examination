import '../../domain/entities/appointment.dart';

class AppointmentModel extends Appointment {
  AppointmentModel({super.id});

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(id: json['_id'] ?? json['id']);
  }
}
