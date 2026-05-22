import 'dart:convert';
import 'package:http/http.dart' as http;

class EmailService {
  static const String serviceId = 'service_tge1t5r';
  static const String templateId = 'template_3wprs1q';
  static const String publicKey = '9hi25va7h963miNGI';

  static Future<void> sendOtpEmail(String email) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/auth/send-registration-otp');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Gửi OTP thất bại: ${response.body}');
    }
  }
}
