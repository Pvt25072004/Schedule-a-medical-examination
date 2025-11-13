// step2_hospital_selection.dart - Hospital selection step with UI matching the image
import 'package:flutter/material.dart';

class Step2HospitalSelection extends StatelessWidget {
  final String cityName;
  final Color? cityColor;
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack; // Giữ lại trong constructor nếu bạn cần nó cho các logic khác, nhưng không dùng trong UI
  Step2HospitalSelection({
    super.key,
    required this.cityName,
    this.cityColor,
    required this.onNext,
    required this.onBack,
  });

  // Mock data for hospitals in the city (e.g., Hà Nội from image)
  final List<Map<String, dynamic>> hospitals = [
    {
      'name': 'Bệnh viện Bạch Mai',
      'icon': Icons.local_hospital,
      'distance': '56km (Giải Phóng, Đống Đa)',
      'beds': 245,
      'departments': 42,
      'rating': 4.8,
      'status': 'Đang hoạt động',
      'color': Colors.indigo,
    },
    {
      'name': 'Bệnh viện Đại học Y Hà Nội',
      'icon': Icons.local_hospital,
      'distance': 'Số 1 Tôn Thất Tùng, Đống Đa',
      'beds': 198,
      'departments': 38,
      'rating': 4.7,
      'status': 'Đang hoạt động',
      'color': Colors.blue,
    },
    {
      'name': 'Bệnh viện Hữu nghị Việt Đức',
      'icon': Icons.local_hospital,
      'distance': '40 Tràng Thi, Hoàn Kiếm',
      'beds': 300,
      'departments': 50,
      'rating': 4.9,
      'status': 'Đang hoạt động',
      'color': Colors.deepOrange,
    },
    {
      'name': 'Bệnh viện Nhi Trung ương',
      'icon': Icons.child_care,
      'distance': '879 La Thành, Đống Đa',
      'beds': 210,
      'departments': 30,
      'rating': 5.0,
      'status': 'Đang hoạt động',
      'color': Colors.pink,
    },
  ];

  // Helper widget để tạo chip thông tin nhỏ
  Widget _buildInfoChip(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Sử dụng màu của thành phố nếu có, nếu không thì dùng màu mặc định
    final headerColor = cityColor ?? Colors.blue;

    return Column(
      children: [
        // --- Header Tùy Chỉnh (Đã loại bỏ nút Back) ---
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16), // Tăng padding dọc lên 16
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Colors.grey.shade200, width: 1)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Chọn bệnh viện tại ${cityName}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                'Danh sách các bệnh viện có lịch trống tại khu vực này.',
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
            padding: const EdgeInsets.symmetric(horizontal: 16.0), // Chỉ padding ngang
            child: ListView.builder(
              // THÊM PADDING DƯỚI 100PX CHO LISTVIEW
              padding: const EdgeInsets.only(top: 16, bottom: 100.0),
              itemCount: hospitals.length,
              itemBuilder: (context, index) {
                final hospital = hospitals[index];
                final cardColor = hospital['color'] as Color;

                return InkWell(
                  onTap: () => onNext({'hospital': hospital['name']}),
                  borderRadius: BorderRadius.circular(16), // Bo tròn lớn hơn
                  child: Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(color: Colors.grey.shade100, width: 1)
                    ),
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Hàng 1: Tên bệnh viện & Rating
                          Row(
                            children: [
                              Icon(hospital['icon'], color: cardColor, size: 24),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  hospital['name'],
                                  style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.black87),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              // Rating
                              Row(
                                children: [
                                  const Icon(Icons.star, color: Colors.amber, size: 16),
                                  const SizedBox(width: 4),
                                  Text('${hospital['rating']}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                                ],
                              ),
                            ],
                          ),

                          const Divider(height: 20, thickness: 0.5),

                          // Hàng 2: Địa chỉ
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(Icons.location_on, size: 16, color: Colors.grey[500]),
                              const SizedBox(width: 8),
                              Expanded(child: Text(hospital['distance'], style: TextStyle(color: Colors.grey[600], fontSize: 13))),
                            ],
                          ),

                          const SizedBox(height: 12),

                          // Hàng 3: Chips thông tin (Giường bệnh & Chuyên khoa)
                          Wrap(
                            spacing: 8.0,
                            runSpacing: 8.0,
                            children: [
                              _buildInfoChip(Icons.hotel, '${hospital['beds']} giường', Colors.blueGrey),
                              _buildInfoChip(Icons.medical_services, '${hospital['departments']} chuyên khoa', Colors.deepOrange),
                              _buildInfoChip(Icons.access_time_filled, hospital['status'], Colors.green.shade700),
                            ],
                          ),

                          const SizedBox(height: 12),

                          // Hàng 4: Nút Chọn
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () => onNext({'hospital': hospital['name']}),
                              icon: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                              label: const Text('Chọn bệnh viện này'),
                              style: ElevatedButton.styleFrom(
                                  backgroundColor: cardColor,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  elevation: 0,
                                  padding: const EdgeInsets.symmetric(vertical: 12)
                              ),
                            ),
                          )
                        ],
                      ),
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