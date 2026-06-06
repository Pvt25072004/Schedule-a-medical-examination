import 'package:flutter/material.dart';
import '../../service/hospital_service.dart';

class Step2HospitalSelection extends StatefulWidget {
  final String cityName;
  final Color? cityColor;
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;

  const Step2HospitalSelection({
    super.key,
    required this.cityName,
    this.cityColor,
    required this.onNext,
    required this.onBack,
  });

  @override
  State<Step2HospitalSelection> createState() => _Step2HospitalSelectionState();
}

class _Step2HospitalSelectionState extends State<Step2HospitalSelection> {
  final HospitalService _hospitalService = HospitalService();
  List<dynamic> _hospitals = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHospitals();
  }

  Future<void> _loadHospitals() async {
    setState(() => _isLoading = true);
    try {
      final data = await _hospitalService.fetchHospitals(city: widget.cityName);
      setState(() {
        _hospitals = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

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
                'Chọn bệnh viện tại ${widget.cityName}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                'Danh sách các bệnh viện hoạt động tại khu vực này.',
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
              : _hospitals.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.medical_services_outlined, size: 60, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          Text(
                            'Hiện chưa có bệnh viện tại ${widget.cityName}',
                            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                          ),
                          const SizedBox(height: 8),
                          ElevatedButton(
                            onPressed: _loadHospitals,
                            child: const Text('Thử lại'),
                          )
                        ],
                      ),
                    )
                  : Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: ListView.builder(
                        padding: const EdgeInsets.only(top: 16, bottom: 100.0),
                        itemCount: _hospitals.length,
                        itemBuilder: (context, index) {
                          final hospital = _hospitals[index];
                          final hospitalId = hospital['id'] as int;
                          final name = hospital['name'] ?? 'Bệnh viện';
                          final address = hospital['address'] ?? 'N/A';
                          
                          // Fallback values cho UI
                          final cardColor = widget.cityColor ?? Colors.blue;
                          final rating = 4.8;
                          final categoriesCount = (hospital['categories'] as List?)?.length ?? 3;

                          final itemData = {
                            'hospital': name,
                            'hospitalId': hospitalId,
                          };

                          return InkWell(
                            onTap: () => widget.onNext(itemData),
                            borderRadius: BorderRadius.circular(16),
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
                                    Row(
                                      children: [
                                        Icon(Icons.local_hospital, color: cardColor, size: 24),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Text(
                                            name,
                                            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.black87),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            const Icon(Icons.star, color: Colors.amber, size: 16),
                                            const SizedBox(width: 4),
                                            Text('$rating', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                                          ],
                                        ),
                                      ],
                                    ),

                                    const Divider(height: 20, thickness: 0.5),

                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Icon(Icons.location_on, size: 16, color: Colors.grey[500]),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            address, 
                                            style: TextStyle(color: Colors.grey[600], fontSize: 13)
                                          )
                                        ),
                                      ],
                                    ),

                                    const SizedBox(height: 12),

                                    Wrap(
                                      spacing: 8.0,
                                      runSpacing: 8.0,
                                      children: [
                                        _buildInfoChip(Icons.medical_services, '$categoriesCount chuyên khoa', Colors.deepOrange),
                                        _buildInfoChip(Icons.access_time_filled, 'Đang mở cửa', const Color(0xFF48A1F3)),
                                      ],
                                    ),

                                    const SizedBox(height: 12),

                                    SizedBox(
                                      width: double.infinity,
                                      child: ElevatedButton.icon(
                                        onPressed: () => widget.onNext(itemData),
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