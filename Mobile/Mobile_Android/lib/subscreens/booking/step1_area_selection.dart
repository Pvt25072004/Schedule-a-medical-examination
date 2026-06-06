// step1_area_selection.dart (Đã sửa UI Khung và Icon Khu vực)
import 'package:flutter/material.dart';

import '../../service/city_service.dart';

class Step1AreaSelection extends StatefulWidget {
  final Function(Map<String, dynamic>) onNext;
  const Step1AreaSelection({super.key, required this.onNext});

  @override
  State<Step1AreaSelection> createState() => _Step1AreaSelectionState();
}

class _Step1AreaSelectionState extends State<Step1AreaSelection> {
  String? _expandedArea;
  final CityService _cityService = CityService();
  bool _isLoading = true;

  final Map<String, List<Map<String, dynamic>>> areas = {
    'Miền Bắc': [],
    'Miền Trung': [],
    'Miền Nam': [],
  };

  @override
  void initState() {
    super.initState();
    _loadCities();
  }

  Future<void> _loadCities() async {
    final cities = await _cityService.fetchCities();
    if (mounted) {
      setState(() {
        // Xóa dữ liệu cũ trước khi nạp mới để tránh trùng lặp nếu gọi lại
        areas['Miền Bắc']?.clear();
        areas['Miền Trung']?.clear();
        areas['Miền Nam']?.clear();

        for (var city in cities) {
          // Lấy thuộc tính area (hoặc mien/region nếu API thay đổi)
          final area = (city['area'] ?? city['mien'] ?? city['region'])?.toString().trim();
          if (areas.containsKey(area)) {
            areas[area]!.add({
              'name': city['name'],
              'hospitals': city['hospitalCount'] ?? 0,
              'color': area == 'Miền Bắc' ? const Color(0xFF2FA8E0) : (area == 'Miền Trung' ? Colors.orange : Colors.redAccent),
            });
          }
        }
        _isLoading = false;
      });
    }
  }

  // --- Widget helper để hiển thị Icon/Ảnh Khu vực ---
  Widget _buildRegionIcon(String areaName, Color color) {
    String assetPath;
    IconData fallbackIcon;

    switch (areaName) {
      case 'Miền Bắc':
        assetPath = 'assets/images/north_region.png';
        fallbackIcon = Icons.north_east_outlined;
        break;
      case 'Miền Trung':
        assetPath = 'assets/images/central_region.png';
        fallbackIcon = Icons.trending_neutral;
        break;
      case 'Miền Nam':
        assetPath = 'assets/images/south_region.png';
        fallbackIcon = Icons.south_east_outlined;
        break;
      default:
        assetPath = '';
        fallbackIcon = Icons.location_on_outlined;
    }

    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: color.withOpacity(0.15),
      ),
      child: Center(
        child: Image.asset(
          assetPath,
          height: 30,
          width: 30,
          color: color, // Màu sắc cho ảnh (nếu ảnh là SVG hoặc monochrome PNG)
          errorBuilder: (context, error, stackTrace) {
            // Fallback sang Icon nếu không tìm thấy ảnh
            return Icon(fallbackIcon, size: 28, color: color);
          },
        ),
      ),
    );
  }


  // Widget để xây dựng icon + hoặc - (Kích thước to hơn)
  Widget _buildExpansionIcon(String areaName, Color color) {
    bool isExpanded = _expandedArea == areaName;
    return Container(
      width: 36, // Tăng kích thước
      height: 36,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withOpacity(0.1),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Icon(
        isExpanded ? Icons.remove : Icons.add, // Dùng icon + - thường, to hơn
        color: color,
        size: 24, // Tăng kích thước icon
      ),
    );
  }

  // Widget cho mỗi dòng thành phố
  Widget _buildCityTile(Map<String, dynamic> cityData, Color areaAccentColor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.grey.shade200,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => widget.onNext({'city': cityData['name'], 'color': cityData['color']}),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: cityData['color'].withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.location_on, color: cityData['color'], size: 24),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        cityData['name'],
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${cityData['hospitals']} bệnh viện',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () => widget.onNext({'city': cityData['name'], 'color': cityData['color']}),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: areaAccentColor,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    minimumSize: Size.zero,
                  ),
                  child: const Text('Chọn', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // --- Header Cố định ---
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Colors.grey.shade200, width: 1)),
          ),
          child: const Text(
            'Chọn Tỉnh/Thành Phố để xem bệnh viện',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ),
        // --- Danh sách thành phố ---
        if (_isLoading)
          const Expanded(child: Center(child: CircularProgressIndicator()))
        else
          Expanded(
            child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: ListView(
              padding: const EdgeInsets.only(top: 16.0, bottom: 100.0),
              children: areas.keys.map((areaName) {
                final Color areaAccentColor = areaName == 'Miền Bắc'
                    ? const Color(0xFF48A1F3)
                    : areaName == 'Miền Trung'
                    ? Colors.orange
                    : Colors.redAccent;

                bool isCurrentAreaExpanded = _expandedArea == areaName;

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // --- Header Khu Vực (Có khung viền) ---
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _expandedArea = isCurrentAreaExpanded ? null : areaName;
                        });
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8.0),
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isCurrentAreaExpanded ? areaAccentColor : Colors.grey.shade300,
                            width: isCurrentAreaExpanded ? 1.5 : 1.0,
                          ),
                          boxShadow: isCurrentAreaExpanded
                              ? [BoxShadow(color: areaAccentColor.withOpacity(0.1), blurRadius: 4)]
                              : null,
                        ),
                        child: Row(
                          children: [
                            _buildRegionIcon(areaName, areaAccentColor),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                areaName,
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey[800],
                                ),
                              ),
                            ),
                            _buildExpansionIcon(areaName, areaAccentColor),
                          ],
                        ),
                      ),
                    ),

                    // --- Danh sách thành phố (hiển thị khi mở rộng) ---
                    if (isCurrentAreaExpanded)
                      Padding(
                        padding: const EdgeInsets.only(left: 8.0, right: 8.0, bottom: 8.0),
                        child: Column(
                          children: areas[areaName]!.map((city) {
                            return _buildCityTile(city, areaAccentColor);
                          }).toList(),
                        ),
                      ),
                  ],
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }
}