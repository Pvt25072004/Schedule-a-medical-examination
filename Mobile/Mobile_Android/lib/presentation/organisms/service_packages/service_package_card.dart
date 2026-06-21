import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../core/utils/image_helper.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../core/utils/text_utils.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class ServicePackageCard extends StatelessWidget {
  final dynamic pkg;
  final VoidCallback onBookNow;

  const ServicePackageCard({
    super.key,
    required this.pkg,
    required this.onBookNow,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 3,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (pkg['image_url'] != null && pkg['image_url'].toString().isNotEmpty)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              child: Image.network(
                ImageHelper.getFullUrl(pkg['image_url'].toString()),
                height: 140,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (c, e, s) => Container(
                  height: 140,
                  width: double.infinity,
                  color: Colors.grey[200],
                  child: const Icon(Icons.image_not_supported, size: 40, color: Colors.grey),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  pkg['name'] ?? 'Gói Khám',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20)),
                ),
                const SizedBox(height: 8),
                Text(
                  TextUtils.stripHtml(pkg['description']?.toString() ?? 'Không có mô tả'),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: Colors.grey[700]),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Giá: ${pkg['fixed_price'] ?? pkg['price'] ?? 0} đ',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.orange),
                    ),
                    ElevatedButton(
                      onPressed: onBookNow,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      child: const Text('Đặt Ngay'),
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


