// step1_area_selection.dart
import 'package:flutter/material.dart';

class Step1AreaSelection extends StatelessWidget {
  final Function(Map<String, dynamic>) onNext;
  Step1AreaSelection({super.key, required this.onNext});

  // Dữ liệu mock cho các thành phố và số bệnh viện
  final Map<String, List<Map<String, dynamic>>> areas = {
    'Miền Bắc': [
      {'name': 'Hà Nội', 'hospitals': 45, 'color': Colors.blue},
      {'name': 'Hải Phòng', 'hospitals': 18, 'color': Colors.blue},
      {'name': 'Quảng Ninh', 'hospitals': 12, 'color': Colors.blue},
      {'name': 'Thái Nguyên', 'hospitals': 8, 'color': Colors.blue},
      {'name': 'Hải Dương', 'hospitals': 10, 'color': Colors.blue},
      {'name': 'Bắc Ninh', 'hospitals': 7, 'color': Colors.blue},
    ],
    'Miền Trung': [
      {'name': 'Đà Nẵng', 'hospitals': 22, 'color': Colors.orange},
      {'name': 'Huế', 'hospitals': 15, 'color': Colors.orange},
      {'name': 'Quảng Nam', 'hospitals': 9, 'color': Colors.orange},
    ],
    'Miền Nam': [
      {'name': 'TP. Hồ Chí Minh', 'hospitals': 60, 'color': Colors.red},
      {'name': 'Bình Dương', 'hospitals': 25, 'color': Colors.red},
      {'name': 'Đồng Nai', 'hospitals': 20, 'color': Colors.red},
      {'name': 'Cần Thơ', 'hospitals': 15, 'color': Colors.red},
      {'name': 'Bà Rịa - Vũng Tàu', 'hospitals': 12, 'color': Colors.red},
      {'name': 'Long An', 'hospitals': 10, 'color': Colors.red},
    ],
  };

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Chọn tỉnh/thành phố để xem bệnh viện',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: ListView(
              children: areas.keys.map((area) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  child: ExpansionTile(
                    leading: Icon(
                      area == 'Miền Bắc'
                          ? Icons.north
                          : area == 'Miền Trung'
                          ? Icons.trending_neutral
                          : Icons.south,
                      color: area == 'Miền Bắc'
                          ? Colors.blue
                          : area == 'Miền Trung'
                          ? Colors.orange
                          : Colors.red,
                    ),
                    title: Text(
                      '$area',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    children: areas[area]!.map((city) {
                      return ListTile(
                        leading: Icon(Icons.location_on, color: city['color']),
                        title: Text(city['name']),
                        subtitle: Text('${city['hospitals']} bệnh viện'),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () => onNext({'city': city['name'], 'color': city['color']}),
                      );
                    }).toList(),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}