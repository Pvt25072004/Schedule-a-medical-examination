import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../logics/auth/providers/auth_provider.dart';
import '../atoms/app_button.dart';
import '../atoms/app_text_field.dart';
import '../molecules/auth_input_field.dart';
import '../molecules/social_login_row.dart';

class LoginForm extends StatefulWidget {
  final VoidCallback onToggleAuthMode;

  const LoginForm({super.key, required this.onToggleAuthMode});

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  String _inputType = 'email';
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  void _handleLogin() async {
    final input = _emailController.text.trim();
    final password = _passwordController.text.trim();

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.login(input, password);
    
    if (success) {
      if (mounted) Navigator.pushReplacementNamed(context, '/home');
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Lỗi: ${authProvider.errorMessage}')));
      }
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(30),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 20, offset: Offset(0, 10)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Đăng Nhập",
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.green),
          ),
          const SizedBox(height: 8),
          const Text("Vui lòng điền thông tin", style: TextStyle(color: Colors.black54)),
          const SizedBox(height: 24),

          AuthInputField(
            inputType: _inputType,
            onInputTypeChanged: (val) => setState(() => _inputType = val),
            inputController: _emailController,
          ),
          const SizedBox(height: 16),

          AppTextField(
            controller: _passwordController,
            hintText: "Mật khẩu",
            prefixIcon: Icons.lock_outline,
            isPassword: true,
          ),
          const SizedBox(height: 16),

          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {},
              child: const Text("Quên mật khẩu?", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 24),

          AppButton(
            text: "ĐĂNG NHẬP",
            onPressed: context.watch<AuthProvider>().isLoading ? null : _handleLogin,
            isLoading: context.watch<AuthProvider>().isLoading,
          ),
          const SizedBox(height: 24),

          const Center(child: Text("Hoặc", style: TextStyle(color: Colors.black54))),
          const SizedBox(height: 24),

          const SocialLoginRow(),
          const SizedBox(height: 24),

          Center(
            child: GestureDetector(
              onTap: widget.onToggleAuthMode,
              child: const Text.rich(
                TextSpan(
                  text: "Chưa có tài khoản? ",
                  style: TextStyle(color: Colors.black54, fontSize: 14),
                  children: [
                    TextSpan(
                      text: "Đăng ký ngay",
                      style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
