// step3_specialty_selection.dart
import 'package:flutter/material.dart';

class Step3SpecialtySelection extends StatelessWidget {
  final String cityName;
  final String hospitalName;
  final Color? color;
  final Function(Map<String, dynamic>) onNext;
  // Loại bỏ final VoidCallback onBack; vì nó không được sử dụng trong UI này
  Step3SpecialtySelection({
    super.key,
    required this.cityName,
    required this.hospitalName,
    this.color,
    required this.onNext,
    required final VoidCallback onBack, // Vẫn nhận để đảm bảo API không bị phá vỡ, nhưng không dùng trong UI
  });

  final List<Map<String, dynamic>> specialties = [
    {'name': 'Tim mạch', 'icon': Icons.favorite, 'color': Colors.red},
    {'name': 'Nhĩ khoa', 'icon': Icons.hearing, 'color': Colors.blue},
    {'name': 'Xương khớp', 'icon': Icons.accessibility, 'color': Colors.orange}, // Đổi icon Xương khớp
    {'name': 'Thần kinh', 'icon': Icons.psychology_outlined, 'color': Colors.purple}, // Đổi icon Thần kinh
    {'name': 'Mắt', 'icon': Icons.visibility, 'color': Colors.green},
    {'name': 'Nhi khoa', 'icon': Icons.child_care, 'color': Colors.pink},
    {'name': 'Tai mũi họng', 'icon': Icons.hearing_outlined, 'color': Colors.brown}, // Đổi icon Tai mũi họng
    {'name': 'Da liễu', 'icon': Icons.spa_outlined, 'color': Colors.teal}, // Đổi icon Da liễu
    {'name': 'Nội khoa', 'icon': Icons.health_and_safety, 'color': Colors.indigo},
  ];

  @override
  Widget build(BuildContext context) {
    // Màu chủ đạo (không sử dụng ở đây nhưng giữ lại)
    final Color headerColor = color ?? Colors.blue;

    return Column(
      children: [
        // --- Header Tùy Chỉnh (Xít lên và có mô tả) ---
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
                'Chọn chuyên khoa tại $hospitalName',
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
                'Thành phố: $cityName. Vui lòng chọn chuyên khoa bạn cần khám.',
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
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0), // Padding ngang cho toàn bộ nội dung
            child: GridView.builder(
              // THÊM PADDING DƯỚI 100PX CHO GRIDVIEW
              padding: const EdgeInsets.only(top: 16.0, bottom: 110.0),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1.2,
                crossAxisSpacing: 16, // Tăng khoảng cách ngang
                mainAxisSpacing: 16, // Tăng khoảng cách dọc
              ),
              itemCount: specialties.length,
              itemBuilder: (context, index) {
                final spec = specialties[index];
                final specColor = spec['color'] as Color;

                return Card(
                  elevation: 6, // Tăng elevation
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16), // Bo tròn lớn hơn
                    side: BorderSide(color: specColor.withOpacity(0.5)), // Viền theo màu chuyên khoa
                  ),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => onNext({
                      'specialty': spec['name'],
                      'color': specColor,
                    }),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: specColor.withOpacity(0.15),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(spec['icon'], size: 36, color: specColor),
                        ),
                        const SizedBox(height: 12),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 8.0),
                          child: Text(
                            spec['name'],
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: Colors.black87
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}