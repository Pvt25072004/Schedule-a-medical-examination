import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

class QRScanScreen extends StatefulWidget {
  const QRScanScreen({super.key});

  @override
  State<QRScanScreen> createState() => _QRScanScreenState();
}

class _QRScanScreenState extends State<QRScanScreen> {
  final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
    autoStart: true,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  String? _scanResult;
  bool _isTorchOn = false;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _requestCameraPermission();
  }

  Future<void> _requestCameraPermission() async {
    var status = await Permission.camera.request();
    if (!status.isGranted) {
      showAppSnackBar(context, 'Bạn cần cấp quyền Camera để quét QR!');
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _scanFromGallery() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      final capture = await _controller.analyzeImage(image.path);
      if (capture != null && capture.barcodes.isNotEmpty) {
        final barcode = capture.barcodes.first;
        if (barcode.rawValue != null) {
          _showResult(barcode.rawValue!, _getFormatName(barcode.format));
        }
      } else {
        showAppSnackBar(context, 'Không tìm thấy QR/BARCODE trong ảnh');
      }
    }
  }

  void _toggleTorch() {
    _controller.toggleTorch();
    setState(() => _isTorchOn = !_isTorchOn);
  }

  void _showResult(String code, String format) {
    setState(() {
      _scanResult = '$code\n($format)';
    });
  }

  String _getFormatName(BarcodeFormat format) {
    switch (format) {
      case BarcodeFormat.qrCode:
        return 'QR Code';
      default:
        return 'Barcode';
    }
  }

  @override
  Widget build(BuildContext context) {
    final green = Colors.greenAccent;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          /// Camera
          MobileScanner(
            controller: _controller,
            fit: BoxFit.cover,
            onDetect: (capture) {
              for (final barcode in capture.barcodes) {
                if (barcode.rawValue != null) {
                  _showResult(
                      barcode.rawValue!, _getFormatName(barcode.format));
                  break;
                }
              }
            },
          ),

          /// Khung quét QR
          Center(
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                border: Border.all(color: green, width: 4),
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),

          /// Tiêu đề
          const Positioned(
            top: 60,
            left: 0,
            right: 0,
            child: Center(
              child: Text(
                "Quét mã QR",
                style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white),
              ),
            ),
          ),

          /// Nút quay về (top left)
          Positioned(
            top: 60,
            left: 20,
            child: GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.black.withOpacity(0.4),
                ),
                child:
                    const Icon(Icons.arrow_back, color: Colors.white, size: 28),
              ),
            ),
          ),

          /// Flash
          Positioned(
            top: 60,
            right: 20,
            child: GestureDetector(
              onTap: _toggleTorch,
              child: _topButton(
                icon: _isTorchOn ? Icons.flash_off : Icons.flash_on,
              ),
            ),
          ),

          /// Dải nút dưới (bỏ "QR của tôi", chỉ Thư viện + Quét mã QR)
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                /// Chọn ảnh QR
                GestureDetector(
                  onTap: _scanFromGallery,
                  child:
                      _bottomIcon(icon: Icons.photo_library, text: "Thư viện"),
                ),

                /// Quét mã QR (nút chính)
                GestureDetector(
                  onTap: () {
                    showAppSnackBar(context, 'Đang quét realtime...');
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 12),
                    decoration: BoxDecoration(
                      color: green,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Quét mã QR',
                      style: TextStyle(
                        color: Colors.black,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          /// Hiển thị kết quả (overlay)
          if (_scanResult != null)
            Positioned(
              bottom: 130,
              left: 25,
              right: 25,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: green.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _scanResult!,
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.black),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
        ],
      ),
    );
  }

  /// Widgets UI tái sử dụng
  Widget _topButton({required IconData icon}) => Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.black.withOpacity(0.4),
        ),
        child: Icon(icon, color: Colors.white, size: 28),
      );

  Widget _bottomIcon({required IconData icon, required String text}) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.greenAccent,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Colors.black),
        ),
        const SizedBox(height: 6),
        Text(text, style: const TextStyle(color: Colors.white)),
      ],
    );
  }
}
