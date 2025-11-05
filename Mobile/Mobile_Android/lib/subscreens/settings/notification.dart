import 'package:flutter/material.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  // --- Màu chủ đạo ---
  final Color primaryColor = Colors.greenAccent;
  final Color primaryDarkColor = const Color(0xFF1B5E20);

  // --- Trạng thái cho Thông báo đẩy ---
  bool _pushAppointment = true;
  bool _pushConfirmation = true;
  bool _pushChange = true;
  bool _pushResult = true;

  // --- Trạng thái cho Thông báo Email ---
  bool _emailNewsletter = true;
  bool _emailPromotions = false;
  bool _emailArticles = true;
  bool _emailSystem = false;

  // --- Trạng thái cho Thông báo SMS ---
  bool _smsReminder = true;
  bool _smsOTP = true;
  bool _smsEmergency = true;

  // --- Trạng thái cho Thời gian nhắc nhở ---
  String _firstReminderTime = '24 giờ trước';
  String _secondReminderTime = '2 giờ trước';
  final List<String> _reminderOptions = ['1 giờ trước', '2 giờ trước', '4 giờ trước', '24 giờ trước', '48 giờ trước'];


  // --- Widget helper cho mỗi mục Switch (ĐÃ BỎ DIVIDER) ---
  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    bool isLast = false, // Thêm flag để kiểm soát khoảng cách
  }) {
    return Container(
      // Thêm padding dưới để tạo khoảng cách giữa các mục
      padding: EdgeInsets.only(bottom: isLast ? 0 : 8.0),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
        subtitle: Text(subtitle, style: TextStyle(fontSize: 13, color: Colors.grey[600])),
        trailing: Switch(
          value: value,
          onChanged: onChanged,
          activeColor: primaryColor,
        ),
        onTap: () => onChanged(!value),
      ),
    );
  }

  // --- Widget helper cho khối Cài đặt (Bố cục gọn gàng hơn) ---
  Widget _buildSettingsBlock({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 20, bottom: 8, left: 8),
          child: Text(
            title,
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: primaryDarkColor),
          ),
        ),
        Card(
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0), // Padding bên trong Card
            child: Column(
              children: children,
            ),
          ),
        ),
      ],
    );
  }

  // --- Widget helper cho Dropdown Tile (Đã sửa lại để trông thoáng hơn) ---
  Widget _buildDropdownTile({
    required String title,
    required String subtitle,
    required String value,
    required ValueChanged<String?> onChanged,
    required List<String> options,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
        subtitle: Text(subtitle, style: TextStyle(fontSize: 13, color: Colors.grey)),
        trailing: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            value: value,
            icon: const Icon(Icons.keyboard_arrow_down, color: Colors.grey),
            style: TextStyle(fontSize: 15, color: primaryDarkColor, fontWeight: FontWeight.w600),
            onChanged: onChanged,
            items: options.map<DropdownMenuItem<String>>((String val) {
              return DropdownMenuItem<String>(
                value: val,
                child: Text(val),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F5), // Nền xám nhạt
      appBar: AppBar(
        title: const Text("Thông báo"),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 1,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100), // Padding bottom 100px
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [

            // --- 1. KHỐI THÔNG BÁO ĐẨY (PUSH NOTIFICATIONS) ---
            _buildSettingsBlock(
              title: "Thông báo đẩy",
              children: [
                _buildSwitchTile(
                  title: 'Lịch hẹn sắp tới',
                  subtitle: 'Nhận thông báo trước lịch khám',
                  value: _pushAppointment,
                  onChanged: (val) => setState(() => _pushAppointment = val),
                ),
                _buildSwitchTile(
                  title: 'Xác nhận đặt lịch',
                  subtitle: 'Thông báo khi đặt lịch thành công',
                  value: _pushConfirmation,
                  onChanged: (val) => setState(() => _pushConfirmation = val),
                ),
                _buildSwitchTile(
                  title: 'Thay đổi lịch hẹn',
                  subtitle: 'Thông báo khi có thay đổi từ bác sĩ',
                  value: _pushChange,
                  onChanged: (val) => setState(() => _pushChange = val),
                ),
                // Mục cuối cùng
                _buildSwitchTile(
                  title: 'Kết quả xét nghiệm',
                  subtitle: 'Thông báo khi có kết quả mới',
                  value: _pushResult,
                  onChanged: (val) => setState(() => _pushResult = val),
                  isLast: true,
                ),
              ],
            ),

            const SizedBox(height: 20),

            // --- 2. KHỐI THÔNG BÁO EMAIL ---
            _buildSettingsBlock(
              title: "Thông báo Email",
              children: [
                _buildSwitchTile(
                  title: 'Bản tin hàng tuần',
                  subtitle: 'Tóm tắt lịch khám và sức khỏe',
                  value: _emailNewsletter,
                  onChanged: (val) => setState(() => _emailNewsletter = val),
                ),
                _buildSwitchTile(
                  title: 'Khuyến mãi và ưu đãi',
                  subtitle: 'Nhận thông tin về các chương trình',
                  value: _emailPromotions,
                  onChanged: (val) => setState(() => _emailPromotions = val),
                ),
                _buildSwitchTile(
                  title: 'Bài viết sức khỏe',
                  subtitle: 'Mẹo và lời khuyên từ chuyên gia',
                  value: _emailArticles,
                  onChanged: (val) => setState(() => _emailArticles = val),
                ),
                // Mục cuối cùng
                _buildSwitchTile(
                  title: 'Cập nhật hệ thống',
                  subtitle: 'Thông tin về tính năng mới',
                  value: _emailSystem,
                  onChanged: (val) => setState(() => _emailSystem = val),
                  isLast: true,
                ),
              ],
            ),

            const SizedBox(height: 20),

            // --- 3. KHỐI THÔNG BÁO SMS ---
            _buildSettingsBlock(
              title: "Thông báo SMS",
              children: [
                _buildSwitchTile(
                  title: 'Nhắc nhở lịch hẹn',
                  subtitle: 'SMS nhắc trước 24h và 2h',
                  value: _smsReminder,
                  onChanged: (val) => setState(() => _smsReminder = val),
                ),
                _buildSwitchTile(
                  title: 'Mã OTP bảo mật',
                  subtitle: 'Xác thực đăng nhập và giao dịch',
                  value: _smsOTP,
                  onChanged: (val) => setState(() => _smsOTP = val),
                ),
                // Mục cuối cùng
                _buildSwitchTile(
                  title: 'Thông báo khẩn cấp',
                  subtitle: 'Cảnh báo y tế quan trọng',
                  value: _smsEmergency,
                  onChanged: (val) => setState(() => _smsEmergency = val),
                  isLast: true,
                ),
              ],
            ),

            const SizedBox(height: 20),

            // --- 4. KHỐI THỜI GIAN NHẮC NHỞ (DROPDOWN) ---
            _buildSettingsBlock(
              title: "Thời gian nhắc nhở",
              children: [
                // Nhắc nhở lần 1
                _buildDropdownTile(
                  title: 'Nhắc nhở lịch hẹn lần 1',
                  subtitle: _firstReminderTime.contains('24') ? 'Khuyến nghị: 24 giờ trước' : 'Thời gian nhắc nhở đầu tiên',
                  value: _firstReminderTime,
                  options: _reminderOptions,
                  onChanged: (String? newValue) {
                    setState(() {
                      _firstReminderTime = newValue!;
                    });
                  },
                ),
                // Nhắc nhở lần 2
                _buildDropdownTile(
                  title: 'Nhắc nhở lịch hẹn lần 2',
                  subtitle: _secondReminderTime.contains('2') ? 'Khuyến nghị: 2 giờ trước' : 'Thời gian nhắc nhở thứ hai',
                  value: _secondReminderTime,
                  options: _reminderOptions,
                  onChanged: (String? newValue) {
                    setState(() {
                      _secondReminderTime = newValue!;
                    });
                  },
                ),
              ],
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
