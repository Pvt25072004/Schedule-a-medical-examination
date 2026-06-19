import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  UserModel({
    required super.id,
    super.email,
    super.fullName,
    super.photoUrl,
    super.phoneNumber,
    super.role,
    super.isWelcome,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      email: json['email'],
      fullName: json['full_name'],
      photoUrl: json['avatar_url'],
      phoneNumber: json['phone'],
      role: json['role'],
      isWelcome: json['is_welcome'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'full_name': fullName,
      'avatar_url': photoUrl,
      'phone': phoneNumber,
      'role': role,
      'is_welcome': isWelcome,
    };
  }
}
