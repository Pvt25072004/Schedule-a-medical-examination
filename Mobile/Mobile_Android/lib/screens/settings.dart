import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:clinic_booking_system/welcome/welcome.dart';
import 'package:intl/intl.dart';
import 'dart:async'; // Cần import này cho StreamSubscription

import '../subscreens/settings/editprofile.dart';

class SettingScreen extends StatefulWidget {
  const SettingScreen({super.key});

  @override
  State<SettingScreen> createState() => _SettingScreenState();
}

class _SettingScreenState extends State<SettingScreen> {
  Map<dynamic, dynamic>? userData;
  // bool _isExpanded = false; // Thuộc tính này không cần dùng nữa vì ExpansionTile tự quản lý

  // Dùng để quản lý kết nối realtime
  StreamSubscription<DatabaseEvent>? _userSubscription;

  @override
  void initState() {
    super.initState();
    _subscribeToUserData();
  }

  // --- HÀM LẮNG NGHE REALTIME DATA ---
  void _subscribeToUserData() {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final ref = FirebaseDatabase.instance.ref('users/${user.uid}');

    // Đăng ký lắng nghe sự kiện onValue (thời gian thực)
    _userSubscription = ref.onValue.listen((event) {
      if (context.mounted) {
        final data = event.snapshot.value;
        if (data != null && data is Map<dynamic, dynamic>) {
          setState(() {
            userData = data;
          });
        } else {
          // Xử lý trường hợp dữ liệu bị xóa/null
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

  // --- HỦY ĐĂNG KÝ KHI WIDGET BỊ HỦY ---
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

  @override
  Widget build(BuildContext context) {
    // Lấy dữ liệu ngày sinh trước khi build widget
    final dobRaw = userData?['dateOfBirth'];
    String dobText = 'N/A';

    if (dobRaw != null) {
      try {
        DateTime dob;
        if (dobRaw is int) {
          // Nếu lưu dưới dạng milliseconds
          dob = DateTime.fromMillisecondsSinceEpoch(dobRaw);
        } else if (dobRaw is String) {
          // Nếu lưu dạng "yyyy-MM-dd" hoặc ISO string
          dob = DateTime.parse(dobRaw);
        } else if (dobRaw is DateTime) {
          dob = dobRaw;
        } else {
          dob = DateTime(1970);
        }
        dobText = DateFormat('dd/MM/yyyy').format(dob);
      } catch (e) {
        dobText = 'N/A';
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFFFFF8F0),
      appBar: AppBar(
        title: const Text("Cài đặt"),
        backgroundColor: Colors.greenAccent,
        foregroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline),
            onPressed: () {
              showAppSnackBar(
                context,
                'Trợ giúp và hỗ trợ (sắp có)',
              );
            },
          ),
        ],
      ),
      body: userData == null && FirebaseAuth.instance.currentUser != null ?
      const Center(child: CircularProgressIndicator(color: Colors.greenAccent)) // Show loading indicator
          : ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: [
          Card(
            elevation: 4,
            shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ExpansionTile(
              leading: CircleAvatar(
                radius: 20,
                backgroundColor: Colors.greenAccent.withOpacity(0.2),
                // FIXED: Check null và empty string trước khi dùng NetworkImage
                backgroundImage: (userData?['photoUrl'] != null &&
                    (userData!['photoUrl'] as String).isNotEmpty)
                    ? NetworkImage(userData!['photoUrl'] as String)
                    : null,
                child: (userData?['photoUrl'] == null ||
                    (userData!['photoUrl'] as String).isEmpty)
                    ? const Icon(Icons.person,
                    size: 20, color: Colors.greenAccent)
                    : null,
              ),
              title: Text(
                userData?['displayName'] ?? 'Tên người dùng',
                style:
                const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: Text(userData?['role'] ?? 'N/A'),
              trailing: const Icon(Icons.keyboard_arrow_down),
              onExpansionChanged: (expanded) {}, // không cần setState

              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildProfileItem(Icons.phone, 'Số điện thoại',
                          userData?['phone'] ?? 'N/A'),
                      _buildProfileItem(
                          Icons.email, 'Email', userData?['email'] ?? 'N/A'),
                      _buildProfileItem(Icons.description, 'Giới thiệu',
                          userData?['bio'] ?? 'Chưa cập nhật'),
                      _buildProfileItem(Icons.location_on, 'Địa chỉ',
                          _getAddressString(userData)),
                      _buildProfileItem(Icons.cake, 'Ngày sinh', dobText),
                      _buildProfileItem(Icons.medical_information, 'Bệnh nền',
                          userData?['medicalHistory'] ?? 'Không có'),
                      const SizedBox(height: 8),
                      TextButton.icon(
                        onPressed: () {

                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const EditProfileScreen()),
                          );
                        },
                        icon: const Icon(Icons.edit, size: 18),
                        label: const Text('Chỉnh sửa hồ sơ'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Card(
            elevation: 2,
            shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.notifications,
                      color: Colors.greenAccent),
                  title: const Text('Thông báo',
                      style: TextStyle(fontWeight: FontWeight.w500)),
                  trailing: Switch(
                    value: true,
                    onChanged: (value) {
                      setState(() {});
                      showAppSnackBar(
                        context,
                        'Thông báo ${value ? 'bật' : 'tắt'}',
                      );
                    },
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading:
                  const Icon(Icons.privacy_tip, color: Colors.greenAccent),
                  title: const Text('Quyền riêng tư',
                      style: TextStyle(fontWeight: FontWeight.w500)),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    showAppSnackBar(
                      context,
                      'Chính sách quyền riêng tư (sắp có)',
                    );
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading:
                  const Icon(Icons.language, color: Colors.greenAccent),
                  title: const Text('Ngôn ngữ',
                      style: TextStyle(fontWeight: FontWeight.w500)),
                  trailing: const Text('Tiếng Việt'),
                  onTap: () {
                    showAppSnackBar(
                      context,
                      'Chọn ngôn ngữ (sắp có)',
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _handleLogout,
              icon: const Icon(Icons.logout, color: Colors.red),
              label: const Text('Đăng xuất',
                  style: TextStyle(fontSize: 16, color: Colors.red)),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: const BorderSide(color: Colors.red),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getAddressString(Map<dynamic, dynamic>? data) {
    if (data == null || data['address'] == null) return 'N/A';
    final address = data['address'] as Map<dynamic, dynamic>?;
    if (address == null) return 'N/A';
    final province = address['province'] ?? '';
    final district = address['district'] ?? '';
    final street = address['street'] ?? '';
    return [province, district, street].where((s) => s.isNotEmpty).join(', ');
  }

  Widget _buildProfileItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.greenAccent),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style:
                    TextStyle(fontSize: 14, color: Colors.grey.shade600)),
                Text(value, style: const TextStyle(fontSize: 16)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}