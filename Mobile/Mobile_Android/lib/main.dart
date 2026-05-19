import 'package:clinic_booking_system/firebase_options.dart';
import 'package:clinic_booking_system/screens/home.dart';
import 'package:clinic_booking_system/dashboard.dart';
import 'package:clinic_booking_system/welcome/onboarding.dart';
import 'package:clinic_booking_system/service/auth_service.dart';
import 'package:clinic_booking_system/welcome/welcome.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/services.dart';
import 'package:intl/date_symbol_data_local.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('vi', null);
  
  // Giữ lại Core Init phòng trường hợp các plugin nền cần
  try {
    await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  } catch (e) {
    print('⚠️ Firebase Core Init warning: $e');
  }

  // QUAN TRỌNG: Khởi tạo session AuthService từ SharedPreferences trước khi dựng UI
  await AuthService.init();

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  final AuthService _authService = AuthService();

  @override
  void initState() {
    super.initState();
  }

  // Kiểm tra hồ sơ đã hoàn tất chưa
  bool _isProfileComplete(Map<String, dynamic> userData) {
    final role = userData['role'] as String? ?? '';
    final displayName = userData['displayName'] as String? ?? '';
    final dob = userData['dateOfBirth'] as String? ?? '';
    final address = userData['address'] as Map? ?? {};
    final province = address['province'] as String? ?? '';
    final district = address['district'] as String? ?? '';
    final street = address['street'] as String? ?? '';
    final medicalHistory = userData['medicalHistory'] as String? ?? '';

    return role != 'UNASSIGNED' &&
        displayName.isNotEmpty &&
        dob.isNotEmpty &&
        province.isNotEmpty &&
        district.isNotEmpty &&
        street.isNotEmpty;
  }

  Future<Widget> _getStartScreen() async {
    // THAY THẾ: Lấy user từ AuthService local thay vì FirebaseAuth
    final user = AuthService.currentUser;

    if (user != null) {
      // 1. Lấy dữ liệu người dùng từ backend API
      final userData = await _authService.fetchUserData(user.uid);
      
      // 2. Kiểm tra trạng thái Onboarding
      final bool isOnboardingNeeded = userData['is_onboarding_needed'] == true;
      final bool isProfileIncomplete = !_isProfileComplete(userData);

      if (isOnboardingNeeded || isProfileIncomplete) {
        // Đi tới onboarding flow
        return const OnboardingFlowScreen();
      } else {
        // Vào màn hình Dashboard
        return const MainScreen();
      }
    }

    // 3. Chưa đăng nhập
    return const WelcomeScreen();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'STL clinic',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      navigatorKey: navigatorKey,
      routes: {
        '/welcome': (context) => const WelcomeScreen(),
        '/home': (context) => const HomeScreen(),
        '/onboarding-flow': (context) => const OnboardingFlowScreen(),
      },
      home: FutureBuilder<Widget>(
        future: _getStartScreen(),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Scaffold(
              backgroundColor: Colors.white,
              body: Center(child: CircularProgressIndicator()),
            );
          }
          if (snapshot.hasError || snapshot.data == null) {
            return const WelcomeScreen();
          }
          return snapshot.data!;
        },
      ),
    );
  }
}