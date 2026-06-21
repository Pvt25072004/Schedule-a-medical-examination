import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:clinic_booking_system/logics/auth/providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'package:clinic_booking_system/logics/user/providers/user_provider.dart';
import 'package:clinic_booking_system/core/network/dio_client.dart';
import 'package:dio/dio.dart';
import 'package:clinic_booking_system/core/utils/api_config.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class NotificationSettingsPage extends StatefulWidget {
  const NotificationSettingsPage({super.key});

  @override
  State<NotificationSettingsPage> createState() => _NotificationSettingsPageState();
}

class _NotificationSettingsPageState extends State<NotificationSettingsPage> {
  // --- Màu chủ đạo ---



  bool _isLoading = true;

  // --- Master Switch ---
  bool _notificationsEnabled = true;

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

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;
    if (user == null) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      final userProvider = context.read<UserProvider>();
      if (userProvider.userData == null) {
        await userProvider.fetchUserData(user.id);
      }
      final data = userProvider.userData;
      if (data == null) {
        setState(() => _isLoading = false);
        return;
      }
      final settings = data['notification_settings'];

      if (settings != null && settings is Map) {
        setState(() {
          _notificationsEnabled = settings['enabled'] ?? true;
          _pushAppointment = settings['push_appointment'] ?? true;
          _pushConfirmation = settings['push_confirmation'] ?? true;
          _pushChange = settings['push_change'] ?? true;
          _pushResult = settings['push_result'] ?? true;

          _emailNewsletter = settings['email_newsletter'] ?? true;
          _emailPromotions = settings['email_promotions'] ?? false;
          _emailArticles = settings['email_articles'] ?? true;
          _emailSystem = settings['email_system'] ?? false;

          _smsReminder = settings['sms_reminder'] ?? true;
          _smsOTP = settings['sms_otp'] ?? true;
          _smsEmergency = settings['sms_emergency'] ?? true;

          _firstReminderTime = settings['first_reminder_time'] ?? '24 giờ trước';
          _secondReminderTime = settings['second_reminder_time'] ?? '2 giờ trước';
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint('🔥 Lỗi tải cấu hình thông báo: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _updateSetting(String key, dynamic value) async {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;
    if (user == null) return;

    // Lập cấu hình để lưu lên NestJS
    final updatedSettings = {
      'enabled': _notificationsEnabled,
      'push_appointment': _pushAppointment,
      'push_confirmation': _pushConfirmation,
      'push_change': _pushChange,
      'push_result': _pushResult,
      'email_newsletter': _emailNewsletter,
      'email_promotions': _emailPromotions,
      'email_articles': _emailArticles,
      'email_system': _emailSystem,
      'sms_reminder': _smsReminder,
      'sms_otp': _smsOTP,
      'sms_emergency': _smsEmergency,
      'first_reminder_time': _firstReminderTime,
      'second_reminder_time': _secondReminderTime,
    };

    updatedSettings[key] = value;

    try {
      final url = '${ApiConfig.baseUrl}/users/${user.id}';
      await DioClient().dio.patch(
        url,
        data: {
          'notification_settings': updatedSettings,
        },
      );
    } catch (e) {
      debugPrint('🔥 Lỗi cập nhật cấu hình thông báo: $e');
    }
  }

  Future<void> _toggleMasterNotifications(bool enabled) async {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;
    if (user == null) return;

    setState(() {
      _notificationsEnabled = enabled;
    });

    String? fcmToken = '';
    if (enabled) {
      try {
        fcmToken = await FirebaseMessaging.instance.getToken();
      } catch (e) {
        debugPrint('⚠️ Lỗi lấy FCM Token: $e');
      }
    }

    final updatedSettings = {
      'enabled': enabled,
      'push_appointment': _pushAppointment,
      'push_confirmation': _pushConfirmation,
      'push_change': _pushChange,
      'push_result': _pushResult,
      'email_newsletter': _emailNewsletter,
      'email_promotions': _emailPromotions,
      'email_articles': _emailArticles,
      'email_system': _emailSystem,
      'sms_reminder': _smsReminder,
      'sms_otp': _smsOTP,
      'sms_emergency': _smsEmergency,
      'first_reminder_time': _firstReminderTime,
      'second_reminder_time': _secondReminderTime,
    };

    try {
      final url = '${ApiConfig.baseUrl}/users/${user.id}';
      await DioClient().dio.patch(
        url,
        data: {
          'fcm_token': fcmToken ?? '',
          'notification_settings': updatedSettings,
        },
      );
      debugPrint('🔔 Master Notification updated: enabled=$enabled, token=$fcmToken');
    } catch (e) {
      debugPrint('🔥 Lỗi bật/tắt master notification: $e');
    }
  }

  // --- Widget helper cho mỗi mục Switch ---
  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    bool isLast = false,
  }) {
    final bool isTileEnabled = _notificationsEnabled;

    return Container(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 8.0),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            color: isTileEnabled ? Colors.black87 : Colors.grey,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            fontSize: 13,
            color: isTileEnabled ? Colors.grey[600] : Colors.grey[400],
          ),
        ),
        trailing: Switch(
          value: isTileEnabled ? value : false,
          onChanged: isTileEnabled ? onChanged : null,
          activeColor: AppColors.primary,
        ),
        onTap: isTileEnabled ? () => onChanged(!value) : null,
      ),
    );
  }

  // --- Widget helper cho khối Cài đặt ---
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
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: _notificationsEnabled ? AppColors.primaryDark : Colors.grey,
            ),
          ),
        ),
        Card(
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Column(
              children: children,
            ),
          ),
        ),
      ],
    );
  }

  // --- Widget helper cho Dropdown Tile ---
  Widget _buildDropdownTile({
    required String title,
    required String subtitle,
    required String value,
    required ValueChanged<String?> onChanged,
    required List<String> options,
  }) {
    final bool isTileEnabled = _notificationsEnabled;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            color: isTileEnabled ? Colors.black87 : Colors.grey,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            fontSize: 13,
            color: isTileEnabled ? Colors.grey : Colors.grey[400],
          ),
        ),
        trailing: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            value: value,
            icon: Icon(
              Icons.keyboard_arrow_down,
              color: isTileEnabled ? Colors.grey : Colors.grey[300],
            ),
            style: TextStyle(
              fontSize: 15,
              color: isTileEnabled ? AppColors.primaryDark : Colors.grey,
              fontWeight: FontWeight.w600,
            ),
            onChanged: isTileEnabled ? onChanged : null,
            items: options.map<DropdownMenuItem<String>>((String val) {
              return DropdownMenuItem<String>(
                value: val,
                enabled: isTileEnabled,
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
      backgroundColor: const Color(0xFFF0F2F5),
      appBar: AppBar(
        title: const Text("Cài đặt thông báo", style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 1,
      ),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Master Control Switch Card
                  Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    color: AppColors.primaryDark,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.notifications_active_rounded,
                              color: Colors.white,
                              size: 28,
                            ),
                          ),
                          const SizedBox(width: 16),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Nhận thông báo ứng dụng",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 17,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  "Bật/Tắt toàn bộ thông báo của hệ thống",
                                  style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Switch(
                            value: _notificationsEnabled,
                            onChanged: _toggleMasterNotifications,
                            activeColor: Colors.white,
                            activeTrackColor: AppColors.primary,
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 10),

                  // 1. KHỐI THÔNG BÁO ĐẨY (PUSH NOTIFICATIONS)
                  _buildSettingsBlock(
                    title: "Thông báo đẩy (FCM)",
                    children: [
                      _buildSwitchTile(
                        title: 'Lịch hẹn sắp tới',
                        subtitle: 'Nhận thông báo trước lịch khám',
                        value: _pushAppointment,
                        onChanged: (val) {
                          setState(() => _pushAppointment = val);
                          _updateSetting('push_appointment', val);
                        },
                      ),
                      _buildSwitchTile(
                        title: 'Xác nhận đặt lịch',
                        subtitle: 'Thông báo khi đặt lịch thành công',
                        value: _pushConfirmation,
                        onChanged: (val) {
                          setState(() => _pushConfirmation = val);
                          _updateSetting('push_confirmation', val);
                        },
                      ),
                      _buildSwitchTile(
                        title: 'Thay đổi lịch hẹn',
                        subtitle: 'Thông báo khi có thay đổi từ bác sĩ',
                        value: _pushChange,
                        onChanged: (val) {
                          setState(() => _pushChange = val);
                          _updateSetting('push_change', val);
                        },
                      ),
                      _buildSwitchTile(
                        title: 'Kết quả xét nghiệm',
                        subtitle: 'Thông báo khi có kết quả mới',
                        value: _pushResult,
                        onChanged: (val) {
                          setState(() => _pushResult = val);
                          _updateSetting('push_result', val);
                        },
                        isLast: true,
                      ),
                    ],
                  ),

                  const SizedBox(height: 15),

                  // 2. KHỐI THÔNG BÁO EMAIL
                  _buildSettingsBlock(
                    title: "Thông báo Email",
                    children: [
                      _buildSwitchTile(
                        title: 'Bản tin hàng tuần',
                        subtitle: 'Tóm tắt lịch khám và sức khỏe',
                        value: _emailNewsletter,
                        onChanged: (val) {
                          setState(() => _emailNewsletter = val);
                          _updateSetting('email_newsletter', val);
                        },
                      ),
                      _buildSwitchTile(
                        title: 'Khuyến mãi và ưu đãi',
                        subtitle: 'Nhận thông tin về các chương trình',
                        value: _emailPromotions,
                        onChanged: (val) {
                          setState(() => _emailPromotions = val);
                          _updateSetting('email_promotions', val);
                        },
                      ),
                      _buildSwitchTile(
                        title: 'Bài viết sức khỏe',
                        subtitle: 'Mẹo và lời khuyên từ chuyên gia',
                        value: _emailArticles,
                        onChanged: (val) {
                          setState(() => _emailArticles = val);
                          _updateSetting('email_articles', val);
                        },
                      ),
                      _buildSwitchTile(
                        title: 'Cập nhật hệ thống',
                        subtitle: 'Thông tin về tính năng mới',
                        value: _emailSystem,
                        onChanged: (val) {
                          setState(() => _emailSystem = val);
                          _updateSetting('email_system', val);
                        },
                        isLast: true,
                      ),
                    ],
                  ),

                  const SizedBox(height: 15),

                  // 3. KHỐI THÔNG BÁO SMS
                  _buildSettingsBlock(
                    title: "Thông báo SMS",
                    children: [
                      _buildSwitchTile(
                        title: 'Nhắc nhở lịch hẹn',
                        subtitle: 'SMS nhắc trước 24h và 2h',
                        value: _smsReminder,
                        onChanged: (val) {
                          setState(() => _smsReminder = val);
                          _updateSetting('sms_reminder', val);
                        },
                      ),
                      _buildSwitchTile(
                        title: 'Mã OTP bảo mật',
                        subtitle: 'Xác thực đăng nhập và giao dịch',
                        value: _smsOTP,
                        onChanged: (val) {
                          setState(() => _smsOTP = val);
                          _updateSetting('sms_otp', val);
                        },
                      ),
                      _buildSwitchTile(
                        title: 'Thông báo khẩn cấp',
                        subtitle: 'Cảnh báo y tế quan trọng',
                        value: _smsEmergency,
                        onChanged: (val) {
                          setState(() => _smsEmergency = val);
                          _updateSetting('sms_emergency', val);
                        },
                        isLast: true,
                      ),
                    ],
                  ),

                  const SizedBox(height: 15),

                  // 4. KHỐI THỜI GIAN NHẮC NHỞ (DROPDOWN)
                  _buildSettingsBlock(
                    title: "Thời gian nhắc nhở",
                    children: [
                      _buildDropdownTile(
                        title: 'Nhắc nhở lịch hẹn lần 1',
                        subtitle: _firstReminderTime.contains('24') ? 'Khuyến nghị: 24 giờ trước' : 'Thời gian nhắc nhở đầu tiên',
                        value: _firstReminderTime,
                        options: _reminderOptions,
                        onChanged: (String? newValue) {
                          if (newValue != null) {
                            setState(() {
                              _firstReminderTime = newValue;
                            });
                            _updateSetting('first_reminder_time', newValue);
                          }
                        },
                      ),
                      _buildDropdownTile(
                        title: 'Nhắc nhở lịch hẹn lần 2',
                        subtitle: _secondReminderTime.contains('2') ? 'Khuyến nghị: 2 giờ trước' : 'Thời gian nhắc nhở thứ hai',
                        value: _secondReminderTime,
                        options: _reminderOptions,
                        onChanged: (String? newValue) {
                          if (newValue != null) {
                            setState(() {
                              _secondReminderTime = newValue;
                            });
                            _updateSetting('second_reminder_time', newValue);
                          }
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





