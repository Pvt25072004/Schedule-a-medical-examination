import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import 'help_page.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import 'legal_page.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../logics/auth/providers/auth_provider.dart';
import '../../../logics/user/providers/user_provider.dart';
import 'package:provider/provider.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../medical_records/my_medical_records_page.dart'; // To be refactored
import '../../organisms/profile/profile_header.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../organisms/profile/profile_card.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../molecules/setting_item.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

// --- Cài đặt Màu Chủ đạo Mới (Teal - Xanh Ngọc) ---




class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 900),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.0, 1.0, curve: Curves.easeInOut),
    ));
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.4),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.2, 1.0, curve: Curves.easeOutCubic),
    ));
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadUserData();
    });
    _animationController.forward();
  }

  Future<void> _loadUserData() async {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;
    if (user == null) return;

    final userProvider = context.read<UserProvider>();
    if (userProvider.userData == null) {
      await userProvider.fetchUserData(user.id);
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // --- Widget helper cho các mục cài đặt NÂNG CAO ---
  Widget _buildAdvancedSettingItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color iconColor = AppColors.primary,
    required int delayFactor,
  }) {
    return SettingItem(
      icon: icon,
      title: title,
      subtitle: subtitle,
      onTap: onTap,
      iconColor: iconColor,
      opacityAnimation: Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
          parent: _animationController,
          curve: Interval(
            (0.3 + delayFactor * 0.1).clamp(0.0, 1.0),
            1.0,
            curve: Curves.easeOut,
          ),
        ),
      ),
      slideAnimation: Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(
        CurvedAnimation(
          parent: _animationController,
          curve: Interval(
            (0.3 + delayFactor * 0.1).clamp(0.0, 1.0),
            1.0,
            curve: Curves.easeOutCubic,
          ),
        ),
      ),
    );
  }

  // --- PROFILE CARD ---
  Widget _buildProfileCard(
      String displayName, String userEmail, String? photoUrl) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: AnimatedBuilder(
        animation: _slideAnimation,
        builder: (context, child) {
          return Transform.translate(
            offset: _slideAnimation.value,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: ProfileCard(
                displayName: displayName,
                userEmail: userEmail,
                photoUrl: photoUrl,
                primaryColor: AppColors.primary,
                primaryDarkColor: AppColors.primaryDark,
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final userProvider = context.watch<UserProvider>();
    final userData = userProvider.userData;
    final user = authProvider.currentUser;

    final displayName = userData?['displayName'] ?? 'Đang tải...';
    final userEmail = userData?['email'] ?? (user?.email ?? 'Đang tải...');
    final photoUrl = (userData?['photoUrl'] != null &&
            (userData!['photoUrl'] as String).isNotEmpty)
        ? userData!['photoUrl'] as String
        : null;

    if (userProvider.isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SingleChildScrollView(
        // Padding bottom lớn hơn 110 để đảm bảo cuộn hết trên BottomNavBar
        padding: const EdgeInsets.only(bottom: 110),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- CUSTOM HEADER VÀ PROFILE CARD ---
            Stack(
              clipBehavior: Clip.none,
              children: [
                const ProfileHeader(),
                Positioned(
                  top: 110,
                  left: 0,
                  right: 0,
                  child: _buildProfileCard(displayName, userEmail, photoUrl),
                ),
              ],
            ),

            const SizedBox(height: 120),

            // --- CÁC MỤC TÍNH NĂNG CHÍNH ---
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(left: 4.0, bottom: 8.0),
                    child: Text('Quản lý Dịch vụ',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey)),
                  ),

                  // Lịch hẹn
                  _buildAdvancedSettingItem(
                    icon: Icons.calendar_today_outlined,
                    title: 'Lịch hẹn & Theo dõi',
                    subtitle: 'Xem, hủy và quản lý lịch khám sắp tới',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Chức năng sắp có')),
                      );
                    },
                    iconColor: Colors.blueAccent,
                    delayFactor: 1,
                  ),

                  // Thanh toán
                  _buildAdvancedSettingItem(
                    icon: Icons.payment,
                    title: 'Thanh toán & Hóa đơn',
                    subtitle: 'Quản lý phương thức thanh toán và lịch sử',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Chức năng sắp có')),
                      );
                    },
                    iconColor: Colors.orange,
                    delayFactor: 2,
                  ),

                  // Hồ sơ Sức khỏe
                  _buildAdvancedSettingItem(
                    icon: Icons.medical_services_outlined,
                    title: 'Hồ sơ Sức khỏe',
                    subtitle: 'Lịch sử bệnh án, kết quả xét nghiệm',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const MyMedicalRecordsPage()),
                      );
                    },
                    iconColor: Colors.redAccent,
                    delayFactor: 3,
                  ),

                  // Ưu đãi & Khuyến mãi
                  _buildAdvancedSettingItem(
                    icon: Icons.local_offer_outlined,
                    title: 'Ưu đãi & Khuyến mãi',
                    subtitle: 'Xem mã giảm giá và chương trình tích điểm',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Chức năng sắp có')),
                      );
                    },
                    iconColor: AppColors.primary,
                    delayFactor: 4,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            // --- PHẦN HỖ TRỢ & PHÁP LÝ ---
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(left: 4.0, bottom: 8.0),
                    child: Text('Hỗ trợ & Thông tin',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey)),
                  ),

                  // Trợ giúp & Hỗ trợ
                  _buildAdvancedSettingItem(
                    icon: Icons.support_agent,
                    title: 'Trung tâm Trợ giúp',
                    subtitle: 'Liên hệ CSKH, FAQ và báo cáo sự cố',
                    onTap: () {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const HelpPage()));
                    },
                    iconColor: Colors.deepPurple,
                    delayFactor: 5,
                  ),

                  // Pháp lý (Legal)
                  _buildAdvancedSettingItem(
                    icon: Icons.gavel_outlined,
                    title: 'Pháp lý & Điều khoản',
                    subtitle: 'Điều khoản sử dụng, chính sách bảo mật',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LegalPage()),
                      );
                    },
                    iconColor: Colors.brown,
                    delayFactor: 6,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            // --- Phiên bản và Bản quyền ---
            Center(
              child: Column(
                children: [
                  const Text('Phiên bản 4.0.0 (UI Tối ưu)',
                      style: TextStyle(fontSize: 13, color: Colors.grey)),
                  Text('© 2024 HealthApp',
                      style: TextStyle(fontSize: 13, color: Colors.grey[700])),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}



