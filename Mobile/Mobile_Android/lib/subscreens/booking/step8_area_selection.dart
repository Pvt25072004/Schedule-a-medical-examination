// step8_confirmation.dart - Confirmation step (Final Step)
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Step8Confirmation extends StatelessWidget {
  // Thông tin Lịch khám
  final String hospitalName;
  final String cityName;
  final String specialty;
  final String doctor;
  final DateTime date;
  final String timeSlot;
  final double price;

  // Thông tin Bệnh nhân
  final String fullName;
  final String phone;
  final String email;
  final String reason;

  // Hành động
  final VoidCallback onBookNew;

  const Step8Confirmation({
    super.key,
    required this.hospitalName,
    required this.cityName,
    required this.specialty,
    required this.doctor,
    required this.date,
    required this.timeSlot,
    required this.price,
    required this.fullName,
    required this.phone,
    required this.email,
    required this.reason,
    required this.onBookNew,
  });

  // Màu chủ đạo giả định
  final Color primaryColor = Colors.greenAccent;
  final Color primaryDarkColor = const Color(0xFF1B5E20);
  final Color successColor = Colors.green;

  String _formatPrice(double price) {
    final formatter = NumberFormat('###,###', 'vi_VN');
    return '${formatter.format(price)}₫';
  }

  // Widget hiển thị một mục thông tin
  Widget _buildInfoItem(IconData icon, String label, String value, {bool isHeader = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: isHeader ? primaryDarkColor : Colors.grey),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (!isHeader) Text(label, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: isHeader ? 16 : 14,
                    fontWeight: isHeader ? FontWeight.bold : FontWeight.w500,
                    color: isHeader ? primaryDarkColor : Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Mock Mã đặt lịch
    const bookingCode = 'BK68285971';
    final formattedDate = DateFormat('EEEE, dd tháng MM, yyyy', 'vi').format(date);
    final priceText = _formatPrice(price);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 100.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // --- Icon và Tiêu đề Xác nhận ---
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: successColor.withOpacity(0.1),
            ),
            child: Icon(Icons.check_circle_outline, size: 80, color: successColor),
          ),
          const SizedBox(height: 16),
          const Text(
            'Đặt lịch thành công!',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
          ),
          const SizedBox(height: 8),
          const Text(
            'Lịch khám của bạn đã được xác nhận. Thông tin chi tiết đã được gửi đến email của bạn.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 15, color: Colors.grey),
          ),
          const SizedBox(height: 30),

          // --- Mã Đặt lịch ---
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            color: Colors.blue.shade50,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  const Text('Mã đặt lịch', style: TextStyle(fontSize: 14, color: Colors.black54)),
                  const SizedBox(height: 4),
                  Text(
                    bookingCode,
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.blue.shade800),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // --- Thông tin Lịch khám chi tiết ---
          const Align(
            alignment: Alignment.centerLeft,
            child: Text('Thông tin lịch khám', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          const Divider(height: 10),

          _buildInfoItem(Icons.person, 'Bác sĩ', doctor, isHeader: true),
          _buildInfoItem(Icons.location_on, 'Bệnh viện', '$hospitalName - $cityName'),
          _buildInfoItem(Icons.calendar_today, 'Ngày khám', formattedDate),
          _buildInfoItem(Icons.access_time, 'Giờ khám', timeSlot),
          _buildInfoItem(Icons.medical_services, 'Chuyên khoa', specialty),
          const SizedBox(height: 20),

          // --- Thông tin Bệnh nhân ---
          const Align(
            alignment: Alignment.centerLeft,
            child: Text('Thông tin bệnh nhân', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          const Divider(height: 10),

          _buildInfoItem(Icons.badge, 'Họ tên', fullName),
          _buildInfoItem(Icons.phone, 'Số điện thoại', phone),
          _buildInfoItem(Icons.email, 'Email', email),
          _buildInfoItem(Icons.description, 'Lý do khám', reason),

          const SizedBox(height: 10),

          // --- Phí Khám ---
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              'Phí khám bệnh: $priceText',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: primaryDarkColor),
            ),
          ),
          const SizedBox(height: 30),

          // --- Lưu ý quan trọng ---
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: primaryColor.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Lưu ý quan trọng:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87)),
                const SizedBox(height: 8),
                _buildListItem('Vui lòng đến sớm 15 phút trước giờ hẹn'),
                _buildListItem('Mang theo CMND/CCCD và thẻ bảo hiểm y tế (nếu có)'),
                _buildListItem('Nếu cần hủy lịch, vui lòng liên hệ trước 24 giờ'),
                _buildListItem('Mã đặt lịch sẽ được gửi qua SMS và Email'),
              ],
            ),
          ),
          const SizedBox(height: 30),

          // --- Nút Đặt lịch mới ---
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onBookNew,
              child: const Text('Đặt lịch mới'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue.shade600,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.circle, size: 8, color: primaryDarkColor.withOpacity(0.7)),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: TextStyle(color: primaryDarkColor.withOpacity(0.8)))),
        ],
      ),
    );
  }
}