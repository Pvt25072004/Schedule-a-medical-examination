import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import '../service/doctor_service.dart';
import 'booking.dart';

class SpecialtyDoctorsScreen extends StatefulWidget {
  final Map<String, dynamic> category;

  const SpecialtyDoctorsScreen({super.key, required this.category});

  @override
  State<SpecialtyDoctorsScreen> createState() => _SpecialtyDoctorsScreenState();
}

class _SpecialtyDoctorsScreenState extends State<SpecialtyDoctorsScreen> {
  final DoctorService _doctorService = DoctorService();
  bool _isLoading = true;
  List<dynamic> _doctors = [];

  @override
  void initState() {
    super.initState();
    _loadDoctors();
  }

  Future<void> _loadDoctors() async {
    setState(() => _isLoading = true);
    try {
      final catId = widget.category['id'] != null ? int.tryParse(widget.category['id'].toString()) : null;
      if (catId != null) {
        final list = await _doctorService.fetchDoctors(categoryId: catId);
        if (mounted) {
          setState(() {
            _doctors = list;
            _isLoading = false;
          });
        }
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      print('🔥 Load Doctors Error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color primaryThemeColor = Color(0xFF48A1F3);
    final String catName = widget.category['name'] ?? 'Chuyên khoa';

    return Scaffold(
      backgroundColor: const Color(0xFFF6F9F8),
      body: RefreshIndicator(
        onRefresh: _loadDoctors,
        color: primaryThemeColor,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // 🌟 STUNNING APPBAR WITH GRADIENT
            SliverAppBar(
              expandedHeight: 120.0,
              floating: false,
              pinned: true,
              elevation: 8,
              shadowColor: primaryThemeColor.withOpacity(0.2),
              backgroundColor: primaryThemeColor,
              iconTheme: const IconThemeData(color: Colors.white),
              flexibleSpace: FlexibleSpaceBar(
                centerTitle: true,
                title: Text(
                  catName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                    letterSpacing: -0.5,
                  ),
                ),
                background: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [primaryThemeColor, primaryThemeColor.withOpacity(0.8)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                ),
              ),
            ),

            // 🌟 BODY CONTENT
            _isLoading
                ? const SliverFillRemaining(
                    child: Center(
                      child: CircularProgressIndicator(color: primaryThemeColor),
                    ),
                  )
                : _doctors.isEmpty
                    ? SliverFillRemaining(
                        child: _buildEmptyState(),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final doctor = _doctors[index];
                              return _buildDoctorCard(doctor, primaryThemeColor);
                            },
                            childCount: _doctors.length,
                          ),
                        ),
                      ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 16, offset: const Offset(0, 8))
              ],
            ),
            child: const Icon(Icons.person_off_outlined, size: 64, color: Colors.grey),
          ),
          const SizedBox(height: 20),
          const Text(
            'Hiện chưa có Bác sĩ',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
          ),
          const SizedBox(height: 6),
          const Text(
            'Chuyên khoa này hiện đang được cập nhật danh sách.',
            style: TextStyle(fontSize: 13, color: Colors.black45),
          ),
        ],
      ),
    );
  }

  Widget _buildDoctorCard(dynamic doctor, Color themeColor) {
    final String name = (doctor['user']?['full_name'] ?? doctor['name'] ?? 'Bác sĩ chuyên khoa').toString();
    final String specialty = (doctor['category']?['name'] ?? doctor['specialty'] ?? 'Đa khoa').toString();
    final double rating = doctor['rating'] != null ? double.tryParse(doctor['rating'].toString()) ?? 5.0 : 5.0;
    final int reviewCount = doctor['review_count'] != null ? int.tryParse(doctor['review_count'].toString()) ?? 0 : 0;
    
    final String description = (doctor['description'] ?? 'Chưa cập nhật thông tin mô tả chi tiết kinh nghiệm làm việc.').toString();
    final String avatarUrl = (doctor['user']?['avatar'] ?? doctor['avatar_url'] ?? '').toString();

    final hospitalsRaw = doctor['hospitals'] as List?;
    final String hospitalNames = (hospitalsRaw != null && hospitalsRaw.isNotEmpty)
        ? hospitalsRaw.map((h) => h['name']).join(' - ')
        : 'Phòng khám riêng';

    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 8),
          )
        ],
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: () {
          // Gợi ý bấm vào nút đặt lịch ở cuối
        },
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Styled Avatar
                  Container(
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: themeColor.withOpacity(0.3), width: 2),
                    ),
                    child: CircleAvatar(
                      radius: 32,
                      backgroundColor: themeColor.withOpacity(0.1),
                      child: Text(
                        name.isNotEmpty ? name.substring(0, 1) : 'D',
                        style: TextStyle(color: themeColor, fontSize: 24, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Title Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 18,
                            color: Colors.black87,
                            letterSpacing: -0.4,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'Chuyên khoa: $specialty',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        // Dynamic Stars
                        Row(
                          children: [
                            Icon(Icons.star_rounded, size: 18, color: Colors.amber.shade700),
                            const SizedBox(width: 4),
                            Text(
                              rating.toStringAsFixed(1),
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              '($reviewCount+ đánh giá)',
                              style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Divider(height: 1, thickness: 0.8, color: Color(0xFFEEEEEE)),
              ),

              // Hospital Section
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.indigo.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.business_rounded, size: 16, color: Colors.indigo.shade600),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Đơn vị công tác',
                          style: TextStyle(fontSize: 11, color: Colors.black45, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          hospitalNames,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.black87),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),

              // Description Excerpt
              Container(
                padding: const EdgeInsets.all(14),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFFF8F9FB),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  description,
                  style: TextStyle(color: Colors.grey.shade700, fontSize: 12, height: 1.4),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ),

              const SizedBox(height: 18),

              // ACTION BUTTON
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    // Enrich doctor object with category context if needed
                    final doctorData = Map<String, dynamic>.from(doctor);
                    if (!doctorData.containsKey('category')) {
                      doctorData['category'] = widget.category;
                    }

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BookingScreen(
                          initialDoctorData: doctorData,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.calendar_today_outlined, size: 16),
                  label: const Text(
                    'ĐẶT LỊCH KHÁM',
                    style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.5, fontSize: 13),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeColor,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
