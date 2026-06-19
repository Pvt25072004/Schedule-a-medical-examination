import '../../domain/entities/review.dart';

class ReviewModel extends Review {
  ReviewModel({super.id});

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(id: json['_id'] ?? json['id']);
  }
}
