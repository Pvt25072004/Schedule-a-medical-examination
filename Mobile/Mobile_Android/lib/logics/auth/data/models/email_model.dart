import '../../domain/entities/email.dart';

class EmailModel extends Email {
  EmailModel({super.id});

  factory EmailModel.fromJson(Map<String, dynamic> json) {
    return EmailModel(id: json['_id'] ?? json['id']);
  }
}
