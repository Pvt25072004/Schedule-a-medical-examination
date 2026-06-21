import 'package:flutter/material.dart';
import '../../templates/auth_template.dart';
import '../../organisms/auth/login_form.dart';
import '../../organisms/auth/register_form.dart';

class LoginPage extends StatefulWidget {
  final bool isLogin;
  
  const LoginPage({super.key, this.isLogin = true});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  late bool _isLogin;

  @override
  void initState() {
    super.initState();
    _isLogin = widget.isLogin;
  }

  void _toggleMode() {
    setState(() {
      _isLogin = !_isLogin;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AuthTemplate(
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 500),
        switchInCurve: Curves.easeInOutCubic,
        switchOutCurve: Curves.easeInOutCubic,
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(
            opacity: animation,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0.0, 0.05),
                end: Offset.zero,
              ).animate(animation),
              child: child,
            ),
          );
        },
        child: _isLogin
            ? LoginForm(
                key: const ValueKey('login'),
                onToggleAuthMode: _toggleMode,
              )
            : RegisterForm(
                key: const ValueKey('register'),
                onToggleAuthMode: _toggleMode,
              ),
      ),
    );
  }
}
