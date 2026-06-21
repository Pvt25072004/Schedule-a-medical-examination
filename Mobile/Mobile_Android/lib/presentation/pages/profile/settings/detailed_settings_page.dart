import 'security_page.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';
import '../../../../../logics/auth/providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/utils/snackbar_helper.dart';
import '../../welcome/welcome_page.dart';
import '../edit_profile_page.dart';
import '../notification_page.dart';

class DetailedSettingsPage extends StatefulWidget {
  const DetailedSettingsPage({super.key});

  @override
  State<DetailedSettingsPage> createState() => _DetailedSettingsPageState();
}

class _DetailedSettingsPageState extends State<DetailedSettingsPage>
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
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.4), end: Offset.zero).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _showLogoutConfirmation() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
          title: const Text('Xác nhận Đăng xuất'),
          content: const Text(
              'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('HỦY', style: TextStyle(color: Colors.black54)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
                _handleLogout();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r)),
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 10.h),
              ),
              child: const Text('ĐỒNG Ý'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _handleLogout() async {
    await context.read<AuthProvider>().logout();
    if (context.mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const WelcomePage()),
        (route) => false,
      );
    }
  }

  Widget _buildModernSettingItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color iconColor = AppColors.primary,
    int delayFactor = 0,
  }) {
    return FadeTransition(
      opacity: Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
          parent: _animationController,
          curve: Interval((0.3 + delayFactor * 0.05).clamp(0.0, 1.0), 1.0, curve: Curves.easeOut),
        ),
      ),
      child: SlideTransition(
        position: Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero)
            .animate(
          CurvedAnimation(
            parent: _animationController,
            curve: Interval((0.3 + delayFactor * 0.05).clamp(0.0, 1.0), 1.0,
                curve: Curves.easeOutCubic),
          ),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16.r),
          splashColor: iconColor.withOpacity(0.2),
          child: Container(
            margin: EdgeInsets.symmetric(vertical: 6.h),
            padding: EdgeInsets.all(16.w),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.white, Colors.white.withOpacity(0.95)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16.r),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  blurRadius: 12.r,
                  offset: Offset(0, 6.h),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: EdgeInsets.all(12.w),
                  decoration: BoxDecoration(
                    color: iconColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Icon(icon, color: iconColor, size: 24.sp),
                ),
                SizedBox(width: 18.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title,
                          style: TextStyle(
                              fontSize: 16.sp, fontWeight: FontWeight.w700)),
                      SizedBox(height: 4.h),
                      Text(subtitle,
                          style: TextStyle(
                              fontSize: 13.sp, color: Colors.grey[600])),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right, color: Colors.grey, size: 20.sp),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGroupHeader(String title) {
    return Padding(
      padding: EdgeInsets.only(top: 25.h, bottom: 10.h, left: 4.w),
      child: Text(
        title,
        style: TextStyle(
            fontSize: 15.sp, fontWeight: FontWeight.bold, color: Colors.grey),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Khởi tạo ScreenUtil trong build
    ScreenUtil.init(context, designSize: const Size(360, 690));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Cài đặt',
            style: TextStyle(
                fontSize: 24.sp,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryDark)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.primaryDark,
        elevation: 1,
        centerTitle: false,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.primaryDark, size: 24.sp),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildGroupHeader('Tài khoản & Hồ sơ'),
            _buildModernSettingItem(
              icon: Icons.person_outline,
              title: 'Thông tin cá nhân',
              subtitle: 'Chỉnh sửa tên, ảnh đại diện và chi tiết hồ sơ',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const EditProfilePage()),
                );
              },
              iconColor: AppColors.primary,
              delayFactor: 1,
            ),
            _buildModernSettingItem(
              icon: Icons.lock_outline,
              title: 'Bảo mật & Đăng nhập',
              subtitle: 'Thay đổi mật khẩu, xác minh hai bước',
              onTap: () {
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const SecurityPage()));
              },
              iconColor: Colors.purple,
              delayFactor: 2,
            ),
            _buildGroupHeader('Tùy chỉnh Chung'),
            _buildModernSettingItem(
              icon: Icons.notifications_active_outlined,
              title: 'Thông báo',
              subtitle: 'Cấu hình thông báo và nhắc nhở',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const NotificationSettingsPage()),
                );
              },
              iconColor: Colors.redAccent,
              delayFactor: 3,
            ),
            _buildModernSettingItem(
              icon: Icons.language,
              title: 'Ngôn ngữ & Khu vực',
              subtitle: 'Thay đổi ngôn ngữ hiển thị và múi giờ',
              onTap: () {
                showAppSnackBar(context, 'Chọn Ngôn ngữ (sắp có)');
              },
              iconColor: Colors.teal,
              delayFactor: 4,
            ),
            _buildGroupHeader('Pháp lý & Hỗ trợ'),
            _buildModernSettingItem(
              icon: Icons.privacy_tip_outlined,
              title: 'Quyền riêng tư',
              subtitle: 'Kiểm soát quyền riêng tư và dữ liệu',
              onTap: () {
                showAppSnackBar(context, 'Chính sách Quyền riêng tư (sắp có)');
              },
              iconColor: Colors.orange,
              delayFactor: 5,
            ),
            _buildModernSettingItem(
              icon: Icons.help_outline,
              title: 'Trung tâm Trợ giúp',
              subtitle: 'Liên hệ hỗ trợ, câu hỏi thường gặp',
              onTap: () {
                showAppSnackBar(context, 'Mở Trung tâm Trợ giúp (sắp có)');
              },
              iconColor: Colors.blueGrey,
              delayFactor: 6,
            ),
            SizedBox(height: 30.h),
            FadeTransition(
              opacity: _fadeAnimation,
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _showLogoutConfirmation,
                  icon: Icon(Icons.logout, color: Colors.red, size: 20.sp),
                  label: Text('Đăng xuất khỏi tài khoản',
                      style: TextStyle(
                          fontSize: 16.sp,
                          color: Colors.red,
                          fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 16.h),
                    side: BorderSide(color: Colors.red.shade200, width: 1.5.w),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16.r)),
                    backgroundColor: Colors.white,
                  ),
                ),
              ),
            ),
            SizedBox(height: 40.h),
          ],
        ),
      ),
    );
  }
}




