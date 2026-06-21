import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:clinic_booking_system/logics/auth/providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'package:clinic_booking_system/core/network/dio_client.dart';
import 'package:dio/dio.dart';
import 'package:clinic_booking_system/core/utils/api_config.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class NotificationHistoryPage extends StatefulWidget {
  const NotificationHistoryPage({super.key});

  @override
  State<NotificationHistoryPage> createState() => _NotificationHistoryPageState();
}

class _NotificationHistoryPageState extends State<NotificationHistoryPage> {
  // --- Styling Palette ---


  final Color bgGray = const Color(0xFFF5F7FA);

  bool _isLoading = true;
  List<dynamic> _notifications = [];

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;
    if (user == null) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }

    try {
      final url = '${ApiConfig.baseUrl}/notifications/user/${user.id}';
      final response = await DioClient().dio.get(url);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        if (mounted) {
          setState(() {
            _notifications = data;
            _isLoading = false;
          });
        }
      } else {
        throw Exception('Lỗi server: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('🔥 Lỗi tải danh sách thông báo: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _markAsRead(int id, int index) async {
    // Đánh dấu đã đọc trên UI trước để có cảm giác mượt mà tức thời
    if (mounted) {
      setState(() {
        _notifications[index]['is_read'] = true;
      });
    }

    try {
      final url = '${ApiConfig.baseUrl}/notifications/$id/read';
      await DioClient().dio.patch(url);
    } catch (e) {
      debugPrint('🔥 Lỗi đánh dấu đã đọc: $e');
    }
  }

  Future<void> _markAllAsRead() async {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;
    if (user == null || _notifications.isEmpty) return;

    // Cập nhật UI trước
    if (mounted) {
      setState(() {
        for (var notif in _notifications) {
          notif['is_read'] = true;
        }
      });
    }

    try {
      final url = '${ApiConfig.baseUrl}/notifications/user/${user.id}/read-all';
      await DioClient().dio.patch(url);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.done_all, color: Colors.white),
              SizedBox(width: 8),
              Text('Đã đánh dấu tất cả thông báo là đã đọc!'),
            ],
          ),
          backgroundColor: AppColors.primaryDark,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    } catch (e) {
      debugPrint('🔥 Lỗi đánh dấu tất cả đã đọc: $e');
    }
  }

  // --- Trả về thông tin Icon và Màu sắc tương ứng với từng loại thông báo ---
  Map<String, dynamic> _getNotificationStyle(String type) {
    switch (type) {
      case 'maintenance':
        return {
          'icon': Icons.build_outlined,
          'color': Colors.amber.shade700,
          'bgColor': Colors.amber.shade50,
          'label': 'Bảo trì hệ thống',
        };
      case 'appointment_pending':
        return {
          'icon': Icons.pending_actions_rounded,
          'color': Colors.indigo.shade600,
          'bgColor': Colors.indigo.shade50,
          'label': 'Đang chờ duyệt',
        };
      case 'appointment_confirmed':
        return {
          'icon': Icons.check_circle_outline_rounded,
          'color': AppColors.primary,
          'bgColor': AppColors.primaryLight,
          'label': 'Lịch hẹn đã xác nhận',
        };
      case 'appointment_cancelled':
        return {
          'icon': Icons.cancel_outlined,
          'color': Colors.red.shade600,
          'bgColor': Colors.red.shade50,
          'label': 'Lịch khám bị hủy',
        };
      case 'appointment_completed':
        return {
          'icon': Icons.assignment_turned_in_outlined,
          'color': AppColors.primary,
          'bgColor': AppColors.primaryLight,
          'label': 'Hoàn thành buổi khám',
        };
      case 'system':
      default:
        return {
          'icon': Icons.campaign_outlined,
          'color': Colors.blue.shade600,
          'bgColor': Colors.blue.shade50,
          'label': 'Thông báo hệ thống',
        };
    }
  }

  String _formatDateTime(String isoString) {
    try {
      final dateTime = DateTime.parse(isoString).toLocal();
      final hour = dateTime.hour.toString().padLeft(2, '0');
      final minute = dateTime.minute.toString().padLeft(2, '0');
      final day = dateTime.day.toString().padLeft(2, '0');
      final month = dateTime.month.toString().padLeft(2, '0');
      final year = dateTime.year;
      return '$hour:$minute - $day/$month/$year';
    } catch (_) {
      return '';
    }
  }

  void _showDetailsDialog(Map<String, dynamic> notification) {
    final style = _getNotificationStyle(notification['type'] ?? 'system');

    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.4),
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24.0),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header Dialog
              Container(
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                decoration: BoxDecoration(
                  color: style['bgColor'],
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(24),
                    topRight: Radius.circular(24),
                  ),
                ),
                child: Center(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: style['color'].withOpacity(0.2),
                              blurRadius: 10,
                              spreadRadius: 2,
                            )
                          ],
                        ),
                        child: Icon(
                          style['icon'],
                          color: style['color'],
                          size: 32,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        style['label'],
                        style: TextStyle(
                          color: style['color'],
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Body Dialog
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      notification['title'] ?? 'Thông báo',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      notification['body'] ?? '',
                      style: const TextStyle(
                        fontSize: 14.5,
                        color: Colors.black54,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    Divider(color: Colors.grey.shade200, height: 1),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.access_time_rounded, size: 16, color: Colors.grey),
                        const SizedBox(width: 6),
                        Text(
                          _formatDateTime(notification['created_at'] ?? ''),
                          style: const TextStyle(
                            fontSize: 12.5,
                            color: Colors.grey,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Footer Action
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text(
                      'Đóng',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => n['is_read'] == false).length;

    return Scaffold(
      backgroundColor: bgGray,
      appBar: AppBar(
        title: const Text(
          "Lịch sử thông báo",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 1,
        actions: [
          IconButton(
            icon: Icon(
              Icons.done_all_rounded,
              color: unreadCount > 0 ? AppColors.primary : Colors.grey,
            ),
            tooltip: 'Đánh dấu tất cả đã đọc',
            onPressed: unreadCount > 0 ? _markAllAsRead : null,
          ),
        ],
      ),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            )
          : RefreshIndicator(
              onRefresh: _fetchNotifications,
              color: AppColors.primary,
              child: _notifications.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      itemCount: _notifications.length,
                      itemBuilder: (context, index) {
                        final notif = _notifications[index];
                        final isUnread = notif['is_read'] == false;
                        final style = _getNotificationStyle(notif['type'] ?? 'system');

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.03),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              )
                            ],
                            border: isUnread
                                ? Border.all(color: style['color'].withOpacity(0.3), width: 1)
                                : null,
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () {
                                if (isUnread) {
                                  _markAsRead(notif['id'], index);
                                }
                                _showDetailsDialog(notif);
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Icon block with dynamic styling
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: style['bgColor'],
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        style['icon'],
                                        color: style['color'],
                                        size: 24,
                                      ),
                                    ),
                                    const SizedBox(width: 14),
                                    // Notification Texts
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                style['label'],
                                                style: TextStyle(
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.w700,
                                                  color: style['color'],
                                                  letterSpacing: 0.5,
                                                ),
                                              ),
                                              if (isUnread)
                                                Container(
                                                  width: 8,
                                                  height: 8,
                                                  decoration: BoxDecoration(
                                                    color: style['color'],
                                                    shape: BoxShape.circle,
                                                  ),
                                                ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            notif['title'] ?? 'Thông báo',
                                            style: TextStyle(
                                              fontSize: 15,
                                              fontWeight: isUnread ? FontWeight.bold : FontWeight.w600,
                                              color: Colors.black87,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            notif['body'] ?? '',
                                            style: const TextStyle(
                                              fontSize: 13,
                                              color: Colors.black54,
                                              height: 1.3,
                                            ),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            _formatDateTime(notif['created_at'] ?? ''),
                                            style: const TextStyle(
                                              fontSize: 11,
                                              color: Colors.grey,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.teal.shade50,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.notifications_none_rounded,
                  size: 80,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Chưa có thông báo nào!',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Mọi tin tức cập nhật, bảo trì hệ thống hoặc xác nhận trạng thái lịch khám của bạn sẽ xuất hiện tại đây.',
                style: TextStyle(
                  fontSize: 14.5,
                  color: Colors.black45,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}





