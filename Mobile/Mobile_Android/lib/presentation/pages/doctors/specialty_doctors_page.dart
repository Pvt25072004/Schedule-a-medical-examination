import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../service/doctor_service.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../booking/booking_page.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../organisms/doctors/detailed_doctor_card.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class SpecialtyDoctorsPage extends StatefulWidget {
  final Map<String, dynamic> category;

  const SpecialtyDoctorsPage({super.key, required this.category});

  @override
  State<SpecialtyDoctorsPage> createState() => _SpecialtyDoctorsPageState();
}

class _SpecialtyDoctorsPageState extends State<SpecialtyDoctorsPage> {
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

    final String catName = widget.category['name'] ?? 'Chuyên khoa';

    return Scaffold(
      backgroundColor: const Color(0xFFF6F9F8),
      body: RefreshIndicator(
        onRefresh: _loadDoctors,
        color: AppColors.primary,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // 🌟 STUNNING APPBAR WITH GRADIENT
            SliverAppBar(
              expandedHeight: 120.0,
              floating: false,
              pinned: true,
              elevation: 8,
              shadowColor: AppColors.primary.withOpacity(0.2),
              backgroundColor: AppColors.primary,
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
                      colors: [AppColors.primary, AppColors.primary.withOpacity(0.8)],
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
                      child: CircularProgressIndicator(color: AppColors.primary),
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
                              return DetailedDoctorCard(
                                doctor: doctor,
                                themeColor: AppColors.primary,
                                onBookTap: () {
                                  // Enrich doctor object with category context if needed
                                  final doctorData = Map<String, dynamic>.from(doctor);
                                  if (!doctorData.containsKey('category')) {
                                    doctorData['category'] = widget.category;
                                  }

                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => BookingPage(
                                        initialDoctorData: doctorData,
                                      ),
                                    ),
                                  );
                                },
                              );
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
}

