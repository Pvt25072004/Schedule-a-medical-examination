import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import '../api_config.dart';
import 'login_screen.dart';
import 'printer_settings_screen.dart';
import '../services/printer_service.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  MobileScannerController cameraController = MobileScannerController();
  bool _isProcessing = false;
  
  void _showSuccessAndPrintTicket(String appointmentId, Map<String, dynamic> data) async {
    final patientName = data['patient_name'] ?? data['user']?['full_name'] ?? 'Chưa rõ';
    final hospitalName = data['hospital_name_snapshot'] ?? 'STL CLINIC';
    final doctorName = data['doctor_name_snapshot'] ?? 'Bác sĩ';
    final date = data['appointment_date'] ?? '';
    final time = data['appointment_time'] ?? '';

    // Call physical printer
    try {
      await PrinterService().printTicket(
        appointmentId: appointmentId,
        patientName: patientName,
        hospitalName: hospitalName,
        doctorName: doctorName,
        date: date,
        time: time,
      );
    } catch (e) {
      debugPrint('Printing failed (no printer or error): $e');
      // We don't block the UI, just print to console for now
    }

    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 64),
                const SizedBox(height: 12),
                const Text(
                  'Check-in Thành Công!',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(child: Text(hospitalName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18))),
                      const Center(child: Text('PHIẾU CHỜ KHÁM', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
                      const Divider(),
                      Text('Mã hẹn: #$appointmentId'),
                      Text('Bệnh nhân: $patientName'),
                      Text('Bác sĩ: $doctorName'),
                      Text('Thời gian: $time - $date'),
                      const Divider(),
                      const Center(child: Text('Vui lòng chờ đến lượt!', style: TextStyle(fontStyle: FontStyle.italic))),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const CircularProgressIndicator(),
                const SizedBox(height: 12),
                const Text('Đang in phiếu...', style: TextStyle(color: Colors.grey)),
              ],
            ),
          ),
        );
      },
    );

    // Auto close after 5 seconds and resume scanning
    Timer(const Duration(seconds: 5), () {
      if (mounted) {
        Navigator.pop(context); // Close dialog
        setState(() => _isProcessing = false);
        cameraController.start(); // Resume scanner
      }
    });
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Lỗi Check-in', style: TextStyle(color: Colors.red)),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() => _isProcessing = false);
                cameraController.start();
              },
              child: const Text('Đóng'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _processScan(String qrData) async {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);
    cameraController.stop();

    try {
      // The QR data is typically just the appointment ID in the current design
      // If it's a full JSON, we might need to parse it. Let's assume it's just the ID string for now.
      final appointmentId = qrData.trim();
      
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        _showErrorDialog('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      final response = await http.patch(
        Uri.parse('${ApiConfig.baseUrl}/appointments/$appointmentId/status'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'status': 'checked_in'}),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        _showSuccessAndPrintTicket(appointmentId, responseData);
      } else {
        final body = jsonDecode(response.body);
        _showErrorDialog('Mã QR không hợp lệ hoặc không có quyền Check-in.\n(${body['message'] ?? response.statusCode})');
      }
    } catch (e) {
      _showErrorDialog('Lỗi kết nối máy chủ: $e');
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kiosk: Quét mã QR'),
        backgroundColor: const Color(0xFF48A1F3),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.print),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const PrinterSettingsScreen()),
              );
            },
            tooltip: 'Cài đặt Máy in',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Đăng xuất',
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            flex: 3,
            child: MobileScanner(
              controller: cameraController,
              onDetect: (capture) {
                final List<Barcode> barcodes = capture.barcodes;
                for (final barcode in barcodes) {
                  if (barcode.rawValue != null) {
                    _processScan(barcode.rawValue!);
                    break;
                  }
                }
              },
            ),
          ),
          Expanded(
            flex: 1,
            child: Container(
              color: const Color(0xFFF5F7FA),
              width: double.infinity,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.qr_code_scanner, size: 64, color: Color(0xFF143250)),
                  SizedBox(height: 16),
                  Text(
                    'Vui lòng đưa mã QR vào khung hình để tự động Check-in',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF143250)),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
