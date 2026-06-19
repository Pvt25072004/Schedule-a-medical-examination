import '../../domain/entities/startup.dart';

class StartupModel extends Startup {
  StartupModel({super.id});

  factory StartupModel.fromJson(Map<String, dynamic> json) {
    return StartupModel(id: json['_id'] ?? json['id']);
  }
}
