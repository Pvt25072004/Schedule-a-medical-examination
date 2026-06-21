import 'package:flutter/material.dart';
import '../../templates/auth_template.dart';
import '../../organisms/auth/register_form.dart';

class RegisterPage extends StatelessWidget {
  const RegisterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AuthTemplate(
      child: RegisterForm(
        onToggleAuthMode: () {
          Navigator.pushReplacementNamed(context, '/login');
        },
      ),
    );
  }
}
