import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import 'package:intl/intl.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../pages/medical_records/medical_record_detail_page.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class MedicalRecordCard extends StatelessWidget {
  final Map<String, dynamic> record;
  final Color primaryColor;

  const MedicalRecordCard({
    super.key,
    required this.record,
    this.primaryColor = AppColors.primary,
  });

  @override
  Widget build(BuildContext context) {
    final appointment = record['appointment'] ?? {};
    final doctor = appointment['doctor'] ?? {};
    final doctorUser = doctor['user'] ?? {};
    final hospital = appointment['hospital'] ?? {};

    final doctorName = doctorUser['full_name'] ?? 'Bác sĩ ẩn danh';
    final hospitalName = hospital['name'] ?? 'Phòng khám';
    final diagnosis = record['diagnosis'] ?? 'Không có chẩn đoán';
    
    final createdStr = record['created_at'];
    String dateStr = 'N/A';
    if (createdStr != null) {
      final dt = DateTime.tryParse(createdStr);
      if (dt != null) {
        dateStr = DateFormat('dd/MM/yyyy HH:mm').format(dt.toLocal());
      }
    }

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => MedicalRecordDetailPage(appointmentId: appointment['id']),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.medical_services_outlined, color: AppColors.primary, size: 20),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        dateStr,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                  const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                ],
              ),
              const Divider(height: 24),
              Text(
                'BS. $doctorName',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      hospitalName,
                      style: const TextStyle(fontSize: 13, color: Colors.grey),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.blueGrey[50],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Chẩn đoán:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    const SizedBox(height: 2),
                    Text(
                      diagnosis,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}



