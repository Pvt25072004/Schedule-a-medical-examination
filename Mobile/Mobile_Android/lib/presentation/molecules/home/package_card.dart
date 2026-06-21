import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';
import 'package:clinic_booking_system/core/utils/text_utils.dart';

class PackageCard extends StatelessWidget {
  final dynamic pkg;
  final Color primaryColor;
  final Color primaryLightColor;
  final Color primaryDarkColor;
  final Color accentColor;
  final VoidCallback onTap;

  const PackageCard({
    super.key,
    required this.pkg,
    required this.primaryColor,
    required this.primaryLightColor,
    required this.primaryDarkColor,
    required this.accentColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 250,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 6,
            offset: const Offset(0, 3),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Container(
              height: 70,
              width: double.infinity,
              color: AppColors.primaryLight,
              child: (pkg['image_url'] != null &&
                      pkg['image_url'].toString().isNotEmpty)
                  ? Image.network(
                      pkg['image_url'],
                      fit: BoxFit.cover,
                      errorBuilder: (c, e, s) => Icon(
                        Icons.medical_services_outlined,
                        size: 36,
                        color: AppColors.primary,
                      ),
                    )
                  : Icon(
                      Icons.medical_services_outlined,
                      size: 36,
                      color: AppColors.primary,
                    ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  pkg['name'] ?? 'Gói Khám',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppColors.primaryDark,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  TextUtils.stripHtml(pkg['description'] ?? ''),
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${pkg['fixed_price'] ?? pkg['price'] ?? 0}đ',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.accent,
                      ),
                    ),
                    InkWell(
                      onTap: onTap,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'Đặt',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}



