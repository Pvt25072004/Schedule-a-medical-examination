import '../../domain/entities/banner.dart';

class BannerModel extends Banner {
  BannerModel({super.id});

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(id: json['_id'] ?? json['id']);
  }
}
