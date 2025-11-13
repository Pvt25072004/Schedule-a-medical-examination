import 'package:flutter/material.dart';

class LegalScreen extends StatelessWidget {
  const LegalScreen({super.key});

  // --- Màu chủ đạo ---
  final Color primaryColor = Colors.greenAccent;
  final Color primaryDarkColor = const Color(0xFF1B5E20);

  // Ngày giả định đồng ý
  static const String consentDate = '15/01/2024';

  // --- Widget helper cho khối Cài đặt (Tiêu đề lớn trong big box viền ngoài cùng) ---
  Widget _buildSettingsBlock({
    required String title,
    required Widget child,
  }) {
    return Card(
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 8, left: 0, right: 0, top: 0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200), // Viền lớn ngoài cùng cho toàn bộ block
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tiêu đề lớn nằm trong big box, KHÔNG có viền riêng
          Padding(
            padding: const EdgeInsets.only(top: 12, bottom: 8, left: 16, right: 16),
            child: Text(
              title,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: primaryDarkColor),
            ),
          ),
          // Nội dung card (viền thứ 2 mỏng hơn)
          child,
        ],
      ),
    );
  }

  // --- Widget Card cho MỘT CHÍNH SÁCH/ĐIỀU KHOẢN (Độc lập, có 2 viền, viền trong mỏng hơn) ---
  Widget _buildSinglePolicyCard(
      BuildContext context, String title, String description) {
    return Card(
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 16, left: 16, right: 16), // Padding để khớp với tiêu đề
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200), // Viền ngoài của Card
      ),
      child: Container( // Thêm Container này để tạo viền thứ 2 (mỏng hơn)
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10), // Bo góc nhẹ hơn viền ngoài
          border: Border.all(color: Colors.grey.shade300, width: 0.5), // Viền bên trong mỏng hơn (width 0.5)
        ),
        padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.description_outlined, size: 24, color: Colors.grey),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(left: 34.0, top: 4),
              child: Text(
                description,
                style: TextStyle(fontSize: 13, color: Colors.grey[600]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 34.0, top: 16, bottom: 4),
              child: Row(
                children: [
                  // Nút Xem
                  OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Đang mở: $title')),
                      );
                    },
                    icon: const Icon(Icons.open_in_new, size: 18),
                    label: const Text('Xem'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.black87,
                      side: BorderSide(color: Colors.grey.shade400),
                    ),
                  ),
                  const SizedBox(width: 10),
                  // Nút Tải
                  OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Đang tải: $title')),
                      );
                    },
                    icon: const Icon(Icons.download, size: 18),
                    label: const Text('Tải'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.black87,
                      side: BorderSide(color: Colors.grey.shade400),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- Widget item Đồng ý (Sử dụng Checkbox để giống UI ảnh) ---
  Widget _buildConsentItem(String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.check_circle, size: 20, color: Colors.green.shade700),
          const SizedBox(width: 10),
          Expanded(
            child: Text.rich(
              TextSpan(
                text: label,
                style: const TextStyle(fontSize: 15, color: Colors.black87),
                children: [
                  TextSpan(
                    text: ' (Ngày $consentDate)',
                    style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Widget helper cho các mục Giấy phép (Bullet đen để giống)
  Widget _buildLicensePoint(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.bold)),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 14, color: Colors.black87))),
        ],
      ),
    );
  }

  // Widget helper cho mục Liên hệ
  Widget _buildContactItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.grey),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
              Text(value, style: const TextStyle(fontSize: 15, color: Colors.black87)),
            ],
          ),
        ],
      ),
    );
  }

  // --- Widget Card chung cho các phần không phải policy (viền đôi, viền trong mỏng hơn) ---
  Widget _buildGeneralCard({
    required Widget child,
    bool isLicense = false,
  }) {
    return Card(
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 16, left: 16, right: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200), // Viền ngoài
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.grey.shade300, width: 0.5), // Viền thứ 2 mỏng hơn
        ),
        padding: const EdgeInsets.all(16.0),
        child: isLicense
            ? Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue.shade50,
            borderRadius: BorderRadius.circular(12),
          ),
          child: child,
        )
            : child,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F5), // Nền xám nhạt
      appBar: AppBar(
        title: const Text("Pháp lý"),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 1,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100), // Padding bottom 100px
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [

            SizedBox(height: 20),

            // --- 1. TIÊU ĐỀ LỚN: Điều khoản điều kiện (Toàn bộ trong big box viền ngoài) ---
            _buildSettingsBlock(
              title: "Điều khoản điều kiện",
              child: _buildSinglePolicyCard(
                context,
                'Điều khoản sử dụng dịch vụ',
                'Quy định về quyền và nghĩa vụ khi sử dụng nền tảng đặt lịch khám',
              ),
            ),

            SizedBox(height: 20),

            // --- 2. TIÊU ĐỀ LỚN: Chính sách bảo mật ---
            _buildSettingsBlock(
              title: "Chính sách bảo mật",
              child: _buildSinglePolicyCard(
                context,
                'Chính sách bảo mật thông tin',
                'Cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân và y tế của bạn',
              ),
            ),

            SizedBox(height: 20),

            // --- 3. TIÊU ĐỀ LỚN: Chính sách hồ sơ y tế ---
            _buildSettingsBlock(
              title: "Chính sách hồ sơ y tế",
              child: _buildSinglePolicyCard(
                context,
                'Chính sách hồ sơ y tế',
                'Quy định về lưu trữ, chia sẻ và bảo mật hồ sơ bệnh án điện tử',
              ),
            ),

            SizedBox(height: 20),

            // --- 4. TIÊU ĐỀ LỚN: Thanh toán & hoàn tiền ---
            _buildSettingsBlock(
              title: "Thanh toán & hoàn tiền",
              child: _buildSinglePolicyCard(
                context,
                'Chính sách thanh toán và hoàn tiền',
                'Quy định về phương thức thanh toán, hủy lịch và hoàn tiền',
              ),
            ),

            SizedBox(height: 20),

            // --- 5. TIÊU ĐỀ LỚN: Quản lí đồng ý ---
            _buildSettingsBlock(
              title: "Quản lí đồng ý",
              child: _buildGeneralCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildConsentItem('Điều khoản sử dụng dịch vụ'),
                    _buildConsentItem('Chính sách bảo mật'),
                    _buildConsentItem('Chia sẻ thông tin y tế với bác sĩ'),
                    _buildConsentItem('Nhận thông báo qua email và SMS'),
                  ],
                ),
              ),
            ),

            SizedBox(height: 20),

            // --- 6. TIÊU ĐỀ LỚN: Giấy phép chứng nhận ---
            _buildSettingsBlock(
              title: "Giấy phép chứng nhận",
              child: _buildGeneralCard(
                isLicense: true,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Nền tảng đặt lịch khám của chúng tôi được cấp phép và chứng nhận bởi:',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
                    ),
                    const SizedBox(height: 8),
                    _buildLicensePoint('BỘ Y TẾ VIỆT NAM - Giấy phép hoạt động số: 123/GP-BYT'),
                    _buildLicensePoint('ISO 27001:2013 - Bảo mật thông tin'),
                    _buildLicensePoint('ISO 9001:2015 - Hệ thống quản lý chất lượng'),
                    _buildLicensePoint('Tuân thủ GDPR và Luật An toàn thông tin mạng'),
                  ],
                ),
              ),
            ),

            SizedBox(height: 20),

            // --- 7. TIÊU ĐỀ LỚN: Liên hệ pháp lí ---
            _buildSettingsBlock(
              title: "Liên hệ pháp lí",
              child: _buildGeneralCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Nếu bạn có bất kỳ câu hỏi nào về các điều khoản pháp lý, vui lòng liên hệ:',
                      style: TextStyle(fontSize: 14, color: Colors.black87),
                    ),
                    const SizedBox(height: 12),
                    _buildContactItem(Icons.email_outlined, 'Email', 'legal@healthapp.vn'),
                    _buildContactItem(Icons.phone_outlined, 'Điện thoại', '1900 xxxx'),
                    _buildContactItem(Icons.location_on_outlined, 'Địa chỉ', '123 Nguyễn Huệ, Q.1, TP.HCM'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}