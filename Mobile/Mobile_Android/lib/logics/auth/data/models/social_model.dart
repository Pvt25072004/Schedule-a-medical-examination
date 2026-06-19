import '../../domain/entities/social.dart';

class SocialModel extends Social {
  SocialModel({super.id});

  factory SocialModel.fromJson(Map<String, dynamic> json) {
    return SocialModel(id: json['_id'] ?? json['id']);
  }
}
