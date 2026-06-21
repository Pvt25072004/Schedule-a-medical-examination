import 'package:flutter/material.dart';
import '../../../service/doctor_service.dart';
import '../booking/booking_page.dart';
import '../../organisms/doctors/doctor_card.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class AllDoctorsPage extends StatefulWidget {
  const AllDoctorsPage({super.key});

  @override
  State<AllDoctorsPage> createState() => _AllDoctorsPageState();
}

class _AllDoctorsPageState extends State<AllDoctorsPage> {
  final DoctorService _doctorService = DoctorService();
  bool _isLoading = true;
  List<dynamic> _allDoctors = [];
  List<dynamic> _filteredDoctors = [];
  
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadDoctors();
  }

  Future<void> _loadDoctors() async {
    try {
      final doctors = await _doctorService.fetchDoctors();
      if (mounted) {
        setState(() {
          _allDoctors = doctors;
          _filteredDoctors = doctors;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  /// Hàm xóa dấu tiếng Việt (Smart Search)
  String _normalizeForSearch(String str) {
    if (str.isEmpty) return "";
    var result = str.toLowerCase();
    
    const withDia = 'áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ';
    const withoutDia = 'aaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';
    for (int i = 0; i < withDia.length; i++) {
      result = result.replaceAll(withDia[i], withoutDia[i]);
    }
    
    // Xóa ký tự đặc biệt, chỉ giữ lại chữ cái và số
    return result.replaceAll(RegExp(r'[^a-z0-9]'), '');
  }

  void _onSearchChanged(String query) {
    if (query.isEmpty) {
      setState(() => _filteredDoctors = _allDoctors);
      return;
    }

    final String normalizedQuery = _normalizeForSearch(query);

    setState(() {
      _filteredDoctors = _allDoctors.where((doc) {
        final String name = doc['user']?['full_name'] ?? doc['name'] ?? '';
        final String specialty = doc['category']?['name'] ?? '';
        
        final String normalizedName = _normalizeForSearch(name);
        final String normalizedSpecialty = _normalizeForSearch(specialty);

        return normalizedName.contains(normalizedQuery) || 
               normalizedSpecialty.contains(normalizedQuery);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor: const Color(0xFFF6F9F8),
      appBar: AppBar(
        title: const Text('Đặt Khám Theo Bác Sĩ', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Header Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Tìm kiếm bác sĩ, chuyên khoa...',
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear, color: Colors.grey),
                  onPressed: () {
                    _searchController.clear();
                    _onSearchChanged('');
                  },
                ),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              ),
            ),
          ),

          // Body
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
              : _filteredDoctors.isEmpty
                ? const Center(
                    child: Text('Không tìm thấy bác sĩ nào.', style: TextStyle(color: Colors.grey, fontSize: 16))
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredDoctors.length,
                    itemBuilder: (context, index) {
                      final doc = _filteredDoctors[index];
                      return DoctorCard(
                        doctor: doc,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BookingPage(initialDoctorData: Map<String, dynamic>.from(doc)),
                            ),
                          );
                        },
                      );
                    },
                  ),
          )
        ],
      ),
    );
  }
}

