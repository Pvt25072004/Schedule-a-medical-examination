import 'package:flutter/material.dart';

class Step3SpecialtySelection extends StatelessWidget {
  final String cityName;
  final String hospitalName;
  final Color? color;
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;
  Step3SpecialtySelection({
    super.key,
    required this.cityName,
    required this.hospitalName,
    this.color,
    required this.onNext,
    required this.onBack,
  });

  final List<Map<String, dynamic>> specialties = [
    {'name': 'Tim mạch', 'icon': Icons.favorite, 'color': Colors.red},
    {'name': 'Nhĩ khoa', 'icon': Icons.hearing, 'color': Colors.blue},
    {'name': 'Xương khớp', 'icon': Icons.local_hospital, 'color': Colors.orange},
    {'name': 'Thần kinh', 'icon': Icons.grain, 'color': Colors.purple},
    {'name': 'Mắt', 'icon': Icons.visibility, 'color': Colors.green},
    {'name': 'Nhi khoa', 'icon': Icons.child_care, 'color': Colors.pink},
    {'name': 'Tai mũi họng', 'icon': Icons.volume_up, 'color': Colors.brown},
    {'name': 'Da liễu', 'icon': Icons.texture, 'color': Colors.teal},
    {'name': 'Nội khoa', 'icon': Icons.health_and_safety, 'color': Colors.indigo},
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AppBar(
          title: Text('Chọn chuyên khoa tại $hospitalName, $cityName'),
          backgroundColor: Colors.transparent,
          elevation: 0,
          automaticallyImplyLeading: false,
        ).asBody(),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1.2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: specialties.length,
              itemBuilder: (context, index) {
                final spec = specialties[index];
                return Card(
                  color: Colors.white, // Bỏ nền, chỉ giữ viền
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.grey.withOpacity(0.3)), // Viền xám
                  ),
                  child: InkWell(
                    onTap: () => onNext({
                      'specialty': spec['name'],
                      'color': spec['color'],
                    }),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(spec['icon'], size: 40, color: spec['color']),
                        const SizedBox(height: 8),
                        Text(
                          spec['name'],
                          style: const TextStyle(fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
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

// Extension để dùng AppBar như body (tránh nested AppBar)
extension WidgetExtension on Widget {
  Widget asBody() {
    return PreferredSize(
      preferredSize: const Size.fromHeight(kToolbarHeight),
      child: this,
    );
  }
}