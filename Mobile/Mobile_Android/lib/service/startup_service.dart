import 'package:flutter/material.dart';
import 'category_service.dart';
import '../presentation/pages/home/home_page.dart';
import '../presentation/pages/doctors/doctor_dashboard_page.dart';
import '../presentation/pages/welcome/onboarding_page.dart';
import '../presentation/pages/welcome/welcome_page.dart';
import '../dashboard.dart';
import 'package:provider/provider.dart';
import '../logics/auth/providers/auth_provider.dart';
import '../logics/user/providers/user_provider.dart';

class StartupService {
  static final CategoryService _categoryService = CategoryService();
  static Future<Map<String, dynamic>> initialize(BuildContext context) async {
    final startTime = DateTime.now();

    final authProvider = context.read<AuthProvider>();
    // Đảm bảo current user được load (ví dụ check token)
    if (authProvider.currentUser == null) {
       await authProvider.checkAuthStatus(); // Giả sử có hàm này, nếu không thì getCurrentUser
    }
    final user = authProvider.currentUser;

    Widget nextScreen;
    List<dynamic> initialCategories = [];

    if (user != null) {
      try {
        final userProvider = context.read<UserProvider>();
        await userProvider.fetchUserData(user.id);
        final userData = userProvider.userData ?? {};
        final role = userData['role'] as String? ?? 'patient';

        if (role.toLowerCase() == 'doctor' || role == 'Bác sĩ') {
          nextScreen = const DoctorDashboardPage();
        } else {
          // Bệnh nhân - Tải thêm chuyên khoa (dữ liệu nhẹ, Timeout 2s)
          initialCategories = await _categoryService.fetchCategories().timeout(const Duration(seconds: 2));
          
          final bool isOnboardingNeeded = userData['is_onboarding_needed'] == true;
          final bool isProfileIncomplete = !_isProfileComplete(userData);

          if (isOnboardingNeeded || isProfileIncomplete) {
            nextScreen = const OnboardingPage();
          } else {
            nextScreen = const MainScreen();
          }
        }
      } catch (e) {
        debugPrint('⚠️ Startup Error (Failsafe): $e');
        nextScreen = const WelcomePage(); // Fallback về Welcome nếu lỗi
      }
    } else {
      nextScreen = const WelcomePage();
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
