import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../service/doctor_service.dart';

class Step5DoctorSelection extends StatefulWidget {
  final String cityName;
  final String specialtyName;
  final String hospitalName;
  final int? hospitalId;
  final int? categoryId;
  final Color? specialtyColor;
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;

  const Step5DoctorSelection({
    super.key,
    required this.cityName,
    required this.specialtyName,
    required this.hospitalName,
    this.hospitalId,
    this.categoryId,
    this.specialtyColor,
    required this.onNext,
    required this.onBack,
  });

  @override
  State<Step5DoctorSelection> createState() => _Step5DoctorSelectionState();
}

class _Step5DoctorSelectionState extends State<Step5DoctorSelection> {
  final DoctorService _doctorService = DoctorService();
  List<dynamic> _doctors = [];
  bool _isLoading = true;

  // Màu chủ đạo giả định
  final Color primaryDarkColor = const Color(0xFF1B5E20);

  @override
  void initState() {
    super.initState();
    _loadDoctors();
  }

  Future<void> _loadDoctors() async {
    setState(() => _isLoading = true);
    try {
      final data = await _doctorService.fetchDoctors(
        hospitalId: widget.hospitalId,
        categoryId: widget.categoryId,
      );
      setState(() {
        _doctors = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  // Helper để format giá tiền
  String _formatPrice(int price) {
    final formatter = NumberFormat('###,###', 'vi_VN');
    return '${formatter.format(price)}₫';
  }

  @override
  Widget build(BuildContext context) {
    final Color accentColor = widget.specialtyColor ?? Colors.red;

    return Column(
      children: [
        // --- Header Tùy Chỉnh ---
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Colors.grey.shade200, width: 1)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Chọn Bác sĩ (${widget.specialtyName})',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                'Tại ${widget.hospitalName}. Vui lòng chọn bác sĩ phù hợp.',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),

        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF1B5E20)))
              : _doctors.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.people_outline, size: 60, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          Text(
                            'Chưa có bác sĩ nào tại chi nhánh này.',
                            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                          ),
                          const SizedBox(height: 8),
                          ElevatedButton(
                            onPressed: _loadDoctors,
                            child: const Text('Tải lại'),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 100.0),
                      itemCount: _doctors.length,
                      itemBuilder: (context, index) {
                        final doc = _doctors[index];
                        final int docId = doc['id'] as int;
                        final String name = doc['name'] ?? 'Bác sĩ';
                        final String specialty = doc['specialty'] ?? widget.specialtyName;
                        
                        // Phép tính toán logic giả lập từ ID để hiển thị UI sinh động
                        final int price = 250000 + (docId % 4) * 50000; // Từ 250k - 400k tùy doctor ID
                        final double rating = 4.5 + (docId % 5) * 0.1; // Lên tới 5.0 sao
                        final int reviews = 50 + (docId * 7) % 150;
                        final int expYears = 5 + (docId % 20);

                        // Avatar color
                        final List<Color> avatarColors = [
                          const Color(0xFFF3E5F5),
                          const Color(0xFFC8E6C9),
                          const Color(0xFFE3F2FD),
                          const Color(0xFFFBE9E7),
                        ];
                        final Color avatarBg = avatarColors[index % avatarColors.length];

                        final priceText = _formatPrice(price);

                        return Card(
                          elevation: 4,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(color: Colors.grey.shade200),
                          ),
                          margin: const EdgeInsets.only(bottom: 16),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    CircleAvatar(
                                      radius: 30,
                                      backgroundColor: avatarBg,
                                      child: const Icon(Icons.person, size: 30, color: Colors.black54),
                                    ),
                                    const SizedBox(width: 12),

                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            name,
                                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            'Chuyên khoa $specialty',
                                            style: TextStyle(fontSize: 14, color: accentColor, fontWeight: FontWeight.w600),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 8),

                                          Row(
                                            children: [
                                              const Icon(Icons.location_on, size: 16, color: Colors.grey),
                                              const SizedBox(width: 4),
                                              Expanded(
                                                child: Text(
                                                  widget.hospitalName,
                                                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              const Icon(Icons.star, color: Colors.amber, size: 16),
                                              const SizedBox(width: 4),
                                              Text(
                                                '$rating ($reviews)',
                                                style: TextStyle(color: Colors.grey[700], fontSize: 13),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),

                                const Divider(height: 20, thickness: 1),

                                Wrap(
                                  spacing: 8.0,
                                  runSpacing: 8.0,
                                  children: [
                                    Chip(
                                      label: Text('$expYears năm kinh nghiệm', style: TextStyle(fontSize: 12, color: primaryDarkColor)),
                                      backgroundColor: Colors.greenAccent.withOpacity(0.3),
                                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                    ),
                                    Chip(
                                      label: Text(widget.cityName, style: TextStyle(fontSize: 12, color: Colors.blue.shade700)),
                                      backgroundColor: Colors.blue.shade100,
                                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                    ),
                                    Chip(
                                      label: Text('Sẵn sàng', style: TextStyle(fontSize: 12, color: Colors.green.shade700)),
                                      backgroundColor: Colors.green.shade100,
                                      avatar: Icon(Icons.check_circle, size: 16, color: Colors.green.shade700),
                                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                    ),
                                  ],
                                ),

                                const SizedBox(height: 16),

                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Phí khám (Dự kiến)', style: TextStyle(fontSize: 13, color: Colors.grey)),
                                        Text(
                                          priceText,
                                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: primaryDarkColor),
                                        ),
                                      ],
                                    ),

                                    ElevatedButton(
                                      onPressed: () => widget.onNext({
                                        'doctor': name,
                                        'doctorId': docId,
                                        'price': price,
                                      }),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: accentColor,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      ),
                                      child: const Text('Đặt lịch', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }
}