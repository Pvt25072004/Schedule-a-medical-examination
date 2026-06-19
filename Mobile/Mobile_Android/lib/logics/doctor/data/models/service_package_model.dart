import '../../domain/entities/service_package.dart';

class ServicePackageModel extends ServicePackage {
  ServicePackageModel({super.id});

  factory ServicePackageModel.fromJson(Map<String, dynamic> json) {
    return ServicePackageModel(id: json['_id'] ?? json['id']);
  }
}
