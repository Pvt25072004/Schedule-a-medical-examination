import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Step7Payment extends StatefulWidget {
  final double bookingPrice;
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;

  final String fullName;
  final String doctor;
  final String hospitalName;
  final String phone;
  final DateTime date;
  final String timeSlot;

  const Step7Payment({
    super.key,
    required this.bookingPrice,
    required this.onNext,
    required this.onBack,
    required this.fullName,
    required this.doctor,
    required this.hospitalName,
    required this.phone,
    required this.date,
    required this.timeSlot,
  });

  @override
  State<Step7Payment> createState() => _Step7PaymentState();
}

class _Step7PaymentState extends State<Step7Payment> {
  final Color primaryColor = Colors.greenAccent;
  final Color primaryDarkColor = const Color(0xFF1B5E20);

  String _formatPrice(double price) {
    final formatter = NumberFormat('###,###', 'vi_VN');
    return '${formatter.format(price)}₫';
  }

  Widget _buildPaymentButton(
      String label, Color color, String assetName, BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4.0),
        child: OutlinedButton(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Đang mở ứng dụng $label...')),
            );
          },
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 12),
            side: BorderSide(color: color, width: 1.5),
            shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(assetName == 'Momo'
                  ? Icons.payment
                  : (assetName == 'ZaloPay'
                  ? Icons.wallet
                  : Icons.mobile_friendly),
                  color: color,
                  size: 24),
              const SizedBox(height: 4),
              Text(label, style: TextStyle(color: color, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }

  void _showConfirmationPopup(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        int countdown = 5;
        bool isButtonEnabled = false;
        Timer? timer;

        return StatefulBuilder(builder: (context, setStateInDialog) {
          if (timer == null) {
            timer = Timer.periodic(const Duration(seconds: 1), (_) {
              if (countdown == 0) {
                setStateInDialog(() {
                  isButtonEnabled = true;
                  timer?.cancel();
                });
              } else {
                setStateInDialog(() {
                  countdown--;
                });
              }
            });
          }

          return AlertDialog(
            title: const Text('Xác nhận đặt lịch và Thanh toán'),
            content: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Vui lòng kiểm tra lại thông tin cuối cùng trước khi xác nhận. Sau bước này, bạn không thể quay lại để chỉnh sửa.',
                    style: TextStyle(color: Colors.red),
                  ),
                  const Divider(height: 20),

                  _buildPopupInfo(
                      'Mục khám:', '${widget.doctor} - ${widget.hospitalName}'),
                  _buildPopupInfo(
                      'Ngày/Giờ:',
                      '${DateFormat('dd/MM/yyyy').format(widget.date)} - ${widget.timeSlot}'),
                  _buildPopupInfo('Bệnh nhân:', widget.fullName),
                  _buildPopupInfo('SĐT:', widget.phone),
                  _buildPopupInfo('Phí:', _formatPrice(widget.bookingPrice),
                      isPrice: true),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  timer?.cancel();
                  Navigator.of(dialogContext).pop();
                },
                child: const Text('HỦY', style: TextStyle(color: Colors.black54)),
              ),
              ElevatedButton(
                onPressed: isButtonEnabled
                    ? () {
                  timer?.cancel();
                  Navigator.of(dialogContext).pop();
                  widget.onNext({});
                }
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                  isButtonEnabled ? Colors.green : Colors.grey,
                  foregroundColor: Colors.white,
                ),
                child: Text(
                  isButtonEnabled
                      ? 'ĐỒNG Ý'
                      : 'Vui lòng chờ (${countdown}s)',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          );
        });
      },
    ).then((_) {
      // Đảm bảo timer bị hủy khi popup đóng
    });
  }

  Widget _buildPopupInfo(String label, String value, {bool isPrice = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(label,
                style: TextStyle(
                    fontWeight: FontWeight.w500, color: Colors.grey.shade600)),
          ),
          Expanded(
            child: Text(value,
                style: TextStyle(
                    fontWeight: isPrice ? FontWeight.bold : FontWeight.normal,
                    color: isPrice ? primaryDarkColor : Colors.black87)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final priceText = _formatPrice(widget.bookingPrice);

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Colors.grey.shade200, width: 1)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Xác nhận Thanh toán (Bước 7)',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Vui lòng thanh toán $priceText để xác nhận lịch khám.',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),

        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 120.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Tổng phí cần thanh toán:',
                            style: TextStyle(fontSize: 16, color: Colors.grey)),
                        const SizedBox(height: 8),
                        Text(
                          priceText,
                          style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: primaryDarkColor),
                        ),
                        const Divider(height: 30),
                        const Text('Thanh toán bằng mã QR:',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        Center(
                          child: Container(
                            width: 200,
                            height: 200,
                            decoration: BoxDecoration(
                              color: Colors.grey.shade200,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(Icons.qr_code_2_outlined,
                                size: 100, color: primaryDarkColor.withOpacity(0.5)),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Center(
                          child: Text('Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử.',
                              style: TextStyle(color: Colors.grey[600])),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 30),

                const Text('Hoặc Thanh toán qua Ví điện tử:',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),

                Row(
                  children: [
                    _buildPaymentButton('Momo', const Color(0xFFAD006C), 'Momo', context),
                    _buildPaymentButton('ZaloPay', const Color(0xFF0089FF), 'ZaloPay', context),
                    _buildPaymentButton('VNPay', const Color(0xFFE50019), 'VNPay', context),
                  ],
                ),
                const SizedBox(height: 40),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      _showConfirmationPopup(context);
                    },
                    icon: const Icon(Icons.check_circle_outline),
                    label: const Text('Hoàn tất Thanh toán'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
