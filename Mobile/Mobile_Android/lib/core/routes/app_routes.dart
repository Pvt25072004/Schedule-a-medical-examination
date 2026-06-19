import 'package:flutter/material.dart';
import 'package:clinic_booking_system/screens/home.dart';
import 'package:clinic_booking_system/screens/splash_screen.dart';
import 'package:clinic_booking_system/welcome/onboarding.dart';
import 'package:clinic_booking_system/welcome/welcome.dart';
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
        splash: (context) => const SplashScreen(),
        welcome: (context) => const WelcomeScreen(),
        home: (context) => const HomeScreen(),
        onboardingFlow: (context) => const OnboardingFlowScreen(),
        login: (context) => const LoginPage(),
        register: (context) => const RegisterPage(),
      };
}
