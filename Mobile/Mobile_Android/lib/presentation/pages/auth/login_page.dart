import 'package:flutter/material.dart';
import '../../templates/auth_template.dart';
import '../../organisms/login_form.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AuthTemplate(
      child: LoginForm(
        onToggleAuthMode: () {
          Navigator.pushReplacementNamed(context, '/register');
        },
      ),
    );
  }
}
