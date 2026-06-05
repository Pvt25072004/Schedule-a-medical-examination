import 'package:flutter/material.dart';
import '../service/medical_record_service.dart';

class MedicalRecordDetailScreen extends StatefulWidget {
  final int appointmentId;

  const MedicalRecordDetailScreen({super.key, required this.appointmentId});

  @override
  State<MedicalRecordDetailScreen> createState() => _MedicalRecordDetailScreenState();
}

class _MedicalRecordDetailScreenState extends State<MedicalRecordDetailScreen> {
  final MedicalRecordService _recordService = MedicalRecordService();
  bool _isLoading = true;
  Map<String, dynamic>? _record;

  @override
  void initState() {
    super.initState();
    _loadRecord();
  }

  Future<void> _loadRecord() async {
    final record = await _recordService.fetchRecordByAppointment(widget.appointmentId);
    if (mounted) {
      setState(() {
        _record = record;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color primaryThemeColor = Color(0xFF00A86B);

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Hồ sơ bệnh án')),
        body: const Center(child: CircularProgressIndicator(color: primaryThemeColor)),
      );
    }

    if (_record == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Hồ sơ bệnh án')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.folder_off_outlined, size: 64, color: Colors.grey),
              SizedBox(height: 16),
              Text('Chưa có hồ sơ bệnh án cho lịch hẹn này', style: TextStyle(fontSize: 16)),
            ],
          ),
        ),
      );
    }

    final String diagnosis = _record!['diagnosis'] ?? 'Chưa cập nhật';
    final String treatment = _record!['treatment'] ?? 'Chưa cập nhật';
    final String prescriptions = _record!['prescriptions'] ?? 'Không có đơn thuốc';
    final String notes = _record!['notes'] ?? 'Không có ghi chú';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết bệnh án', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: primaryThemeColor,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection(Icons.medical_information, 'Chẩn đoán', diagnosis, Colors.redAccent),
            const SizedBox(height: 16),
            _buildSection(Icons.healing, 'Hướng điều trị', treatment, Colors.blueAccent),
            const SizedBox(height: 16),
            _buildSection(Icons.medication, 'Đơn thuốc', prescriptions, Colors.green),
            const SizedBox(height: 16),
            _buildSection(Icons.note_alt_outlined, 'Ghi chú', notes, Colors.orange),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(IconData icon, String title, String content, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 4),
          )
        ]
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const Divider(height: 24),
          Text(
            content,
            style: const TextStyle(fontSize: 15, height: 1.5, color: Colors.black87),
          ),
        ],
      ),
    );
  }
}
