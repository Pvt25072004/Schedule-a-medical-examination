import '../../domain/entities/service_package.dart';

class ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}Model extends ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)} {
  ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}Model({super.id});

  factory ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}Model.fromJson(Map<String, dynamic> json) {
    return ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}Model(
      id: json['_id'] ?? json['id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
    };
  }
}
