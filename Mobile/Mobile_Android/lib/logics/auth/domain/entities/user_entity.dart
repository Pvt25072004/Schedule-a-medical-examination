class UserEntity {
  final String id;
  final String? email;
  final String? fullName;
  final String? photoUrl;
  final String? phoneNumber;
  final String? role;
  final bool isWelcome;

  UserEntity({
    required this.id,
    this.email,
    this.fullName,
    this.photoUrl,
    this.phoneNumber,
    this.role,
    this.isWelcome = false,
  });
}
