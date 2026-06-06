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
    const Color primaryColor = Color(0xFF48A1F3); // Blue
    const Color primaryDarkColor = Color(0xFF143250); // Dark Blue

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Hồ sơ bệnh án')),
        body: const Center(child: CircularProgressIndicator(color: primaryColor)),
      );
    }

    if (_record == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Hồ sơ bệnh án', style: TextStyle(color: Colors.white)),
          backgroundColor: primaryDarkColor,
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.folder_off_outlined, size: 80, color: Colors.grey.shade300),
              const SizedBox(height: 16),
              Text('Chưa có hồ sơ bệnh án cho lịch hẹn này', style: TextStyle(fontSize: 16, color: Colors.grey.shade600)),
            ],
          ),
        ),
      );
    }

    final String diagnosis = _record!['diagnosis'] ?? 'Chưa cập nhật';
    final String symptoms = _record!['symptoms'] ?? 'Không ghi nhận';
    final String treatment = _record!['treatment'] ?? 'Chưa cập nhật';
    final String prescriptions = _record!['prescription'] ?? 'Không có đơn thuốc';
    final String recommendations = _record!['recommendations'] ?? 'Không có lời khuyên';
    final String notes = _record!['notes'] ?? 'Không có ghi chú';
    
    // Parse vitals if exists
    final Map<String, dynamic> vitals = _record!['vitals'] ?? {};

    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F8), // Soft background
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 120.0,
            floating: false,
            pinned: true,
            backgroundColor: primaryDarkColor,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text('Chi tiết bệnh án', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF143250), Color(0xFF48A1F3)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                
                // Vitals Section (Top highlight)
                if (vitals.isNotEmpty) ...[
                  _buildPremiumVitalsSection(vitals),
                  const SizedBox(height: 20),
                ],

                // Medical Details
                _buildPremiumSection(Icons.medical_information, 'Chẩn đoán sơ bộ', diagnosis, const Color(0xFFE57373)),
                const SizedBox(height: 16),
                _buildPremiumSection(Icons.sick_outlined, 'Triệu chứng lâm sàng', symptoms, const Color(0xFFFFB74D)),
                const SizedBox(height: 16),
                _buildPremiumSection(Icons.healing, 'Hướng điều trị', treatment, primaryColor),
                const SizedBox(height: 16),
                _buildPremiumSection(Icons.medication, 'Đơn thuốc', prescriptions, const Color(0xFF81C784)),
                const SizedBox(height: 16),
                _buildPremiumSection(Icons.favorite_border, 'Lời khuyên & Tái khám', recommendations, const Color(0xFFF06292)),
                const SizedBox(height: 16),
                _buildPremiumSection(Icons.note_alt_outlined, 'Ghi chú khác', notes, Colors.grey.shade600),
                
                const SizedBox(height: 40),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPremiumSection(IconData icon, String title, String content, Color iconColor) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: iconColor.withOpacity(0.08),
            blurRadius: 15,
            offset: const Offset(0, 5),
          )
        ],
        border: Border.all(color: iconColor.withOpacity(0.1), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header of Section
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.05),
              borderRadius: const BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: iconColor.withOpacity(0.2), blurRadius: 4, offset: const Offset(0, 2))
                    ]
                  ),
                  child: Icon(icon, color: iconColor, size: 20),
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey.shade800),
                ),
              ],
            ),
          ),
          
          // Content
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              content,
              style: const TextStyle(fontSize: 15, height: 1.6, color: Colors.black87),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPremiumVitalsSection(Map<String, dynamic> vitals) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4.0, bottom: 12.0),
          child: Text(
            'Chỉ số sinh tồn',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey.shade800),
          ),
        ),
        SizedBox(
          height: 100,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              if (vitals['bloodPressure'] != null)
                _buildVitalCard(Icons.bloodtype, 'Huyết áp', '${vitals['bloodPressure']} mmHg', Colors.redAccent),
              if (vitals['heartRate'] != null)
                _buildVitalCard(Icons.favorite, 'Nhịp tim', '${vitals['heartRate']} bpm', Colors.pinkAccent),
              if (vitals['temperature'] != null)
                _buildVitalCard(Icons.thermostat, 'Nhiệt độ', '${vitals['temperature']} °C', Colors.orangeAccent),
              if (vitals['weight'] != null)
                _buildVitalCard(Icons.monitor_weight_outlined, 'Cân nặng', '${vitals['weight']} kg', Colors.blueAccent),
              if (vitals['height'] != null)
                _buildVitalCard(Icons.height, 'Chiều cao', '${vitals['height']} cm', Colors.green),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildVitalCard(IconData icon, String label, String value, Color color) {
    return Container(
      width: 120,
      margin: const EdgeInsets.only(right: 12, bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }
}
