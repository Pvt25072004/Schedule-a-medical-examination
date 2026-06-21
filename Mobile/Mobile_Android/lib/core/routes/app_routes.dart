import 'package:flutter/material.dart';
import 'package:clinic_booking_system/dashboard.dart';
import 'package:clinic_booking_system/presentation/pages/home/home_page.dart';
import 'package:clinic_booking_system/presentation/pages/splash/splash_page.dart';
import 'package:clinic_booking_system/presentation/pages/welcome/onboarding_page.dart';
import 'package:clinic_booking_system/presentation/pages/welcome/welcome_page.dart';
import 'package:clinic_booking_system/presentation/pages/auth/login_page.dart';
import 'package:clinic_booking_system/presentation/pages/auth/register_page.dart';

class AppRoutes {
  static const String splash = '/';
  static const String welcome = '/welcome';
  static const String home = '/home';
  static const String onboardingFlow = '/onboarding-flow';
  static const String login = '/login';
  static const String register = '/register';

  static Map<String, WidgetBuilder> get routes => {
        splash: (context) => const SplashPage(),
        welcome: (context) => const WelcomePage(),
        home: (context) => const MainScreen(),
        onboardingFlow: (context) => const OnboardingPage(),
        login: (context) => const LoginPage(isLogin: true),
        register: (context) => const RegisterPage(),
      };
}
