import 'package:flutter/material.dart';
import '../service/doctor_service.dart';
import 'booking.dart';

class AllDoctorsScreen extends StatefulWidget {
  const AllDoctorsScreen({super.key});

  @override
  State<AllDoctorsScreen> createState() => _AllDoctorsScreenState();
}

class _AllDoctorsScreenState extends State<AllDoctorsScreen> {
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
    const Color primaryThemeColor = Color(0xFF48A1F3);

    return Scaffold(
      backgroundColor: const Color(0xFFF6F9F8),
      appBar: AppBar(
        title: const Text('Đặt Khám Theo Bác Sĩ', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: primaryThemeColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Header Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: primaryThemeColor,
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24)),
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
              ? const Center(child: CircularProgressIndicator(color: primaryThemeColor))
              : _filteredDoctors.isEmpty
                ? const Center(
                    child: Text('Không tìm thấy bác sĩ nào.', style: TextStyle(color: Colors.grey, fontSize: 16))
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredDoctors.length,
                    itemBuilder: (context, index) {
                      final doc = _filteredDoctors[index];
                      return _buildDoctorCard(doc, context);
                    },
                  ),
          )
        ],
      ),
    );
  }

  Widget _buildDoctorCard(dynamic doctor, BuildContext context) {
    final String name = doctor['user']?['full_name'] ?? doctor['name'] ?? 'Chưa rõ tên';
    final String specialty = doctor['category']?['name'] ?? 'Chưa rõ chuyên khoa';
    final int exp = doctor['experience_years'] ?? 0;
    final int reviewCount = doctor['review_count'] ?? 0;
    final double rating = (doctor['rating'] ?? 5.0).toDouble();

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => BookingScreen(initialDoctorData: Map<String, dynamic>.from(doctor)),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 36,
              backgroundColor: const Color(0xFF48A1F3).withOpacity(0.1),
              child: Text(
                name.isNotEmpty ? name.substring(0, 1) : 'D',
                style: const TextStyle(color: Color(0xFF48A1F3), fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 16),
            
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black87),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    specialty,
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.amber.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 14),
                            const SizedBox(width: 4),
                            Text('$rating', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            Text(' ($reviewCount)', style: TextStyle(color: Colors.grey.shade700, fontSize: 12)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text('$exp năm KN', style: TextStyle(color: Colors.blue.shade700, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
