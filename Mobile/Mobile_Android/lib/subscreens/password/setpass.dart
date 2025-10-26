// OtpAndResetScreen.dart
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class OtpAndResetScreen extends StatefulWidget {
  final String email;
  const OtpAndResetScreen({required this.email, Key? key}) : super(key: key);

  @override
  State<OtpAndResetScreen> createState() => _OtpAndResetScreenState();
}

class _OtpAndResetScreenState extends State<OtpAndResetScreen> {
  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _newPassController = TextEditingController();
  final TextEditingController _confirmPassController = TextEditingController();
  bool _loading = false;

  void _resetPassword() async {
    final otp = _otpController.text.trim();
    final newPass = _newPassController.text.trim();
    final confirmPass = _confirmPassController.text.trim();

    if (otp.isEmpty) {
      _showSnack("Nhập mã OTP");
      return;
    }
    if (newPass.length < 6) {
      _showSnack("Mật khẩu ít nhất 6 ký tự");
      return;
    }
    if (newPass != confirmPass) {
      _showSnack("Mật khẩu không khớp");
      return;
    }

    setState(() => _loading = true);
    final url = Uri.parse("http://192.168.1.23:3000/api/auth/request-reset");
    final resp = await http.post(
      Uri.parse("http://192.168.1.23:3000/api/auth/verify-reset"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "email": widget.email,
        "otp": otp,
        "newPassword": newPass,
      }),
    );

    setState(() => _loading = false);

    if (resp.statusCode == 200) {
      _showSnack("Đổi mật khẩu thành công!");
      Navigator.pop(context); // quay lại màn login
    } else {
      final body = jsonDecode(resp.body);
      _showSnack(body["message"] ?? "Lỗi đổi mật khẩu");
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Nhập mã & đặt mật khẩu mới")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text("Mã đã gửi tới email ${widget.email}"),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: "Nhập mã xác minh"),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _newPassController,
              obscureText: true,
              decoration: const InputDecoration(labelText: "Mật khẩu mới"),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _confirmPassController,
              obscureText: true,
              decoration: const InputDecoration(labelText: "Xác nhận mật khẩu"),
            ),
            const SizedBox(height: 20),
            _loading
                ? const CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: _resetPassword,
                    child: const Text("Đặt lại mật khẩu"),
                  ),
          ],
        ),
      ),
    );
  }
}
