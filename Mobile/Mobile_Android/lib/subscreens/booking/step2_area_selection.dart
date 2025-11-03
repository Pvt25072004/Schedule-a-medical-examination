// step2_hospital_selection.dart - Hospital selection step with UI matching the image
import 'package:flutter/material.dart';

class Step2HospitalSelection extends StatelessWidget {
  final String cityName;
  final Color? cityColor;
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;
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
      'distance': '56km',
      'beds': 245,
      'departments': 42,
      'rating': 4.8,
      'status': 'Đang hoạt động - Lịch khám hôm nay',
      'color': Colors.greenAccent,
    },
    {
      'name': 'Bệnh viện Đại học Y Hà Nội',
      'icon': Icons.local_hospital,
      'distance': 'Số 1 Tôn Thất Tùng, Đống Đa',
      'beds': 198,
      'departments': 38,
      'rating': 4.7,
      'status': 'Đang hoạt động - Lịch khám hôm nay',
      'color': Colors.greenAccent,
    },
    {
      'name': 'Bệnh viện Đại học Y Hà Nội',
      'icon': Icons.local_hospital,
      'distance': 'Số 1 Tôn Thất Tùng, Đống Đa',
      'beds': 198,
      'departments': 38,
      'rating': 4.7,
      'status': 'Đang hoạt động - Lịch khám hôm nay',
      'color': Colors.greenAccent,
    },
    {
      'name': 'Bệnh viện Đại học Y Hà Nội',
      'icon': Icons.local_hospital,
      'distance': 'Số 1 Tôn Thất Tùng, Đống Đa',
      'beds': 198,
      'departments': 38,
      'rating': 4.7,
      'status': 'Đang hoạt động - Lịch khám hôm nay',
      'color': Colors.greenAccent,
    },
    // Add more for other cities if needed
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AppBar(
          title: Text('Chọn bệnh viện tại $cityName'),
          backgroundColor: Colors.transparent,
          elevation: 0,
          automaticallyImplyLeading: false,
        ).asBody(),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: ListView.builder(
              itemCount: hospitals.length,
              itemBuilder: (context, index) {
                final hospital = hospitals[index];
                return InkWell(
                  onTap: () => onNext({'hospital': hospital['name']}),
                  child: Card(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: hospital['color'],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              hospital['icon'],
                              color: Colors.white,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  hospital['name'],
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on, size: 16, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Expanded(child: Text(hospital['distance'], style: TextStyle(color: Colors.grey[600], fontSize: 14))),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Text('${hospital['beds']} giường bệnh', style: TextStyle(fontSize: 14)),
                                    const SizedBox(width: 16),
                                    Text('${hospital['departments']} chuyên khoa', style: TextStyle(fontSize: 14)),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.star, color: Colors.amber, size: 16),
                                    const SizedBox(width: 4),
                                    Text('${hospital['rating']}', style: TextStyle(fontSize: 14)),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  hospital['status'],
                                  style: TextStyle(color: Colors.green[600], fontSize: 14),
                                ),
                              ],
                            ),
                          ),
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

// Extension để dùng AppBar như body (tránh nested AppBar)
extension WidgetExtension on Widget {
  Widget asBody() {
    return PreferredSize(
      preferredSize: const Size.fromHeight(kToolbarHeight),
      child: this,
    );
  }
}