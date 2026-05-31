import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../service/appointment_service.dart';
import '../../service/payment_service.dart';
import '../../utils/snackbar_helper.dart';
import 'package:url_launcher/url_launcher.dart';

class Step7Payment extends StatefulWidget {
  final double bookingPrice;
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;

  final String fullName;
  final String doctor;
  final int? doctorId; // MỚI
  final String hospitalName;
  final int? hospitalId; // MỚI
  final String phone;
  final String? email; // MỚI
  final String? reason; // MỚI
  final DateTime date;
  final String timeSlot;

  const Step7Payment({
    super.key,
    required this.bookingPrice,
    required this.onNext,
    required this.onBack,
    required this.fullName,
    required this.doctor,
    this.doctorId,
    required this.hospitalName,
    this.hospitalId,
    required this.phone,
    this.email,
    this.reason,
    required this.date,
    required this.timeSlot,
  });

  @override
  State<Step7Payment> createState() => _Step7PaymentState();
}

class _Step7PaymentState extends State<Step7Payment> {
  final Color primaryColor = Colors.greenAccent;
  final Color primaryDarkColor = const Color(0xFF1B5E20);
  final AppointmentService _appointmentService = AppointmentService();
  final PaymentService _paymentService = PaymentService();
  
  String selectedPaymentMethod = 'cash'; // 'cash', 'vnpay', 'momo', 'zalopay'

  String _formatPrice(double price) {
    final formatter = NumberFormat('###,###', 'vi_VN');
    return '${formatter.format(price)}₫';
  }

  Widget _buildPaymentButton(
      String methodKey, String label, Color color, String assetName, BuildContext context) {
    bool isSelected = selectedPaymentMethod == methodKey;
    
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4.0),
        child: OutlinedButton(
          onPressed: () {
            setState(() {
              selectedPaymentMethod = methodKey;
            });
          },
          style: OutlinedButton.styleFrom(
            backgroundColor: isSelected ? color.withOpacity(0.1) : Colors.transparent,
            padding: const EdgeInsets.symmetric(vertical: 12),
            side: BorderSide(color: isSelected ? color : Colors.grey.shade300, width: isSelected ? 2.0 : 1.0),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(assetName == 'Momo'
                  ? Icons.payment
                  : (assetName == 'ZaloPay'
                  ? Icons.wallet
                  : Icons.mobile_friendly),
                  color: isSelected ? color : Colors.grey.shade600,
                  size: 24),
              const SizedBox(height: 4),
              Text(label, style: TextStyle(color: isSelected ? color : Colors.grey.shade600, fontSize: 12, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
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
        int countdown = 3; // Giảm countdown xuống 3s cho demo nhanh hơn
        bool isButtonEnabled = false;
        bool isSubmitting = false;
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
                    'Vui lòng kiểm tra lại thông tin cuối cùng trước khi xác nhận. Sau bước này, lịch hẹn sẽ được gửi lên hệ thống.',
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
                  
                  if (isSubmitting) ...[
                    const SizedBox(height: 20),
                    const Center(
                      child: Column(
                        children: [
                          CircularProgressIndicator(color: Colors.green),
                          SizedBox(height: 8),
                          Text('Đang xử lý dữ liệu đặt lịch...', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                        ],
                      ),
                    )
                  ]
                ],
              ),
            ),
            actions: isSubmitting ? [] : [
              TextButton(
                onPressed: () {
                  timer?.cancel();
                  Navigator.of(dialogContext).pop();
                },
                child: const Text('HỦY', style: TextStyle(color: Colors.black54)),
              ),
              ElevatedButton(
                onPressed: isButtonEnabled
                    ? () async {
                        setStateInDialog(() {
                          isSubmitting = true;
                          isButtonEnabled = false;
                        });
                        
                        try {
                          // Validation: Ensure time slot is not empty
                          if (widget.timeSlot.isEmpty) {
                            setStateInDialog(() {
                              isSubmitting = false;
                              isButtonEnabled = true;
                            });
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Lỗi: Bạn chưa chọn Giờ khám. Vui lòng quay lại Bước 4 để chọn giờ khám!')),
                            );
                            timer?.cancel();
                            Navigator.of(dialogContext).pop();
                            return;
                          }

                          // Chuyển đổi Date thành ISO yyyy-MM-dd
                          final String dateStr = DateFormat('yyyy-MM-dd').format(widget.date);
                          
                          // Gọi API đặt lịch thực tế
                          final response = await _appointmentService.createAppointment(
                            doctorId: widget.doctorId ?? 1,
                            hospitalId: widget.hospitalId ?? 1,
                            date: dateStr,
                            time: widget.timeSlot,
                            symptoms: widget.reason ?? 'Khám sức khỏe định kỳ',
                            patientEmail: widget.email ?? 'patient@example.com',
                            patientName: widget.fullName,
                            patientPhone: widget.phone,
                          );
                          
                          timer?.cancel();
                          Navigator.of(dialogContext).pop();
                          
                          // Lấy ID trả về từ Backend để làm mã Booking
                          final String realBookingCode = response != null ? response['id'].toString() : 'STL-${DateTime.now().millisecondsSinceEpoch % 10000}';
                          
                          // Gọi thanh toán VNPAY nếu được chọn
                          if (selectedPaymentMethod == 'vnpay' && response != null) {
                             setStateInDialog(() {
                               isSubmitting = true;
                             });
                             final url = await _paymentService.createVnpayUrl(
                               appointmentId: response['id'],
                               amount: widget.bookingPrice,
                               orderInfo: 'Thanh toan lich kham $realBookingCode'
                             );
                             
                             if (url != null) {
                                final uri = Uri.parse(url);
                                if (await canLaunchUrl(uri)) {
                                   timer?.cancel();
                                   Navigator.of(dialogContext).pop(); // Close current dialog
                                   await launchUrl(uri, mode: LaunchMode.externalApplication);
                                   
                                   // Show verification dialog
                                   showDialog(
                                     context: context,
                                     barrierDismissible: false,
                                     builder: (BuildContext verifyContext) {
                                       bool isChecking = false;
                                       return StatefulBuilder(builder: (context, setVerifyState) {
                                         return AlertDialog(
                                           title: const Text('Xác nhận Thanh toán', style: TextStyle(color: Colors.green)),
                                           content: Column(
                                             mainAxisSize: MainAxisSize.min,
                                             children: [
                                               const Text('Vui lòng hoàn tất thanh toán trên trình duyệt web vừa mở.'),
                                               const SizedBox(height: 15),
                                               const Text('Sau khi thanh toán xong, hãy quay lại đây và nhấn nút bên dưới để hoàn tất.', style: TextStyle(fontStyle: FontStyle.italic)),
                                               if (isChecking) ...[
                                                 const SizedBox(height: 20),
                                                 const CircularProgressIndicator(),
                                                 const SizedBox(height: 10),
                                                 const Text('Đang kiểm tra kết quả...'),
                                               ]
                                             ],
                                           ),
                                           actions: [
                                             TextButton(
                                               onPressed: isChecking ? null : () => Navigator.of(verifyContext).pop(),
                                               child: const Text('Hủy bỏ', style: TextStyle(color: Colors.red)),
                                             ),
                                             ElevatedButton(
                                               style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                                               onPressed: isChecking ? null : () async {
                                                 setVerifyState(() => isChecking = true);
                                                 // Call check status API
                                                 final paymentStatus = await _paymentService.checkPaymentStatus(response['id']);
                                                 setVerifyState(() => isChecking = false);
                                                 
                                                 if (paymentStatus != null && paymentStatus['payment_status'] == 'completed') {
                                                   Navigator.of(verifyContext).pop();
                                                   widget.onNext({
                                                     'bookingCode': realBookingCode,
                                                   });
                                                 } else {
                                                   showAppSnackBar(context, 'Thanh toán chưa hoàn tất. Vui lòng thanh toán lại.', color: Colors.orange);
                                                 }
                                               },
                                               child: const Text('Đã hoàn tất thanh toán'),
                                             ),
                                           ],
                                         );
                                       });
                                     }
                                   );
                                   return; // Don't call onNext automatically
                                } else {
                                   showAppSnackBar(context, 'Không thể mở trang thanh toán VNPAY', color: Colors.red);
                                }
                             } else {
                                showAppSnackBar(context, 'Lỗi tạo URL thanh toán', color: Colors.red);
                             }
                          }
                          
                          timer?.cancel();
                          if (Navigator.of(dialogContext).canPop()) {
                             Navigator.of(dialogContext).pop();
                          }

                          widget.onNext({
                            'bookingCode': realBookingCode,
                          });
                          
                        } catch (e) {
                          setStateInDialog(() {
                            isSubmitting = false;
                            isButtonEnabled = true;
                          });
                          showAppSnackBar(context, '🔥 Lỗi đặt lịch: $e', color: Colors.red);
                        }
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
    );
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
                    _buildPaymentButton('cash', 'Tiền mặt', Colors.green, 'Cash', context),
                    _buildPaymentButton('momo', 'Momo', const Color(0xFFAD006C), 'Momo', context),
                    _buildPaymentButton('vnpay', 'VNPay', const Color(0xFFE50019), 'VNPay', context),
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
