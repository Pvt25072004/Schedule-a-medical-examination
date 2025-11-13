import 'package:clinic_booking_system/subscreens/settings/help.dart';
import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:clinic_booking_system/welcome/welcome.dart';
import 'package:intl/intl.dart';
import 'dart:async';

import '../subscreens/settings/editprofile.dart';
import '../subscreens/settings/legal.dart';
import '../subscreens/settings/notification.dart';

// --- Cài đặt Màu Chủ đạo (Đặt ở cấp độ này để đảm bảo sử dụng nhất quán) ---
const Color primaryColor = Colors.greenAccent;
const Color primaryDarkColor = Color(0xFF1B5E20);

class SettingScreen extends StatefulWidget {
  const SettingScreen({super.key});

  @override
  State<SettingScreen> createState() => _SettingScreenState();
}

class _SettingScreenState extends State<SettingScreen> {
  Map<dynamic, dynamic>? userData;
  StreamSubscription<DatabaseEvent>? _userSubscription;

  @override
  void initState() {
    super.initState();
    _subscribeToUserData();
  }

  // Thêm hàm này vào class _SettingScreenState trong SettingScreen.dart

  void _showLogoutConfirmation() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Text('Xác nhận Đăng xuất'),
          content: const Text(
              'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?'),
          actions: [
            // Nút HỦY
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop(); // Đóng hộp thoại
              },
              child: const Text('HỦY', style: TextStyle(color: Colors.black54)),
            ),
            // Nút ĐỒNG Ý
            ElevatedButton(
              onPressed: () {
                Navigator.of(dialogContext).pop(); // Đóng hộp thoại
                _handleLogout(); // Thực hiện hành động đăng xuất
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red, // Màu đỏ cho hành động nguy hiểm
                foregroundColor: Colors.white,
              ),
              child: const Text('ĐỒNG Ý'),
            ),
          ],
        );
      },
    );
  }

  void _subscribeToUserData() {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final ref = FirebaseDatabase.instance.ref('users/${user.uid}');

    _userSubscription = ref.onValue.listen((event) {
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
    _userSubscription?.cancel();
    super.dispose();
  }

  Future<void> _handleLogout() async {
    await FirebaseAuth.instance.signOut();
    if (context.mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WelcomeScreen()),
      );
    }
  }

  // --- Widget helper cho các mục cài đặt chung ---
  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Widget? trailing,
    Color iconColor = primaryColor,
  }) {
    return Card(
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: iconColor),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle,
            style: TextStyle(fontSize: 12, color: Colors.grey[600])),
        trailing: trailing ??
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
        onTap: onTap,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Tên người dùng và thông tin cơ bản
    final displayName = userData?['displayName'] ?? 'Tên người dùng';
    final userEmail = userData?['email'] ?? 'Chưa cập nhật email';
    final userPhone = userData?['phone'] ?? 'N/A';
    final photoUrl = (userData?['photoUrl'] != null &&
            (userData!['photoUrl'] as String).isNotEmpty)
        ? userData!['photoUrl'] as String
        : null;

    if (userData == null && FirebaseAuth.instance.currentUser != null) {
      return const Center(
          child: CircularProgressIndicator(color: primaryColor));
    }

    return Scaffold(
      backgroundColor: Colors.white, // ĐỒNG BỘ BACKGROUND LÀ TRẮNG
      appBar: AppBar(
        title: Column(
          // Căn lề trái cho nội dung Column
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment:
              MainAxisAlignment.center, // Căn giữa theo chiều dọc
          children: [
            // 1. Tiêu đề chính
            const Text(
              "Cài đặt",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white, // Chữ trắng trên nền primaryColor
              ),
            ),
            // 2. Subheader mô tả
            Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Text(
                "Quản lý tài khoản và tùy chỉnh",
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Colors.white.withOpacity(0.8) // Màu trắng mờ hơn
                    ),
              ),
            ),
          ],
        ),
        backgroundColor: primaryColor, // Xanh lá Accent
        foregroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
            16, 16, 16, 110), // THÊM PADDING BOTTOM 100PX
        children: [
          // --- 1. THÔNG TIN NGƯỜI DÙNG & EDIT PROFILE ---
          Card(
            elevation: 2,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: InkWell(
              onTap: () {
                // CHUYỂN THẲNG ĐẾN TRANG CHỈNH SỬA HỒ SƠ
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const EditProfileScreen()),
                );
              },
              borderRadius: BorderRadius.circular(12),
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(vertical: 15, horizontal: 10),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: primaryColor.withOpacity(0.2),
                      backgroundImage:
                          photoUrl != null ? NetworkImage(photoUrl) : null,
                      child: photoUrl == null
                          ? const Icon(Icons.person,
                              size: 30, color: primaryColor)
                          : null,
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(displayName,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 18)),
                          Text(userEmail,
                              style: TextStyle(
                                  fontSize: 14, color: Colors.grey[600])),
                          Text('ID: $userPhone',
                              style: TextStyle(
                                  fontSize: 14, color: Colors.grey[600])),
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

          const SizedBox(height: 20),

          // --- KHỐI 1: TÙY CHỈNH CHỨC NĂNG (Thông báo, Lịch hẹn, Ngôn ngữ) ---

          // Thông báo
          _buildSettingTile(
            icon: Icons.notifications_active_outlined,
            title: 'Thông báo',
            subtitle: 'Cấu hình thông báo và nhắc nhở',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => const NotificationSettingsScreen()),
              );
            },
            iconColor: Colors.redAccent,
          ),

          // Lịch hẹn
          _buildSettingTile(
            icon: Icons.calendar_month,
            title: 'Lịch hẹn',
            subtitle: 'Tùy chỉnh lịch khám và nhắc nhở',
            onTap: () {
              showAppSnackBar(context, 'Quản lý Lịch hẹn (sắp có)');
            },
            iconColor: Colors.blueAccent,
          ),

          // Ngôn ngữ & Khu vực
          _buildSettingTile(
            icon: Icons.language,
            title: 'Ngôn ngữ & Khu vực',
            subtitle: 'Thay đổi ngôn ngữ và múi giờ',
            onTap: () {
              showAppSnackBar(context, 'Chọn Ngôn ngữ (sắp có)');
            },
            iconColor: Colors.teal,
          ),

          // --- KHỐI 2: BẢO MẬT & PHÁP LÝ ---

          // Quyền riêng tư
          _buildSettingTile(
            icon: Icons.privacy_tip_outlined,
            title: 'Quyền riêng tư',
            subtitle: 'Kiểm soát quyền riêng tư và dữ liệu',
            onTap: () {
              showAppSnackBar(context, 'Chính sách Quyền riêng tư (sắp có)');
            },
            iconColor: Colors.orange,
          ),

          // Bảo mật
          _buildSettingTile(
            icon: Icons.lock_outline,
            title: 'Bảo mật',
            subtitle: 'Bảo vệ tài khoản của bạn',
            onTap: () {
              showAppSnackBar(context, 'Cài đặt Bảo mật (sắp có)');
            },
            iconColor: Colors.purple,
          ),

          // Thanh toán
          _buildSettingTile(
            icon: Icons.credit_card,
            title: 'Thanh toán',
            subtitle: 'Quản lý phương thức thanh toán',
            onTap: () {
              showAppSnackBar(context, 'Quản lý Thanh toán (sắp có)');
            },
            iconColor: Colors.indigo,
          ),

          // Pháp lý (Legal)
          _buildSettingTile(
            icon: Icons.description_outlined,
            title: 'Pháp lý',
            subtitle: 'Điều khoản và chính sách',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const LegalScreen()),
              );
            },
            iconColor: Colors.brown,
          ),

          // Trợ giúp & Hỗ trợ
          _buildSettingTile(
            icon: Icons.help_outline,
            title: 'Trợ giúp & Hỗ trợ',
            subtitle: 'Liên hệ và câu hỏi thường gặp',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const HelpScreen())
              );
            },
            iconColor: Colors.blueGrey,
          ),

          const SizedBox(height: 30),

          // --- 3. ĐĂNG XUẤT (VỊ TRÍ HỢP LÝ NHẤT) ---
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              // Gọi hàm xác nhận thay vì _handleLogout trực tiếp
              onPressed: _showLogoutConfirmation,
              icon: const Icon(Icons.logout, color: Colors.red),
              label: const Text('Đăng xuất',
                  style: TextStyle(
                      fontSize: 16,
                      color: Colors.red,
                      fontWeight: FontWeight.bold)),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: const BorderSide(color: Colors.red),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),

          const SizedBox(height: 40),

          // --- Phiên bản và Bản quyền ---
          Center(
            child: Column(
              children: [
                const Text('Phiên bản 2.5.1',
                    style: TextStyle(fontSize: 13, color: Colors.grey)),
                Text('© 2024 HealthApp',
                    style: TextStyle(fontSize: 13, color: Colors.grey[700])),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
