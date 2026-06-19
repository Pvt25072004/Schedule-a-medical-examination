import '../../domain/entities/city.dart';

class CityModel extends City {
  CityModel({
    super.id,
    required super.name,
    required super.area,
    super.hospitalCount,
  });

  factory CityModel.fromJson(Map<String, dynamic> json) {
    return CityModel(
      id: json['_id'] ?? json['id'],
      name: json['name'] ?? '',
      area: (json['area'] ?? json['mien'] ?? json['region'] ?? '').toString().trim(),
      hospitalCount: json['hospitalCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'area': area,
      'hospitalCount': hospitalCount,
    };
  }
}
