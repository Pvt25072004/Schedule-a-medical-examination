import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:clinic_booking_system/subscreens/password/setpass.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({Key? key}) : super(key: key);

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen>
    with TickerProviderStateMixin {
  final TextEditingController _emailController = TextEditingController();
  bool _loading = false;
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );
    _fadeController.forward();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  void _sendOtp() async {
    final email = _emailController.text.trim();
    if (email.isEmpty ||
        !RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      _showSnackBar("Email không hợp lệ");
      return;
    }

    setState(() => _loading = true);
    final url = Uri.parse("http://192.168.1.23:3000/api/auth/request-reset");
    final resp = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email}),
    );
    setState(() => _loading = false);

    if (resp.statusCode == 200) {
      _showOtpDialog(email);
    } else {
      final body = jsonDecode(resp.body);
      _showSnackBar(body["message"] ?? "Lỗi gửi OTP");
    }
  }

  void _showOtpDialog(String email) {
    final TextEditingController otpController = TextEditingController();
    bool otpLoading = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Icon(Icons.lock_reset, color: Colors.greenAccent),
              const SizedBox(width: 8),
              const Text("Xác minh OTP"),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("Mã OTP đã gửi đến $email"),
              const SizedBox(height: 16),
              TextField(
                controller: otpController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 24, letterSpacing: 8),
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.greenAccent),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.green, width: 2),
                  ),
                  counterText: "",
                ),
                onChanged: (value) {
                  // Auto verify nếu đủ 6 chữ số
                  if (value.length == 6) {
                    _verifyOtp(email, value, () {
                      setDialogState(() => otpLoading = true);
                    }, () {
                      setDialogState(() => otpLoading = false);
                    }, setDialogState, () => Navigator.pop(context));
                  }
                },
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => _sendOtp(), // Resend
                child: const Text("Gửi lại OTP"),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Hủy"),
            ),
            ElevatedButton(
              onPressed: otpLoading
                  ? null
                  : () => _verifyOtp(email, otpController.text.trim(), () {
                        setDialogState(() => otpLoading = true);
                      }, () {
                        setDialogState(() => otpLoading = false);
                      }, setDialogState, () => Navigator.pop(context)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.greenAccent,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
              child: otpLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white)),
                    )
                  : const Text("Xác nhận"),
            ),
          ],
        ),
      ),
    );
  }

  void _verifyOtp(
      String email,
      String otp,
      VoidCallback onStartLoading,
      VoidCallback onStopLoading,
      StateSetter setDialogState,
      VoidCallback onSuccess) async {
    if (otp.length != 6) {
      _showSnackBar("OTP phải 6 chữ số");
      return;
    }

    onStartLoading();
    // Giả sử có API verify OTP riêng, nhưng dùng verify-reset mà không pass newPassword để check
    // Để tách, assume backend support verify only, or adjust
    // For now, we'll proceed to setpass with otp
    await Future.delayed(const Duration(milliseconds: 1000)); // Simulate
    onStopLoading();

    // Assume success for demo, in real: call API
    if (true) {
      // Replace with real check
      onSuccess();
      Navigator.push(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) =>
              SetPassScreen(email: email, otp: otp),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SlideTransition(
              position:
                  Tween<Offset>(begin: const Offset(0, 1), end: Offset.zero)
                      .animate(animation),
              child: child,
            );
          },
        ),
      );
    } else {
      _showSnackBar("OTP không đúng");
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.redAccent,
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
          title: const Text("Quên mật khẩu"),
          backgroundColor: Colors.greenAccent,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        body: FadeTransition(
          opacity: _fadeAnimation,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.lock_reset, size: 80, color: Colors.greenAccent),
                const SizedBox(height: 32),
                const Text(
                  "Nhập email để nhận mã xác minh",
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
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.done,
                          onSubmitted: (_) => _sendOtp(),
                          decoration: InputDecoration(
                            labelText: "Email đăng ký",
                            prefixIcon:
                                Icon(Icons.email, color: Colors.greenAccent),
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
                            onPressed: _loading ? null : _sendOtp,
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
                                : const Text("Gửi mã OTP",
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
