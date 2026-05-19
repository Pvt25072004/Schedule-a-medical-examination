import 'package:flutter/material.dart';
import 'home.dart';
import '../service/startup_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    // 1. Animation chuẩn: Subtle scale (0.95 -> 1.0)
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _scaleAnimation = Tween<double>(begin: 0.95, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    _controller.forward();

    // 2. Chạy logic khởi tạo
    _startApp();
  }

  Future<void> _startApp() async {
    // Thực hiện preload dữ liệu thiết yếu qua StartupService
    final data = await StartupService.initialize(context);

    if (!mounted) return;

    final Widget nextScreen = data['nextScreen'];

    // 3. Chuyển sang màn hình tiếp theo với Fade Transition cao cấp (350ms)
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => nextScreen,
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: animation,
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 350),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFE8F5E9), Colors.white],
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(flex: 3),
            // Logo Team (Animated)
            ScaleTransition(
              scale: _scaleAnimation,
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.greenAccent.withOpacity(0.2),
                      blurRadius: 30,
                      spreadRadius: 10,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.health_and_safety_rounded,
                  size: 80,
                  color: Colors.greenAccent,
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'STL HEALTHCARE',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                letterSpacing: 3,
                color: Color(0xFF1B5E20),
              ),
            ),
            const Spacer(flex: 2),
            // Indeterminate Loading (Honest UI)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 80),
              child: Column(
                children: [
                  const ClipRRect(
                    borderRadius: BorderRadius.all(Radius.circular(10)),
                    child: LinearProgressIndicator(
                      backgroundColor: Color(0xFFF1F8E9),
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.greenAccent),
                      minHeight: 2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Đang tối ưu hệ thống...',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey[500],
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(flex: 1),
          ],
        ),
      ),
    );
  }
}
