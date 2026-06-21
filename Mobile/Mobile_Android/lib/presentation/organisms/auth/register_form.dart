import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../logics/auth/providers/auth_provider.dart';
import '../../atoms/app_button.dart';
import '../../atoms/app_text_field.dart';
import '../../molecules/auth/auth_input_field.dart';
import '../../pages/welcome/onboarding_page.dart';

class RegisterForm extends StatefulWidget {
  final VoidCallback onToggleAuthMode;

  const RegisterForm({super.key, required this.onToggleAuthMode});

  @override
  State<RegisterForm> createState() => _RegisterFormState();
}

class _RegisterFormState extends State<RegisterForm> {
  String _inputType = 'email';
  bool _agreed = false;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  final TextEditingController _displayNameController = TextEditingController();

  void _handleRegister() async {
    final input = _emailController.text.trim();
    final password = _passwordController.text.trim();
    final confirm = _confirmPasswordController.text.trim();
    final displayName = _displayNameController.text.trim();

    if (!_agreed) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Vui lòng đồng ý với Điều khoản & Điều kiện!')));
      return;
    }
    if (password != confirm) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mật khẩu không khớp!')));
      return;
    }
    if (password.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mật khẩu phải ít nhất 6 ký tự!')));
      return;
    }

    final authProvider = context.read<AuthProvider>();
    // For now we will assume the OTP part is handled or mocked, so we just call register
    final success = await authProvider.register(input, password, displayName, '000000');
    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đăng ký thành công! Vui lòng hoàn tất hồ sơ.')));
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const OnboardingPage()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Lỗi: ${authProvider.errorMessage}')));
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _displayNameController.dispose();
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
            "Đăng Ký",
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
            controller: _displayNameController,
            hintText: "Họ và tên",
            prefixIcon: Icons.person_outline,
          ),
          const SizedBox(height: 16),

          AppTextField(
            controller: _passwordController,
            hintText: "Mật khẩu",
            prefixIcon: Icons.lock_outline,
            isPassword: true,
          ),
          const SizedBox(height: 16),

          AppTextField(
            controller: _confirmPasswordController,
            hintText: "Nhập lại mật khẩu",
            prefixIcon: Icons.lock_outline,
            isPassword: true,
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Checkbox(
                value: _agreed,
                onChanged: (val) => setState(() => _agreed = val ?? false),
                activeColor: Colors.green,
              ),
              const Expanded(
                child: Text.rich(
                  TextSpan(
                    text: "Tôi đồng ý với ",
                    style: TextStyle(fontSize: 13, color: Colors.black54),
                    children: [
                      TextSpan(
                        text: "Điều khoản & Điều kiện",
                        style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          AppButton(
            text: "ĐĂNG KÝ",
            onPressed: context.watch<AuthProvider>().isLoading ? null : _handleRegister,
            isLoading: context.watch<AuthProvider>().isLoading,
          ),
          const SizedBox(height: 24),

          Center(
            child: GestureDetector(
              onTap: widget.onToggleAuthMode,
              child: const Text.rich(
                TextSpan(
                  text: "Đã có tài khoản? ",
                  style: TextStyle(color: Colors.black54, fontSize: 14),
                  children: [
                    TextSpan(
                      text: "Đăng nhập ngay",
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
