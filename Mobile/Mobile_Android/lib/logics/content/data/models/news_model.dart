import '../../domain/entities/news.dart';

class NewsModel extends News {
  NewsModel({super.id});

  factory NewsModel.fromJson(Map<String, dynamic> json) {
    return NewsModel(id: json['_id'] ?? json['id']);
  }
}
