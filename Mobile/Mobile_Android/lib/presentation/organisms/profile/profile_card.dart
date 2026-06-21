import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class ProfileCard extends StatelessWidget {
  final String displayName;
  final String userEmail;
  final String? photoUrl;
  final Color primaryColor;
  final Color primaryDarkColor;

  const ProfileCard({
    super.key,
    required this.displayName,
    required this.userEmail,
    this.photoUrl,
    this.primaryColor = AppColors.primary,
    this.primaryDarkColor = AppColors.primaryDark,
  });

  Widget _buildInitialsAvatar(String name) {
    String initials = 'NV';
    if (name.trim().isNotEmpty) {
      final parts = name.trim().split(' ');
      if (parts.length >= 2) {
        initials = parts[0][0] + parts[parts.length - 1][0];
      } else if (parts.isNotEmpty) {
        initials = parts[0].substring(0, parts[0].length > 1 ? 2 : 1).toUpperCase();
      }
    }

    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark.withOpacity(0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.4),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Center(
        child: Text(
          initials,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 26,
          ),
        ),
      ),
    );
  }

  Widget _buildProfileTag({
    required IconData icon,
    required String text,
    required Color bgColor,
    required Color textColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: textColor, size: 14),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
                fontSize: 12, color: textColor, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.18),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Avatar
              photoUrl != null && photoUrl!.isNotEmpty
                  ? CircleAvatar(
                      radius: 30,
                      backgroundImage: NetworkImage(photoUrl!),
                    )
                  : _buildInitialsAvatar(displayName),

              const SizedBox(width: 15),

              // Tên và Email
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(displayName,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 22)),
                    Text(userEmail,
                        style: TextStyle(
                            fontSize: 14, color: Colors.grey[600])),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Các nhãn/tag
          Wrap(
            spacing: 10.0,
            runSpacing: 8.0,
            children: [
              _buildProfileTag(
                icon: Icons.star_rate_rounded,
                text: 'Thành viên VIP',
                bgColor: const Color(0xFFFDD835),
                textColor: Colors.black87,
              ),
              _buildProfileTag(
                icon: Icons.health_and_safety,
                text: 'Bảo hiểm Y tế A',
                bgColor: AppColors.primary.withOpacity(0.1),
                textColor: AppColors.primary,
              ),
            ],
          ),
        ],
      ),
    );
  }
}



