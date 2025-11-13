import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import '../subscreens/profile/help.dart';
import '../subscreens/profile/legal.dart';
import '../subscreens/profile/setting/setting.dart';

// --- Cài đặt Màu Chủ đạo Mới (Teal - Xanh Ngọc) ---
const Color primaryColor = Color(0xFF00BFA5); // Teal (Xanh ngọc)
const Color primaryDarkColor = Color(0xFF00796B); // Dark Teal
const Color backgroundLight = Color(0xFFF7F7F7); // Màu nền nhẹ

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  Map<dynamic, dynamic>? userData;
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
    _subscribeToUserData();
    _animationController.forward();
  }

  void _subscribeToUserData() {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final ref = FirebaseDatabase.instance.ref('users/${user.uid}');

    ref.onValue.listen((event) {
      if (context.mounted) {
        final data = event.snapshot.value;
        if (data != null && data is Map<dynamic, dynamic>) {
          setState(() {
            userData = data;
          });
        } else {
          setState(() {
            userData = null;
          });
        }
      }
    }, onError: (error) {
      if (context.mounted) {
        showAppSnackBar(context, 'Lỗi tải dữ liệu hồ sơ: $error');
      }
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // --- Widget helper cho các mục cài đặt NÂNG CAO (Rounded List Tile) ---
  Widget _buildAdvancedSettingItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color iconColor = primaryColor,
    required int delayFactor,
  }) {
    // Thêm Animation cho từng item setting
    return FadeTransition(
      opacity: Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(
        parent: _animationController,
        curve: Interval(
          0.3 + delayFactor * 0.15,
          1.0,
          curve: Curves.easeOut,
        ),
      )),
      child: SlideTransition(
        position: Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero)
            .animate(CurvedAnimation(
          parent: _animationController,
          curve: Interval(
            0.3 + delayFactor * 0.15,
            1.0,
            curve: Curves.easeOutCubic,
          ),
        )),
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.08),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: onTap,
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: iconColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(icon, color: iconColor, size: 24),
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(title,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w700, fontSize: 16)),
                          const SizedBox(height: 2),
                          Text(subtitle,
                              style: TextStyle(
                                  fontSize: 13, color: Colors.grey[600])),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios,
                        size: 16, color: Colors.grey),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  // --- Widget cho Avatar hiển thị chữ cái đầu ---
  Widget _buildInitialsAvatar(String name) {
    String initials = 'NV';

    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [primaryColor, primaryDarkColor.withOpacity(0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: primaryColor.withOpacity(0.4),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Center(
        child: Text(
          initials,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 26,
          ),
        ),
      ),
    );
  }

  // --- CUSTOM HEADER (Chỉnh sửa Bo góc & Padding) ---
  Widget _buildCustomHeader() {
    return Container(
      height: 180,
      width: double.infinity,
      alignment: Alignment.topLeft,
      padding: const EdgeInsets.fromLTRB(16, 55, 16, 0),
      decoration: const BoxDecoration(
        color: primaryDarkColor,
        // THÊM BO GÓC DƯỚI
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(25),
          bottomRight: Radius.circular(25),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Hồ sơ của bạn",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              // TĂNG KHOẢNG CÁCH GIỮA TIÊU ĐỀ VÀ PHỤ ĐỀ
              Text(
                "Quản lý tất cả thông tin cá nhân",
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
          // Nút Settings
          InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              );
            },
            child: const Icon(
              Icons.settings_outlined,
              color: Colors.white,
              size: 26,
            ),
          ),
        ],
      ),
    );
  }

  // --- PROFILE CARD (Giữ nguyên) ---
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
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.18),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        // Avatar
                        photoUrl != null
                            ? CircleAvatar(
                                radius: 30,
                                backgroundImage: NetworkImage(photoUrl),
                              )
                            : _buildInitialsAvatar(displayName),

                        const SizedBox(width: 15),

                        // Tên và Email
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(displayName,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 22)),
                              Text(userEmail,
                                  style: TextStyle(
                                      fontSize: 14, color: Colors.grey[600])),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Các nhãn/tag
                    Wrap(
                      spacing: 10.0,
                      runSpacing: 8.0,
                      children: [
                        _buildProfileTag(
                          icon: Icons.star_rate_rounded,
                          text: 'Thành viên VIP',
                          bgColor: const Color(0xFFFDD835),
                          textColor: Colors.black87,
                        ),
                        _buildProfileTag(
                          icon: Icons.health_and_safety,
                          text: 'Bảo hiểm Y tế A',
                          bgColor: primaryColor.withOpacity(0.1),
                          textColor: primaryColor,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  // --- Widget helper cho Tag (Giữ nguyên) ---
  Widget _buildProfileTag({
    required IconData icon,
    required String text,
    required Color bgColor,
    required Color textColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: textColor, size: 14),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
                fontSize: 12, color: textColor, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final displayName = userData?['displayName'] ?? 'Nguyễn Văn A';
    final userEmail = userData?['email'] ?? 'nguyenvanana@email.com';
    final photoUrl = (userData?['photoUrl'] != null &&
            (userData!['photoUrl'] as String).isNotEmpty)
        ? userData!['photoUrl'] as String
        : null;

    if (userData == null && FirebaseAuth.instance.currentUser != null) {
      return const Scaffold(
        backgroundColor: backgroundLight,
        body: Center(child: CircularProgressIndicator(color: primaryColor)),
      );
    }

    return Scaffold(
      backgroundColor: backgroundLight,
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
                _buildCustomHeader(),
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
                      showAppSnackBar(context, 'Quản lý Lịch hẹn (sắp có)');
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
                      showAppSnackBar(context, 'Quản lý Thanh toán (sắp có)');
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
                      showAppSnackBar(context, 'Mở Hồ sơ Sức khỏe (sắp có)');
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
                      showAppSnackBar(context, 'Mở Ưu đãi (sắp có)');
                    },
                    iconColor: Colors.green,
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
                              builder: (_) => const HelpScreen()));
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
                        MaterialPageRoute(builder: (_) => const LegalScreen()),
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
