import 'package:flutter/material.dart';
import '../../utils/image_helper.dart';
import 'package:intl/intl.dart';
import '../../service/doctor_service.dart';

class Step5DoctorSelection extends StatefulWidget {
  final String cityName;
  final String specialtyName;
  final String hospitalName;
  final int? hospitalId;
  final int? categoryId;
  final Color? specialtyColor;
  final DateTime? selectedDate;
  final String? selectedTimeSlot;
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
    this.selectedDate,
    this.selectedTimeSlot,
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
  final Color primaryDarkColor = const Color(0xFF143250);

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
        date: widget.selectedDate,
        timeSlot: widget.selectedTimeSlot,
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
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF48A1F3)))
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
                        
                        final String name = (doc['user']?['full_name'] ?? doc['name'] ?? 'Bác sĩ').toString();
                        final String specialty = (doc['category']?['name'] ?? doc['specialty'] ?? widget.specialtyName).toString();
                        
                        // --- TÍNH TOÁN GIÁ THẬT (Chuẩn Enterprise) ---
                        // Tổng giá = Giá khám bác sĩ + Phụ phí bệnh viện
                        final double doctorFee = (doc['consultation_fee'] ?? 0).toDouble();
                        double facilityFee = 0;
                        final hospitals = doc['hospitals'] as List?;
                        if (hospitals != null && hospitals.isNotEmpty) {
                          // Ưu tiên lấy đúng phụ phí của bệnh viện mà user đã chọn ở Step 2
                          final currentHos = hospitals.firstWhere(
                            (h) => h['id'] == widget.hospitalId,
                            orElse: () => hospitals.first,
                          );
                          facilityFee = (currentHos['facility_fee'] ?? 0).toDouble();
                        }
                        final int price = (doctorFee + facilityFee).toInt();
                        
                        // Dữ liệu thật từ API
                        final double rating = (doc['rating'] != null) ? (double.tryParse(doc['rating'].toString()) ?? 5.0) : 5.0;
                        final int reviews = (doc['review_count'] != null) ? (int.tryParse(doc['review_count'].toString()) ?? 0) : 0;
                        final int expYears = (doc['experience_years'] != null) ? (int.tryParse(doc['experience_years'].toString()) ?? 0) : 0;
                        final String avatarUrl = (doc['avatar_url'] ?? doc['user']?['avatar_url'] ?? doc['user']?['avatar'] ?? '').toString();

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
                                    ClipOval(
                                      child: Container(
                                        width: 60,
                                        height: 60,
                                        color: avatarBg,
                                        child: avatarUrl.isNotEmpty
                                            ? Image.network(ImageHelper.getFullUrl(avatarUrl),
                                                fit: BoxFit.cover,
                                                errorBuilder: (c, e, s) => const Icon(Icons.person, size: 30, color: Colors.black54),
                                              )
                                            : const Icon(Icons.person, size: 30, color: Colors.black54),
                                      ),
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
                                      backgroundColor: const Color(0xFF48A1F3).withOpacity(0.3),
                                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                    ),
                                    Chip(
                                      label: Text(widget.cityName, style: TextStyle(fontSize: 12, color: Colors.blue.shade700)),
                                      backgroundColor: Colors.blue.shade100,
                                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                    ),
                                    Chip(
                                      label: Text('Sẵn sàng', style: TextStyle(fontSize: 12, color: const Color(0xFF48A1F3))),
                                      backgroundColor: const Color(0xFFEBF5FF),
                                      avatar: Icon(Icons.check_circle, size: 16, color: const Color(0xFF48A1F3)),
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
