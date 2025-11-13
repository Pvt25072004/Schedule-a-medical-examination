import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

// --- Cài đặt Màu Chủ đạo (Phải đồng bộ với SettingScreen) ---
const Color primaryColor = Colors.greenAccent;
const Color primaryDarkColor = const Color(0xFF1B5E20);

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  // --- Widget helper cho khối lớn (Tiêu đề lớn trong big box viền ngoài cùng) ---
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

  // --- Widget Card cho MỘT KÊNH LIÊN HỆ (Độc lập, có icon, viền đôi) ---
  Widget _buildContactCard(
      BuildContext context,
      IconData icon,
      String title,
      String subtitle,
      VoidCallback? onTap,
      ) {
    return Card(
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 16, left: 16, right: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200), // Viền ngoài của Card
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container( // Thêm Container này để tạo viền thứ 2 (mỏng hơn)
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10), // Bo góc nhẹ hơn viền ngoài
            border: Border.all(color: Colors.grey.shade300, width: 0.5), // Viền bên trong mỏng hơn (width 0.5)
          ),
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 24, color: Colors.blue.shade600),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }

  // --- Widget cho các mục ListTile trong 'Tài nguyên hữu ích' (với viền đôi) ---
  Widget _buildHelpListTile({
    required BuildContext context,
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color iconColor = Colors.black54,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade300, width: 0.5),
          ),
          child: ListTile(
            leading: Icon(icon, color: iconColor),
            title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
          ),
        ),
      ),
    );
  }

  // --- Widget helper cho nút Gửi phản hồi (với viền đôi) ---
  Widget _buildFeedbackButton(BuildContext context, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: onTap,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.black,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: const Text('Gửi phản hồi', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  // --- Widget helper cho các nút mạng xã hội (với viền đôi) ---
  Widget _buildSocialButton(String title, VoidCallback onTap) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.all(4.0),
        child: OutlinedButton(
          onPressed: onTap,
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 12),
            side: const BorderSide(color: Colors.grey, width: 0.5),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: Text(title, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w500)),
        ),
      ),
    );
  }

  // --- Widget Card chung cho các phần không phải contact (viền đôi, viền trong mỏng hơn) ---
  Widget _buildGeneralCard({
    required Widget child,
    bool isInfo = false,
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
        child: isInfo
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

  // Hàm launch URL để tránh lỗi lint
  Future<void> _launchUrl(BuildContext context, String url, String fallbackMessage) async {
    if (!await launchUrl(Uri.parse(url))) {
      showAppSnackBar(context, fallbackMessage);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F5), // Nền xám nhạt như cấu trúc cũ
      appBar: AppBar(
        title: const Text("Trợ giúp & Hỗ trợ"),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 1,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100), // Padding bottom 100px như cũ
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [

            SizedBox(height: 20),

            // --- 1. TIÊU ĐỀ LỚN: Liên hệ hỗ trợ (Toàn bộ trong big box viền ngoài) ---
            _buildSettingsBlock(
              title: "Liên hệ hỗ trợ",
              child: Column(
                children: [
                  _buildContactCard(
                    context,
                    Icons.chat_bubble_outline,
                    'Chat trực tuyến',
                    'Kết nối với chuyên viên hỗ trợ 24/7',
                        () {
                      showAppSnackBar(context, 'Mở cửa sổ Chat trực tuyến...');
                    },
                  ),
                  _buildContactCard(
                    context,
                    Icons.phone_in_talk_outlined,
                    '1900 xxxx',
                    'Gọi hotline hỗ trợ nhanh chóng',
                        () async {
                      const url = 'tel:1900xxxx';
                      if (await canLaunchUrl(Uri.parse(url))) {
                        await launchUrl(Uri.parse(url));
                      } else {
                        showAppSnackBar(context, 'Không thể gọi số điện thoại này.');
                      }
                    },
                  ),
                  _buildContactCard(
                    context,
                    Icons.email_outlined,
                    'Email hỗ trợ',
                    'Gửi câu hỏi qua email để được hỗ trợ chi tiết',
                        () async {
                      const email = 'mailto:support@appdomain.com?subject=Yeu cau ho tro';
                      if (await canLaunchUrl(Uri.parse(email))) {
                        await launchUrl(Uri.parse(email));
                      } else {
                        showAppSnackBar(context, 'Không thể mở ứng dụng email.');
                      }
                    },
                  ),
                  _buildContactCard(
                    context,
                    Icons.auto_stories_outlined,
                    'Trợ giúp',
                    'Truy cập trung tâm trợ giúp tự phục vụ',
                        () {
                      showAppSnackBar(context, 'Mở trang Trung tâm Trợ giúp (FAQ)...');
                    },
                  ),
                ],
              ),
            ),

            SizedBox(height: 20),

            // --- 2. TIÊU ĐỀ LỚN: Tài nguyên hữu ích ---
            _buildSettingsBlock(
              title: "Tài nguyên hữu ích",
              child: _buildGeneralCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHelpListTile(
                      context: context,
                      icon: Icons.phone_android_outlined,
                      title: 'Hướng dẫn cho người dùng mới',
                      onTap: () { showAppSnackBar(context, 'Xem Hướng dẫn...'); },
                    ),
                    _buildHelpListTile(
                      context: context,
                      icon: Icons.ondemand_video,
                      title: 'Video hướng dẫn',
                      onTap: () { showAppSnackBar(context, 'Xem Video hướng dẫn...'); },
                    ),
                    _buildHelpListTile(
                      context: context,
                      icon: Icons.groups_2_outlined,
                      title: 'Cộng đồng người dùng',
                      onTap: () { showAppSnackBar(context, 'Tham gia Cộng đồng...'); },
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: 20),

            // --- 3. TIÊU ĐỀ LỚN: Gửi phản hồi ---
            _buildSettingsBlock(
              title: "Gửi phản hồi",
              child: _buildGeneralCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ. Hãy cho chúng tôi biết trải nghiệm của bạn.',
                      style: TextStyle(fontSize: 13, color: Colors.black54),
                    ),
                    const SizedBox(height: 10),
                    _buildFeedbackButton(context, () { showAppSnackBar(context, 'Mở form Gửi phản hồi...'); }),
                  ],
                ),
              ),
            ),

            SizedBox(height: 20),

            // --- 4. TIÊU ĐỀ LỚN: Thông tin ứng dụng ---
            _buildSettingsBlock(
              title: "Thông tin ứng dụng",
              child: _buildGeneralCard(
                isInfo: true,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Phiên bản
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('Phiên bản', style: TextStyle(fontSize: 14, color: Colors.black)),
                        Text('2.5.1', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Cập nhật lần cuối
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('Cập nhật lần cuối', style: TextStyle(fontSize: 14, color: Colors.black)),
                        Text('1 Tháng 11, 2024', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Giấy phép
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('Giấy phép', style: TextStyle(fontSize: 14, color: Colors.black)),
                        Text('123/GP-BYT', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const SizedBox(height: 15),
                    // Nút Kiểm tra cập nhật
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () { showAppSnackBar(context, 'Kiểm tra cập nhật...'); },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: const BorderSide(color: Colors.grey, width: 0.5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Kiểm tra cập nhật', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: 20),

            // --- 5. TIÊU ĐỀ LỚN: Kết nối với chúng tôi ---
            _buildSettingsBlock(
              title: "Kết nối với chúng tôi",
              child: _buildGeneralCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        _buildSocialButton('Facebook', () { showAppSnackBar(context, 'Mở Facebook...'); }),
                        _buildSocialButton('Zalo', () { showAppSnackBar(context, 'Mở Zalo...'); }),
                      ],
                    ),
                    Row(
                      children: [
                        _buildSocialButton('Instagram', () { showAppSnackBar(context, 'Mở Instagram...'); }),
                        _buildSocialButton('YouTube', () { showAppSnackBar(context, 'Mở YouTube...'); }),
                      ],
                    ),
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