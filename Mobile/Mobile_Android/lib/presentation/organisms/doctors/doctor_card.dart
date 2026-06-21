import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../core/utils/image_helper.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class DoctorCard extends StatelessWidget {
  final dynamic doctor;
  final VoidCallback onTap;

  const DoctorCard({
    super.key,
    required this.doctor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final String name = doctor['user']?['full_name'] ?? doctor['name'] ?? 'Chưa rõ tên';
    final String specialty = doctor['category']?['name'] ?? 'Chưa rõ chuyên khoa';
    final int exp = doctor['experience_years'] ?? 0;
    final int reviewCount = doctor['review_count'] ?? 0;
    final double rating = (doctor['rating'] ?? 5.0).toDouble();

    final String avatarUrl = (doctor['avatar_url'] ?? doctor['user']?['avatar_url'] ?? doctor['user']?['avatar'] ?? '').toString();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Row(
          children: [
            // Avatar
            ClipOval(
              child: Container(
                width: 72,
                height: 72,
                color: AppColors.primary.withOpacity(0.1),
                child: avatarUrl.isNotEmpty
                    ? Image.network(ImageHelper.getFullUrl(avatarUrl),
                        fit: BoxFit.cover,
                        errorBuilder: (c, e, s) => Center(
                          child: Text(
                            name.isNotEmpty ? name.substring(0, 1) : 'D',
                            style: const TextStyle(color: AppColors.primary, fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                        ),
                      )
                    : Center(
                        child: Text(
                          name.isNotEmpty ? name.substring(0, 1) : 'D',
                          style: const TextStyle(color: AppColors.primary, fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                      ),
              ),
            ),
            const SizedBox(width: 16),
            
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black87),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    specialty,
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.amber.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 14),
                            const SizedBox(width: 4),
                            Text('$rating', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            Text(' ($reviewCount)', style: TextStyle(color: Colors.grey.shade700, fontSize: 12)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text('$exp năm KN', style: TextStyle(color: Colors.blue.shade700, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}


