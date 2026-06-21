import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../pages/profile/settings/detailed_settings_page.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class ProfileHeader extends StatelessWidget {
  final Color primaryDarkColor;

  const ProfileHeader({
    super.key,
    this.primaryDarkColor = AppColors.primaryDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 180,
      width: double.infinity,
      alignment: Alignment.topLeft,
      padding: const EdgeInsets.fromLTRB(16, 55, 16, 0),
      decoration: BoxDecoration(
        color: AppColors.primaryDark,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(25),
          bottomRight: Radius.circular(25),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Hồ sơ của bạn",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                "Quản lý tất cả thông tin cá nhân",
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
          InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const DetailedSettingsPage()),
              );
            },
            child: const Icon(
              Icons.settings_outlined,
              color: Colors.white,
              size: 26,
            ),
          ),
        ],
      ),
    );
  }
}



