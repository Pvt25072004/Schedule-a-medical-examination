import '../../domain/entities/schedule.dart';

class ScheduleModel extends Schedule {
  ScheduleModel({super.id});

  factory ScheduleModel.fromJson(Map<String, dynamic> json) {
    return ScheduleModel(id: json['_id'] ?? json['id']);
  }
}
