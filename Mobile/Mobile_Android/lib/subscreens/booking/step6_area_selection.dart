// step6_confirmation.dart - Confirmation summary
import 'package:clinic_booking_system/subscreens/booking/step2_area_selection.dart';
import 'package:flutter/material.dart';

class Step6Confirmation extends StatelessWidget {
  final String cityName;
  final String hospitalName;
  final String specialty;
  final String doctor;
  final DateTime date;
  final String timeSlot;
  final double price;
  final String fullName;
  final String phone;
  final String email;
  final String reason;
  final String note;
  final VoidCallback onConfirm;
  final VoidCallback onBack;
  const Step6Confirmation({
    super.key,
    required this.cityName,
    required this.hospitalName,
    required this.specialty,
    required this.doctor,
    required this.date,
    required this.timeSlot,
    required this.price,
    required this.fullName,
    required this.phone,
    required this.email,
    required this.reason,
    required this.note,
    required this.onConfirm,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AppBar(
          title: const Text('Xác nhận đặt lịch'),
          backgroundColor: Colors.green,
          foregroundColor: Colors.white,
          automaticallyImplyLeading: false,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: onBack,
          ),
        ).asBody(),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Thông tin lịch hẹn:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _buildInfoRow('Bệnh viện', hospitalName),
                _buildInfoRow('Chuyên khoa', specialty),
                _buildInfoRow('Bác sĩ', doctor),
                _buildInfoRow('Ngày khám', '${date.day}/${date.month}/${date.year}'),
                _buildInfoRow('Giờ khám', timeSlot),
                _buildInfoRow('Phí khám', '${(price / 1000).toStringAsFixed(0)}kđ'),
                const SizedBox(height: 16),
                const Text('Thông tin bệnh nhân:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                _buildInfoRow('Họ tên', fullName),
                _buildInfoRow('SĐT', phone),
                _buildInfoRow('Email', email),
                _buildInfoRow('Lý do khám', reason),
                if (note.isNotEmpty) _buildInfoRow('Ghi chú', note),
                const SizedBox(height: 40),
                Center(
                  child: ElevatedButton(
                    onPressed: onConfirm,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                    child: const Text('Xác nhận', style: TextStyle(color: Colors.white)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}