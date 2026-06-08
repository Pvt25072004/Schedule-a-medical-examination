import 'package:clinic_booking_system/firebase_options.dart';
import 'package:clinic_booking_system/screens/home.dart';
import 'package:clinic_booking_system/screens/splash_screen.dart';
import 'package:clinic_booking_system/dashboard.dart';
import 'package:clinic_booking_system/welcome/onboarding.dart';
import 'package:clinic_booking_system/service/auth_service.dart';
import 'package:clinic_booking_system/screens/doctor_dashboard.dart';
import 'package:clinic_booking_system/welcome/welcome.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/services.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Hàm này cần nằm độc lập ở mức cao nhất (top-level)
  // để xử lý các luồng thông báo ngầm khi app đã bị đóng (terminated).
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  print("Handling a background message: ${message.messageId}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('vi', null);
  
  // Giữ lại Core Init phòng trường hợp các plugin nền cần
  try {
    await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
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
    _setupFCM();
  }

  Future<void> _setupFCM() async {
    // Yêu cầu quyền gửi thông báo (Quan trọng cho Android 13+ và iOS)
    FirebaseMessaging messaging = FirebaseMessaging.instance;
    await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Xử lý khi app đang đóng hoàn toàn và người dùng bấm vào thông báo
    RemoteMessage? initialMessage = await FirebaseMessaging.instance.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationClick(initialMessage);
    }

    // Xử lý khi app đang chạy ngầm (background) và người dùng bấm vào thông báo
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleNotificationClick(message);
    });
  }

  void _handleNotificationClick(RemoteMessage message) {
    print('FCM Clicked: ${message.data}');
    // Nếu có logic chuyển hướng, thêm ở đây
    // Ví dụ: navigatorKey.currentState?.pushNamed('/notification-history');
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
      home: const SplashScreen(),
    );
  }
}