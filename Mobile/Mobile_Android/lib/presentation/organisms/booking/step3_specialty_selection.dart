import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../service/category_service.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class Step3SpecialtySelection extends StatefulWidget {
  final String cityName;
  final String hospitalName;
  final int? hospitalId;
  final Color? color;
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;

  const Step3SpecialtySelection({
    super.key,
    required this.cityName,
    required this.hospitalName,
    this.hospitalId,
    this.color,
    required this.onNext,
    required this.onBack,
  });

  @override
  State<Step3SpecialtySelection> createState() => _Step3SpecialtySelectionState();
}

class _Step3SpecialtySelectionState extends State<Step3SpecialtySelection> {
  final CategoryService _categoryService = CategoryService();
  List<dynamic> _categories = [];
  bool _isLoading = true;

  final List<Color> _colorsPalette = [
    Colors.red,
    Colors.blue,
    Colors.orange,
    Colors.purple,
    AppColors.primary,
    Colors.pink,
    Colors.brown,
    Colors.teal,
    Colors.indigo,
  ];

  final List<IconData> _iconsPalette = [
    Icons.favorite,
    Icons.hearing,
    Icons.accessibility,
    Icons.psychology_outlined,
    Icons.visibility,
    Icons.child_care,
    Icons.hearing_outlined,
    Icons.spa_outlined,
    Icons.health_and_safety,
  ];

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    setState(() => _isLoading = true);
    try {
      final data = await _categoryService.fetchCategories(hospitalId: widget.hospitalId);
      setState(() {
        _categories = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
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
                'Chọn chuyên khoa tại ${widget.hospitalName}',
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
                'Thành phố: ${widget.cityName}. Chọn chuyên khoa để tiếp tục.',
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
              ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
              : _categories.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.category_outlined, size: 60, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                           Text(
                            'Chưa có danh mục chuyên khoa nào.',
                            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                          ),
                          const SizedBox(height: 8),
                          ElevatedButton(
                            onPressed: _loadCategories,
                            child: const Text('Tải lại'),
                          ),
                        ],
                      ),
                    )
                  : Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: GridView.builder(
                        padding: const EdgeInsets.only(top: 16.0, bottom: 110.0),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 1.2,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                        ),
                        itemCount: _categories.length,
                        itemBuilder: (context, index) {
                          final category = _categories[index];
                          final categoryId = category['id'] as int;
                          final name = category['name'] ?? 'Chuyên khoa';
                          
                          final specColor = _colorsPalette[index % _colorsPalette.length];
                          final specIcon = _iconsPalette[index % _iconsPalette.length];

                          return Card(
                            elevation: 6,
                            color: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(color: specColor.withOpacity(0.5)),
                            ),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () => widget.onNext({
                                'specialty': name,
                                'categoryId': categoryId,
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
                                    child: (category['image_url'] != null && category['image_url'].toString().isNotEmpty)
                                        ? ClipOval(
                                            child: Image.network(
                                              category['image_url'].toString(),
                                              width: 36,
                                              height: 36,
                                              fit: BoxFit.cover,
                                              errorBuilder: (c, e, s) => Icon(specIcon, size: 36, color: specColor),
                                            ),
                                          )
                                        : Icon(specIcon, size: 36, color: specColor),
                                  ),
                                  const SizedBox(height: 12),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                                    child: Text(
                                      name,
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
