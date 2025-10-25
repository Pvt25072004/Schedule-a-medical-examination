// main.dart - FIXED: Update _getStartScreen để check incomplete → OnboardingFlowScreen (combined), sign out nếu cần
import 'package:clinic_booking_system/firebase_options.dart';
import 'package:clinic_booking_system/screens/chat.dart';
import 'package:clinic_booking_system/screens/home.dart';
import 'package:clinic_booking_system/screens/main_screen.dart';
import 'package:clinic_booking_system/screens/onboarding.dart';
import 'package:clinic_booking_system/service/auth_service.dart';
import 'package:clinic_booking_system/welcome/welcome.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/services.dart';

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  print('Thông báo nền: ${message.data}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  FirebaseDatabase.instance.databaseURL =
  'https://clinic-booking-system-18e7d-default-rtdb.asia-southeast1.firebasedatabase.app/';

  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  try {
    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    String? token = await FirebaseMessaging.instance.getToken();
    print('FCM Token: $token');

    final user = FirebaseAuth.instance.currentUser;
    if (user != null && token != null) {
      await FirebaseDatabase.instance
          .ref('users/${user.uid}/fcmToken')
          .set(token);
    }
  } catch (e) {
    print('⚠️ KHÔNG THỂ KHỞI TẠO FCM TRÊN THIẾT BỊ NÀY: $e');
  }

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      setupFirebaseMessaging();
    });
  }

  Future<void> setupFirebaseMessaging() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Received foreground message: ${message.data}');
      if (message.data['type'] == 'chat') {
        navigatorKey.currentState?.push(
          MaterialPageRoute(
            builder: (context) => ChatScreen(
              contactUid: message.data['contactUid'] ?? '',
              contactName: message.data['contactName'] ?? 'Người dùng',
            ),
          ),
        );
      }
    });

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('Message opened app: ${message.data}');
      if (message.data['type'] == 'chat') {
        navigatorKey.currentState?.push(
          MaterialPageRoute(
            builder: (context) => ChatScreen(
              contactUid: message.data['contactUid'] ?? '',
              contactName: message.data['contactName'] ?? 'Người dùng',
            ),
          ),
        );
      }
    });

    RemoteMessage? initialMessage = await messaging.getInitialMessage();
    if (initialMessage != null && initialMessage.data['type'] == 'chat') {
      print('App opened from terminated: ${initialMessage.data}');
      navigatorKey.currentState?.push(
        MaterialPageRoute(
          builder: (context) => ChatScreen(
            contactUid: initialMessage.data['contactUid'] ?? '',
            contactName: initialMessage.data['contactName'] ?? 'Người dùng',
          ),
        ),
      );
    }
  }

  Future<Map<String, dynamic>> _fetchUserData(String uid) async {
    final snapshot = await FirebaseDatabase.instance.ref('users/$uid').get();
    if (snapshot.exists) {
      return Map<String, dynamic>.from(snapshot.value as Map);
    }
    return {
      'is_onboarding_needed': true,
      'role': 'UNASSIGNED',
      'displayName': '',
      'dateOfBirth': '',
      'address': {'province': '', 'district': '', 'street': ''},
      'medicalHistory': '',
    };
  }

  // FIXED: Check profile complete
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
        street.isNotEmpty &&
        medicalHistory.isNotEmpty;
  }

  Future<Widget> _getStartScreen() async {
    final user = FirebaseAuth.instance.currentUser;

    if (user != null) {
      final userData = await _fetchUserData(user.uid);

      // FIXED: Nếu incomplete, sign out và đến OnboardingFlowScreen (combined)
      if (userData['is_onboarding_needed'] == true || !_isProfileComplete(userData)) {
        await FirebaseAuth.instance.signOut(); // FIXED: Auto sign out nếu incomplete
        return const OnboardingFlowScreen(); // FIXED: To combined screen
      } else {
        return const MainScreen();
      }
    }

    return const WelcomeScreen(); // FIXED: Sau signout → Welcome/Login flow
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
        '/chat': (context) => const ChatScreen(
          contactUid: 'default_uid',
          contactName: 'Người dùng',
        ),
        '/onboarding-flow': (context) => const OnboardingFlowScreen(), // FIXED: Route for combined
      },
      home: FutureBuilder<Widget>(
        future: _getStartScreen(),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Scaffold(
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