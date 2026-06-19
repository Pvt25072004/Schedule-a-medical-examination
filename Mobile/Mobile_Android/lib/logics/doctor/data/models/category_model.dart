import '../../domain/entities/category.dart';

class CategoryModel extends Category {
  CategoryModel({super.id});

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(id: json['_id'] ?? json['id']);
  }
}
