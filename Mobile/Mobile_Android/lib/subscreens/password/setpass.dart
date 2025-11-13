import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class SetPassScreen extends StatefulWidget {
  final String email;
  final String otp;
  const SetPassScreen({required this.email, required this.otp, Key? key})
      : super(key: key);

  @override
  State<SetPassScreen> createState() => _SetPassScreenState();
}

class _SetPassScreenState extends State<SetPassScreen>
    with TickerProviderStateMixin {
  final TextEditingController _newPassController = TextEditingController();
  final TextEditingController _confirmPassController = TextEditingController();
  bool _loading = false;
  late AnimationController _slideController;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 1), end: Offset.zero).animate(
      CurvedAnimation(parent: _slideController, curve: Curves.easeOutCubic),
    );
    _slideController.forward();
  }

  @override
  void dispose() {
    _newPassController.dispose();
    _confirmPassController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  void _resetPassword() async {
    final newPass = _newPassController.text.trim();
    final confirmPass = _confirmPassController.text.trim();

    if (newPass.length < 6) {
      _showSnackBar("Mật khẩu ít nhất 6 ký tự");
      return;
    }
    if (newPass != confirmPass) {
      _showSnackBar("Mật khẩu không khớp");
      return;
    }

    setState(() => _loading = true);
    final resp = await http.post(
      Uri.parse("http://192.168.1.23:3000/api/auth/verify-reset"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "email": widget.email,
        "otp": widget.otp,
        "newPassword": newPass,
      }),
    );
    setState(() => _loading = false);

    if (resp.statusCode == 200) {
      _showSnackBar("Đổi mật khẩu thành công!");
      Navigator.popUntil(context, (route) => route.isFirst); // Back to login
    } else {
      final body = jsonDecode(resp.body);
      _showSnackBar(body["message"] ?? "Lỗi đổi mật khẩu");
    }
  }

  void _showSnackBar(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: Colors.greenAccent,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: const Color(0xFFFFF8F0),
        appBar: AppBar(
          title: const Text("Đặt mật khẩu mới"),
          backgroundColor: Colors.greenAccent,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        body: SlideTransition(
          position: _slideAnimation,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.lock_outline, size: 80, color: Colors.greenAccent),
                const SizedBox(height: 32),
                const Text(
                  "Tạo mật khẩu mới",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 40),
                Card(
                  elevation: 8,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        TextField(
                          controller: _newPassController,
                          obscureText: true,
                          textInputAction: TextInputAction.next,
                          decoration: InputDecoration(
                            labelText: "Mật khẩu mới",
                            prefixIcon:
                                Icon(Icons.lock, color: Colors.greenAccent),
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12)),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                  color: Colors.greenAccent, width: 2),
                            ),
                          ),
                          onSubmitted: (_) =>
                              FocusScope.of(context).nextFocus(),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _confirmPassController,
                          obscureText: true,
                          textInputAction: TextInputAction.done,
                          onSubmitted: (_) => _resetPassword(),
                          decoration: InputDecoration(
                            labelText: "Xác nhận mật khẩu",
                            prefixIcon: Icon(Icons.lock_outline,
                                color: Colors.greenAccent),
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12)),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                  color: Colors.greenAccent, width: 2),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _resetPassword,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.greenAccent,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                              elevation: 2,
                            ),
                            child: _loading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                                Colors.white)),
                                  )
                                : const Text("Đặt mật khẩu",
                                    style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
