// step5_doctor_selection.dart - Step for choosing a doctor
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Step5DoctorSelection extends StatelessWidget {
  final String specialtyName;
  final String hospitalName;
  final Color? specialtyColor;
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;

  const Step5DoctorSelection({
    super.key,
    required this.specialtyName,
    required this.hospitalName,
    this.specialtyColor,
    required this.onNext,
    required this.onBack,
  });

  // Màu chủ đạo giả định
  final Color primaryDarkColor = const Color(0xFF1B5E20);

  // --- MOCK DATA Bác sĩ ---
  final List<Map<String, dynamic>> doctors = const [
    {
      'title': 'BS.CKI Nguyễn Văn A (Tên rất dài để test overflow)',
      'specialty': 'Tim mạch (Chuyên khoa tim mạch phức tạp)',
      'hospital': 'Bệnh viện Bạch Mai (Địa điểm nổi tiếng)',
      'rating': 4.9,
      'reviews': 234,
      'experience': 15,
      'location': 'Hà Nội',
      'price': 300000,
      'availableToday': true,
      'avatarColor': Color(0xFFF3E5F5), // Màu avatar mockup
    },
    {
      'title': 'PGS.TS Hoàng Thị B',
      'specialty': 'Nội khoa',
      'hospital': 'Bệnh viện Đại học Y Hà Nội',
      'rating': 4.8,
      'reviews': 198,
      'experience': 20,
      'location': 'Hà Nội',
      'price': 450000,
      'availableToday': false,
      'avatarColor': Color(0xFFC8E6C9),
    },
    {
      'title': 'GS.TS Trần Văn C',
      'specialty': 'Phẫu thuật thần kinh cột sống',
      'hospital': 'Phòng khám ABC chuyên sâu',
      'rating': 5.0,
      'reviews': 50,
      'experience': 25,
      'location': 'Hà Nội',
      'price': 600000,
      'availableToday': true,
      'avatarColor': Color(0xFFE3F2FD),
    },
    {
      'title': 'BS. Nguyễn Thị D',
      'specialty': 'Da liễu',
      'hospital': 'Bệnh viện Da liễu TW',
      'rating': 4.5,
      'reviews': 112,
      'experience': 8,
      'location': 'Hà Nội',
      'price': 250000,
      'availableToday': true,
      'avatarColor': Color(0xFFFBE9E7),
    },
  ];

  // Helper để format giá tiền
  String _formatPrice(int price) {
    final formatter = NumberFormat('###,###', 'vi_VN');
    return '${formatter.format(price)}₫';
  }

  @override
  Widget build(BuildContext context) {
    // Sử dụng màu chuyên khoa nếu có, không thì dùng mặc định
    final Color accentColor = specialtyColor ?? Colors.red;

    return Column(
      children: [
        // --- Header Tùy Chỉnh (Bước 5) ---
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
                'Chọn Bác sĩ ($specialtyName)',
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
                'Tại $hospitalName. Vui lòng chọn bác sĩ phù hợp.',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
        // --- Kết thúc Header Tùy Chỉnh ---

        Expanded(
          child: ListView.builder(
            // THÊM PADDING DƯỚI 100PX
            padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 100.0),
            itemCount: doctors.length,
            itemBuilder: (context, index) {
              final doctor = doctors[index];
              final isAvailable = doctor['availableToday'] as bool;
              final priceText = _formatPrice(doctor['price'] as int);

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
                      // Hàng 1: Avatar, Tên, Chuyên khoa
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Avatar (Mock)
                          CircleAvatar(
                            radius: 30,
                            backgroundColor: doctor['avatarColor'] as Color,
                            child: const Icon(Icons.person, size: 30, color: Colors.black54), // Icon chung
                          ),
                          const SizedBox(width: 12),

                          // Tên và Chuyên khoa
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  doctor['title'] as String,
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                                  maxLines: 1, // SỬA LỖI OVERFLOW
                                  overflow: TextOverflow.ellipsis, // SỬA LỖI OVERFLOW
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Chuyên khoa ${doctor['specialty']}',
                                  style: TextStyle(fontSize: 14, color: accentColor, fontWeight: FontWeight.w600),
                                  maxLines: 1, // SỬA LỖI OVERFLOW
                                  overflow: TextOverflow.ellipsis, // SỬA LỖI OVERFLOW
                                ),
                                const SizedBox(height: 8),

                                // Bệnh viện và Rating
                                Row(
                                  children: [
                                    const Icon(Icons.location_on, size: 16, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Expanded( // Bọc bằng Expanded để Text overflow hoạt động
                                      child: Text(
                                        doctor['hospital'] as String,
                                        style: TextStyle(color: Colors.grey[600], fontSize: 13),
                                        maxLines: 1, // SỬA LỖI OVERFLOW
                                        overflow: TextOverflow.ellipsis, // SỬA LỖI OVERFLOW
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    const Icon(Icons.star, color: Colors.amber, size: 16),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${doctor['rating']} (${doctor['reviews']} đánh giá)',
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

                      // Hàng 2: Tags (Kinh nghiệm, Địa điểm, Trạng thái)
                      Wrap(
                        spacing: 8.0,
                        runSpacing: 8.0,
                        children: [
                          // Kinh nghiệm
                          Chip(
                            label: Text('${doctor['experience']} năm kinh nghiệm', style: TextStyle(fontSize: 12, color: primaryDarkColor)),
                            backgroundColor: Colors.greenAccent.withOpacity(0.3),
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          // Địa điểm (Thành phố)
                          Chip(
                            label: Text(doctor['location'] as String, style: TextStyle(fontSize: 12, color: Colors.blue.shade700)),
                            backgroundColor: Colors.blue.shade100,
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          // Trạng thái khả dụng
                          Chip(
                            label: Text(isAvailable ? 'Hôm nay' : 'Mai', style: TextStyle(fontSize: 12, color: isAvailable ? Colors.green.shade700 : Colors.orange.shade700)),
                            backgroundColor: isAvailable ? Colors.green.shade100 : Colors.orange.shade100,
                            avatar: Icon(Icons.access_time, size: 16, color: isAvailable ? Colors.green.shade700 : Colors.orange.shade700),
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Hàng 3: Giá và Nút Đặt lịch
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Phí khám', style: TextStyle(fontSize: 14, color: Colors.grey)),
                              Text(
                                priceText,
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: primaryDarkColor),
                              ),
                            ],
                          ),

                          // Nút Đặt lịch
                          ElevatedButton(
                            onPressed: () => onNext({
                              'doctor': doctor['title'],
                              'price': doctor['price'],
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