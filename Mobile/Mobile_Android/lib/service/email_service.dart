import 'dart:convert';
import 'package:http/http.dart' as http;

class EmailService {
  static const String serviceId = 'service_tge1t5r';
  static const String templateId = 'template_3wprs1q';
  static const String publicKey = '9hi25va7h963miNGI';

  static Future<void> sendOtpEmail(String email, String otp) async {
    final url = Uri.parse('https://api.emailjs.com/api/v1.0/email/send');
    final reponse = await http.post(
      url,
      headers: {
        'origin': 'http://localhost',
        'Content-type': 'application/json',
      },
      body: json.encode({
        'service_id': serviceId,
        'template_id': templateId,
        'user_id': publicKey,
        'template_params': {
          'to_email': email, // biến này phải truyền đúng email người đăng ký
          'otp': otp,
          'name': 'STL - Clinic Booking',
        },
      }),
    );

    if (reponse.statusCode != 200) {
      throw Exception('Gửi OTP thất bại: ${reponse.body}');
    }
  }
}
