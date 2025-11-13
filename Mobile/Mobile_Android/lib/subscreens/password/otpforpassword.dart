import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
// Import màn hình tiếp theo
import 'package:clinic_booking_system/subscreens/password/setpass.dart';

class OtpVerificationScreen extends StatefulWidget {
  final String email;

  const OtpVerificationScreen({
    Key? key,
    required this.email,
  }) : super(key: key);

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _otpController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  // --- API and Logic Handlers ---

  // NOTE: Logic cho việc gửi lại OTP được giữ lại trong màn hình này
  void _sendOtpResend() async {
    setState(() => _isLoading = true);
    final email = widget.email;

    // Vui lòng thay đổi IP tĩnh này bằng cấu hình động nếu có thể
    final url = Uri.parse("http://192.168.1.23:3000/api/auth/request-reset");

    try {
      final resp = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": email}),
      );

      if (resp.statusCode == 200) {
        _showSnackBar("Mã OTP đã được gửi lại thành công.", isError: false);
      } else {
        final body = jsonDecode(resp.body);
        _showSnackBar(body["message"] ?? "Lỗi gửi lại OTP. Vui lòng thử lại.");
      }
    } catch (e) {
      _showSnackBar("Không thể kết nối đến máy chủ. $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _verifyOtp() async {
    if (!_formKey.currentState!.validate()) return;
    final otp = _otpController.text.trim();

    setState(() => _isLoading = true);

    // Dùng logic cũ: Simulate API check, sau đó navigate
    // Thay thế bằng cuộc gọi API xác thực OTP thực tế của bạn
    await Future.delayed(const Duration(milliseconds: 1500));

    setState(() => _isLoading = false);

    // GIẢ SỬ XÁC MINH THÀNH CÔNG: Chuyển sang màn hình SetPass
    if (true) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => SetPassScreen(email: widget.email, otp: otp),
        ),
      );
    } else {
      _showSnackBar("Mã OTP không đúng. Vui lòng kiểm tra lại.");
    }
  }

  void _showSnackBar(String message, {bool isError = true}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red.shade600 : Colors.teal,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  // --- UI Builders (Được chuyển từ file cũ) ---

  Widget _buildHeader(String title, String subtitle, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.teal.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: Colors.teal, size: 40),
        ),
        const SizedBox(height: 24),
        Text(
          title,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          subtitle,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildOtpInput() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(
            'Xác minh OTP',
            'Chúng tôi đã gửi mã xác minh gồm 6 chữ số đến ${widget.email}. Vui lòng nhập mã để tiếp tục.',
            Icons.vpn_key_outlined,
          ),
          const SizedBox(height: 32),
          const Text(
            'Mã OTP (6 chữ số)',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _otpController,
            keyboardType: TextInputType.number,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: const TextStyle(
                fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              counterText: "",
              hintText: '------',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.grey),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.teal, width: 2),
              ),
              filled: true,
              fillColor: Colors.grey.withOpacity(0.05),
            ),
            validator: (value) {
              if (value?.length != 6) {
                return 'Vui lòng nhập đủ 6 chữ số';
              }
              return null;
            },
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _verifyOtp,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 4,
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation(Colors.white),
                        strokeWidth: 2,
                      ),
                    )
                  : const Text(
                      'Xác nhận mã OTP',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: TextButton(
              onPressed: _isLoading ? null : _sendOtpResend, // Resend logic
              child: const Text(
                'Gửi lại mã OTP',
                style:
                    TextStyle(color: Colors.teal, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.teal),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Text(
            'Xác minh OTP',
            style: TextStyle(color: Colors.teal, fontWeight: FontWeight.bold),
          ),
          elevation: 0,
          backgroundColor: Colors.white,
        ),
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: _buildOtpInput(),
          ),
        ),
      ),
    );
  }
}
