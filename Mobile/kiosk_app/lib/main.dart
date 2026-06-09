import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_screen.dart';
import 'screens/scanner_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Check if user is already logged in
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('jwt_token');
  
  runApp(KioskApp(initialRoute: token != null ? '/scanner' : '/login'));
}

class KioskApp extends StatelessWidget {
  final String initialRoute;
  const KioskApp({super.key, required this.initialRoute});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kiosk Check-in',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color(0xFF48A1F3),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF48A1F3)),
        useMaterial3: true,
      ),
      initialRoute: initialRoute,
      routes: {
        '/login': (context) => const LoginScreen(),
        '/scanner': (context) => const ScannerScreen(),
      },
    );
  }
}
