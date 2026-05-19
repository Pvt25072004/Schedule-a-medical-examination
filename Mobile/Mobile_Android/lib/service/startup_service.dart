import 'package:flutter/material.dart';
import 'auth_service.dart';
import 'category_service.dart';
import '../screens/home.dart';
import '../screens/doctor_dashboard.dart';
import '../welcome/onboarding.dart';
import '../welcome/welcome.dart';
import '../dashboard.dart';

class StartupService {
  static final CategoryService _categoryService = CategoryService();
  static final AuthService _authService = AuthService();

  /// Khởi tạo và xác định màn hình bắt đầu
  static Future<Map<String, dynamic>> initialize(BuildContext context) async {
    final startTime = DateTime.now();

    // 1. Khởi tạo Core (Auth state)
    await AuthService.init();
    final user = AuthService.currentUser;

    Widget nextScreen;
    List<dynamic> initialCategories = [];

    if (user != null) {
      try {
        // 2. Lấy dữ liệu người dùng (Timeout 3s để không treo Splash)
        final userData = await _authService.fetchUserData(user.uid).timeout(const Duration(seconds: 3));
        final role = userData['role'] as String? ?? 'patient';

        if (role.toLowerCase() == 'doctor' || role == 'Bác sĩ') {
          nextScreen = const DoctorDashboardScreen();
        } else {
          // Bệnh nhân - Tải thêm chuyên khoa (dữ liệu nhẹ, Timeout 2s)
          initialCategories = await _categoryService.fetchCategories().timeout(const Duration(seconds: 2));
          
          final bool isOnboardingNeeded = userData['is_onboarding_needed'] == true;
          final bool isProfileIncomplete = !_isProfileComplete(userData);

          if (isOnboardingNeeded || isProfileIncomplete) {
            nextScreen = const OnboardingFlowScreen();
          } else {
            nextScreen = const MainScreen();
          }
        }
      } catch (e) {
        debugPrint('⚠️ Startup Error (Failsafe): $e');
        nextScreen = const WelcomeScreen(); // Fallback về Welcome nếu lỗi
      }
    } else {
      nextScreen = const WelcomeScreen();
    }

    // 3. Đảm bảo thời gian hiển thị tối thiểu (800ms)
    final elapsed = DateTime.now().difference(startTime);
    if (elapsed < const Duration(milliseconds: 800)) {
      await Future.delayed(const Duration(milliseconds: 800) - elapsed);
    }

    return {
      'nextScreen': nextScreen,
      'categories': initialCategories,
    };
  }

  static bool _isProfileComplete(Map<String, dynamic> userData) {
    final role = userData['role'] as String? ?? '';
    final displayName = userData['displayName'] as String? ?? '';
    final dob = userData['dateOfBirth'] as String? ?? '';
    final address = userData['address'] as Map? ?? {};
    final province = address['province'] as String? ?? '';
    final district = address['district'] as String? ?? '';
    final street = address['street'] as String? ?? '';

    return role != 'UNASSIGNED' &&
        displayName.isNotEmpty &&
        dob.isNotEmpty &&
        province.isNotEmpty &&
        district.isNotEmpty &&
        street.isNotEmpty;
  }
}
