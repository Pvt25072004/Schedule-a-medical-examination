import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../service/appointment_service.dart';
import '../../../logics/auth/providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';
import '../../../service/payment_service.dart';
import '../../../core/utils/snackbar_helper.dart';
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
  final String? roomName;
  final String phone;
  final String? email; // MỚI
  final String? reason; // MỚI
  final DateTime date;
  final String timeSlot;
  
  // Thông tin người thân (Nếu có)
  final bool isForRelative;
  final String? patientGender;
  final String? patientDob;
  final String? relationship;
  final String? patientAddress;

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
    this.roomName,
    required this.phone,
    this.email,
    this.reason,
    required this.date,
    required this.timeSlot,
    this.isForRelative = false,
    this.patientGender,
    this.patientDob,
    this.relationship,
    this.patientAddress,
  });

  @override
  State<Step7Payment> createState() => _Step7PaymentState();
}

class _Step7PaymentState extends State<Step7Payment> {


  final AppointmentService _appointmentService = AppointmentService();
  final PaymentService _paymentService = PaymentService();
  
  String selectedPaymentMethod = 'payos';
  
  // Lưu lại thông tin nếu đã tạo lịch thành công để cho phép thanh toán lại mà không bị lỗi trùng
  int? createdAppointmentId;
  String? createdBookingCode;
  
  bool isProcessingPayment = false; // Add state for loading indicator

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

  Future<void> _processPayment(BuildContext context) async {
    setState(() {
      isProcessingPayment = true;
    });

    try {
      if (widget.timeSlot.isEmpty) {
        setState(() {
          isProcessingPayment = false;
        });
        showAppSnackBar(context, 'Lỗi: Bạn chưa chọn Giờ khám. Vui lòng quay lại Bước 4!', color: Colors.red);
        return;
      }

      final String dateStr = DateFormat('yyyy-MM-dd').format(widget.date);
      Map<String, dynamic>? response;
      
      if (createdAppointmentId == null) {
        final authProvider = context.read<AuthProvider>();
        final currentUser = authProvider.currentUser;

        response = await _appointmentService.createAppointment(
          doctorId: widget.doctorId ?? 1,
          hospitalId: widget.hospitalId ?? 1,
          date: dateStr,
          time: widget.timeSlot,
          symptoms: widget.reason ?? 'Khám sức khỏe định kỳ',
          patientEmail: widget.email ?? 'patient@example.com',
          patientName: widget.fullName,
          patientPhone: widget.phone,
          patientGender: widget.patientGender,
          patientDob: widget.patientDob,
          relationship: widget.relationship,
          patientAddress: widget.patientAddress,
          currentUserId: currentUser?.id,
        );
        
        if (response != null) {
          setState(() {
            createdAppointmentId = response!['id'];
            createdBookingCode = response['id'].toString();
          });
        }
      } else {
        response = {'id': createdAppointmentId};
      }
      
      final String realBookingCode = createdBookingCode ?? 'STL-${DateTime.now().millisecondsSinceEpoch % 10000}';
      
      if ((selectedPaymentMethod == 'vnpay' || selectedPaymentMethod == 'payos') && response != null) {
        String? url;
        if (selectedPaymentMethod == 'payos') {
          url = await _paymentService.createPayosUrl(
            appointmentId: response['id'],
            amount: widget.bookingPrice,
            orderInfo: 'Thanh toan lich kham $realBookingCode'
          );
        } else {
          url = await _paymentService.createVnpayUrl(
            appointmentId: response['id'],
            amount: widget.bookingPrice,
            orderInfo: 'Thanh toan lich kham $realBookingCode'
          );
        }
        
        if (url != null) {
          final uri = Uri.parse(url);
          try {
            bool launched = false;
            try {
               launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
            } catch (e) {
               print('🔥 Lỗi mở external browser: $e');
            }
            
            if (!launched) {
               try {
                  launched = await launchUrl(uri, mode: LaunchMode.inAppWebView);
               } catch (e) {
                  print('🔥 Lỗi mở inAppWebView: $e');
               }
            }

            if (!launched) {
               throw Exception('Không thể mở trang web thanh toán trên thiết bị này');
            }
            
            // Show verification dialog
            if (mounted) {
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (BuildContext verifyContext) {
                  bool isChecking = false;
                  return StatefulBuilder(builder: (context, setVerifyState) {
                    return AlertDialog(
                      title: const Text('Xác nhận Thanh toán', style: TextStyle(color: AppColors.primary)),
                      content: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('Vui lòng hoàn tất thanh toán trên trình duyệt web/ứng dụng ngân hàng vừa mở.'),
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
                          onPressed: isChecking ? null : () {
                            Navigator.of(verifyContext).pop();
                            setState(() {
                              isProcessingPayment = false;
                            });
                          },
                          child: const Text('Hủy bỏ', style: TextStyle(color: Colors.red)),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                          onPressed: isChecking ? null : () async {
                            setVerifyState(() => isChecking = true);
                            final paymentStatus = await _paymentService.checkPaymentStatus(response!['id']);
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
            }
            return; // Exit here so it stays in processing state (the dialog handles navigation/cancelling)
          } catch (e) {
            print('🔥 Exception khi launchUrl: $e');
            if (mounted) {
              showAppSnackBar(context, 'Không thể mở trang thanh toán: $e', color: Colors.red);
            }
          }
        } else {
          if (mounted) {
            showAppSnackBar(context, 'Lỗi tạo URL thanh toán', color: Colors.red);
          }
        }
      } else {
         // Trường hợp thanh toán tiền mặt hoặc cách khác, đi thẳng tới màn hình hoàn tất
         widget.onNext({
           'bookingCode': realBookingCode,
         });
         return; // Không set isProcessingPayment = false để nó chuyển màn hình mượt hơn
      }
    } catch (e) {
      if (mounted) {
        showAppSnackBar(context, '🔥 Lỗi đặt lịch: $e', color: Colors.red);
      }
    }
    
    // If we reach here, something failed and we should hide the loading indicator
    if (mounted) {
      setState(() {
        isProcessingPayment = false;
      });
    }
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
                    color: isPrice ? AppColors.primaryDark : Colors.black87)),
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
                        const Text('Thông tin khám bệnh:',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        _buildPopupInfo('Cơ sở:', widget.hospitalName),
                        if (widget.roomName != null && widget.roomName!.isNotEmpty)
                          _buildPopupInfo('Phòng:', widget.roomName!),
                        _buildPopupInfo('Bác sĩ:', widget.doctor),
                        _buildPopupInfo('Ngày/Giờ:', '${DateFormat('dd/MM/yyyy').format(widget.date)} - ${widget.timeSlot}'),
                        _buildPopupInfo('Bệnh nhân:', '${widget.fullName} ${widget.isForRelative ? '(${widget.relationship})' : ''}'),
                        _buildPopupInfo('SĐT:', widget.phone),
                        const Divider(height: 30),
                        const Text('Tổng phí cần thanh toán:',
                            style: TextStyle(fontSize: 16, color: Colors.grey)),
                        const SizedBox(height: 8),
                        Text(
                          priceText,
                          style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryDark),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 30),

                const Text('Chọn phương thức thanh toán:',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),

                Row(
                  children: [
                    _buildPaymentButton('payos', 'VietQR', Colors.indigo, 'PayOS', context),
                    _buildPaymentButton('vnpay', 'VNPay', const Color(0xFFE50019), 'VNPay', context),
                  ],
                ),
                const SizedBox(height: 40),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: isProcessingPayment
                        ? null
                        : () => _processPayment(context),
                    icon: isProcessingPayment 
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.check_circle_outline),
                    label: Text(isProcessingPayment ? 'Đang xử lý...' : 'Hoàn tất Thanh toán'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
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





