import 'dart:convert';
import 'package:http/http.dart' as http;

import '../core/utils/api_config.dart';

class EmailService {
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

