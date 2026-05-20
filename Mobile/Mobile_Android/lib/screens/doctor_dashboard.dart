import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../service/auth_service.dart';
import '../service/doctor_service.dart';
import '../service/appointment_service.dart';
import '../welcome/welcome.dart';
import '../dashboard.dart';

class DoctorDashboardScreen extends StatefulWidget {
  const DoctorDashboardScreen({super.key});

  @override
  State<DoctorDashboardScreen> createState() => _DoctorDashboardScreenState();
}

class _DoctorDashboardScreenState extends State<DoctorDashboardScreen> {
  final DoctorService _doctorService = DoctorService();
  final AppointmentService _appointmentService = AppointmentService();

  bool _isLoadingProfile = true;
  bool _isLoadingAppointments = false;
  Map<String, dynamic>? _doctorProfile;
  List<dynamic> _appointments = [];
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _loadDoctorData();
  }

  Future<void> _loadDoctorData() async {
    setState(() => _isLoadingProfile = true);
    final profile = await _doctorService.fetchDoctorProfile();
    
    if (profile != null && mounted) {
      setState(() {
        _doctorProfile = profile;
        _isLoadingProfile = false;
      });
      await _loadAppointments();
    } else if (mounted) {
      setState(() => _isLoadingProfile = false);
    }
  }

  Future<void> _loadAppointments() async {
    if (_doctorProfile == null) return;
    
    setState(() => _isLoadingAppointments = true);
    final String formattedDate = DateFormat('yyyy-MM-dd').format(_selectedDate);
    final doctorId = _doctorProfile!['id'] as int;
    
    final list = await _appointmentService.fetchDoctorAppointments(
      doctorId: doctorId, 
      date: formattedDate,
    );

    if (mounted) {
      setState(() {
        _appointments = list;
        _isLoadingAppointments = false;
      });
    }
  }

  Future<void> _handleSignOut() async {
    await AuthService().signOut();
    if (mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const WelcomeScreen()),
        (route) => false,
      );
    }
  }

  Future<void> _updateStatus(int id, String newStatus) async {
    final success = await _appointmentService.updateAppointmentStatus(
      appointmentId: id, 
      status: newStatus,
    );

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🎯 Đã chuyển trạng thái sang: $newStatus'),
          backgroundColor: Colors.green.shade600,
          behavior: SnackBarBehavior.floating,
        ),
      );
      await _loadAppointments();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🔥 Cập nhật thất bại!'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _showActionDialog(Map<String, dynamic> appt) {
    final int id = appt['id'];
    final String currentStatus = appt['status'] ?? 'pending';
    final String patientName = appt['user'] != null ? appt['user']['full_name'] : 'Khách hàng';
    final String time = appt['appointment_time'] ?? '00:00';

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Xử lý Lịch hẹn',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.blue.shade900),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Bệnh nhân: $patientName ($time)',
              style: TextStyle(color: Colors.grey.shade600),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            
            if (currentStatus == 'pending')
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  _updateStatus(id, 'confirmed');
                },
                icon: const Icon(Icons.check_circle_outline, color: Colors.white),
                label: const Text('Chấp nhận lịch khám', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade600,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            const SizedBox(height: 12),
            
            if (currentStatus == 'confirmed')
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  _updateStatus(id, 'completed');
                },
                icon: const Icon(Icons.done_all, color: Colors.white),
                label: const Text('Hoàn thành khám bệnh', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue.shade600,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            const SizedBox(height: 12),
            
            if (currentStatus != 'cancelled' && currentStatus != 'completed')
              OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  _updateStatus(id, 'cancelled');
                },
                icon: const Icon(Icons.cancel_outlined, color: Colors.red),
                label: const Text('Hủy lịch khám', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final Color themeColor = Colors.teal.shade600;

    if (_isLoadingProfile) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_doctorProfile == null) {
      return Scaffold(
        body: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 80, color: Colors.orange.shade700),
              const SizedBox(height: 16),
              const Text(
                'Không tìm thấy Hồ sơ Bác sĩ',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Email đăng nhập của bạn chưa được ánh xạ vào bảng Danh sách Bác sĩ (doctors). Hãy liên hệ Quản trị viên.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _handleSignOut,
                child: const Text('Đăng xuất'),
              ),
            ],
          ),
        ),
      );
    }

    // Thống kê nhanh
    int pending = _appointments.where((a) => a['status'] == 'pending').length;
    int confirmed = _appointments.where((a) => a['status'] == 'confirmed').length;
    int completed = _appointments.where((a) => a['status'] == 'completed').length;

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 🌟 HEADER HIỆN ĐẠI 
          Container(
            padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.teal.shade700, Colors.teal.shade500],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
              boxShadow: [
                BoxShadow(
                  color: Colors.teal.withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: Colors.white,
                      child: Text(
                        (_doctorProfile!['name'] != null && (_doctorProfile!['name'] as String).isNotEmpty)
                            ? (_doctorProfile!['name'] as String).substring(0, 1)
                            : 'D',
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: themeColor),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Xin chào Bác sĩ 👋',
                            style: TextStyle(color: Colors.white70, fontSize: 14),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _doctorProfile!['name'] ?? 'Bác sĩ',
                            style: const TextStyle(
                              color: Colors.white, 
                              fontSize: 20, 
                              fontWeight: FontWeight.bold
                            ),
                          ),
                          Text(
                            'CK: ${_doctorProfile!['specialty'] ?? 'Đa khoa'}',
                            style: const TextStyle(color: Colors.white60, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (context) => const MainScreen()),
                        );
                      },
                      tooltip: 'Chuyển chế độ Bệnh nhân',
                      icon: const Icon(Icons.swap_horiz_rounded, color: Colors.white),
                    ),
                    IconButton(
                      onPressed: _handleSignOut,
                      icon: const Icon(Icons.logout_rounded, color: Colors.white),
                    )
                  ],
                ),
                const SizedBox(height: 20),
                // Thống kê mini
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _statItem('Chờ khám', pending, Colors.orange),
                    _statItem('Đã duyệt', confirmed, Colors.blue),
                    _statItem('Xong', completed, Colors.greenAccent),
                  ],
                ),
              ],
            ),
          ),

          // 📅 BỘ CHỌN NGÀY NGANG
          Padding(
            padding: const EdgeInsets.only(top: 20, bottom: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: List.generate(7, (index) {
                  final day = DateTime.now().add(Duration(days: index - 2));
                  final bool isSelected = DateFormat('yyyy-MM-dd').format(day) ==
                      DateFormat('yyyy-MM-dd').format(_selectedDate);
                  
                  return Padding(
                    padding: EdgeInsets.only(
                      left: index == 0 ? 24 : 8,
                      right: index == 6 ? 24 : 8,
                    ),
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedDate = day);
                        _loadAppointments();
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: isSelected ? themeColor : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            if (!isSelected)
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 5,
                                offset: const Offset(0, 2),
                              ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Text(
                              DateFormat('EEE', 'vi').format(day).toUpperCase(),
                              style: TextStyle(
                                fontSize: 11, 
                                fontWeight: FontWeight.w600,
                                color: isSelected ? Colors.white70 : Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              DateFormat('dd/MM').format(day),
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: isSelected ? Colors.white : Colors.black87,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Danh sách bệnh nhân',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
                if (_isLoadingAppointments)
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
              ],
            ),
          ),

          // 🏥 DANH SÁCH LỊCH HẸN
          Expanded(
            child: _appointments.isEmpty
                ? _buildEmptyState()
                : RefreshIndicator(
                    onRefresh: _loadAppointments,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
                      itemCount: _appointments.length,
                      itemBuilder: (context, index) {
                        final appt = _appointments[index];
                        return _buildAppointmentCard(appt);
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _statItem(String title, int count, Color color) {
    return Container(
      width: 100,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Text(
            count.toString(),
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(fontSize: 12, color: Colors.white70),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.calendar_today_outlined, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text(
            'Không có lịch khám nào',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey.shade600),
          ),
          const SizedBox(height: 4),
          Text(
            'Bạn rảnh rỗi trong ngày hôm nay!',
            style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }

  Widget _buildAppointmentCard(Map<String, dynamic> appt) {
    final patient = appt['user'];
    final String patientName = patient != null ? patient['full_name'] : 'Khách hàng';
    final String symptoms = appt['symptoms'] ?? 'Không rõ lý do';
    final String time = appt['appointment_time'] ?? '00:00';
    final String status = appt['status'] ?? 'pending';

    Color statusColor = Colors.grey;
    String statusLabel = 'Chờ duyệt';
    IconData statusIcon = Icons.access_time;

    if (status == 'confirmed') {
      statusColor = Colors.blue;
      statusLabel = 'Đã xác nhận';
      statusIcon = Icons.check_circle_outline;
    } else if (status == 'completed') {
      statusColor = Colors.green;
      statusLabel = 'Hoàn thành';
      statusIcon = Icons.done_all;
    } else if (status == 'cancelled') {
      statusColor = Colors.red;
      statusLabel = 'Đã hủy';
      statusIcon = Icons.cancel_outlined;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: IntrinsicHeight(
          child: Row(
            children: [
              // Rìa màu theo trạng thái
              Container(
                width: 6,
                color: statusColor,
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.teal.shade50,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.watch_later_outlined, size: 14, color: Colors.teal.shade700),
                                const SizedBox(width: 4),
                                Text(
                                  time,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold, 
                                    color: Colors.teal.shade700,
                                    fontSize: 13
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: statusColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Icon(statusIcon, size: 14, color: statusColor),
                                const SizedBox(width: 4),
                                Text(
                                  statusLabel,
                                  style: TextStyle(fontWeight: FontWeight.bold, color: statusColor, fontSize: 12),
                                ),
                              ],
                            ),
                          )
                        ],
                      ),
                      const SizedBox(height: 14),
                      Text(
                        patientName,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Lý do: $symptoms',
                        style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 16),
                      const Divider(height: 1),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (status != 'cancelled' && status != 'completed')
                            TextButton.icon(
                              onPressed: () => _showActionDialog(appt),
                              icon: const Icon(Icons.settings),
                              label: const Text('XỬ LÝ LỊCH'),
                              style: TextButton.styleFrom(
                                foregroundColor: Colors.teal.shade700,
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                              ),
                            )
                          else
                            Text(
                              'Đã đóng hồ sơ',
                              style: TextStyle(fontSize: 12, color: Colors.grey.shade400, fontStyle: FontStyle.italic),
                            )
                        ],
                      )
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
