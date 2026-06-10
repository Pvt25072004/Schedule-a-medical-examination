import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../service/auth_service.dart';
import '../service/appointment_service.dart';
import '../service/review_service.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> with TickerProviderStateMixin {
  bool _isLoading = true;
  List<dynamic> _allAppointments = [];
  List<dynamic> _filteredAppointments = [];
  
  final AuthService _authService = AuthService();
  final AppointmentService _appointmentService = AppointmentService();
  final ReviewService _reviewService = ReviewService();
  
  late TabController _tabController;
  DateTime? _selectedDateFilter;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
    _tabController.addListener(_handleTabChange);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.removeListener(_handleTabChange);
    _tabController.dispose();
    super.dispose();
  }

  void _handleTabChange() {
    if (_tabController.indexIsChanging) return;
    _applyFilters();
  }

  void _applyFilters() {
    final List<String> filterMapping = ['Tất cả', 'pending', 'confirmed', 'completed', 'cancelled'];
    final String currentFilter = filterMapping[_tabController.index];
    
    setState(() {
      _filteredAppointments = _allAppointments.where((a) {
        // Tab filter
        final s = a['status']?.toString().toLowerCase() ?? '';
        bool statusMatch = false;
        if (currentFilter == 'Tất cả') {
          statusMatch = true;
        } else if (currentFilter == 'cancelled') {
           statusMatch = (s == 'cancelled' || s == 'rejected');
        } else {
           statusMatch = (s == currentFilter);
        }

        // Date filter
        bool dateMatch = true;
        if (_selectedDateFilter != null) {
          try {
            final apptDate = DateTime.parse(a['appointment_date'].toString());
            dateMatch = apptDate.year == _selectedDateFilter!.year && 
                        apptDate.month == _selectedDateFilter!.month && 
                        apptDate.day == _selectedDateFilter!.day;
          } catch (e) {
            dateMatch = false;
          }
        }

        return statusMatch && dateMatch;
      }).toList();
    });
  }

  Future<void> _pickDateFilter() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDateFilter ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF48A1F3),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() => _selectedDateFilter = picked);
      _applyFilters();
    }
  }

  void _clearDateFilter() {
    setState(() => _selectedDateFilter = null);
    _applyFilters();
  }

  Future<void> _loadData() async {
    final user = AuthService.currentUser;
    if (user == null) {
      setState(() => _isLoading = false);
      return;
    }

    setState(() => _isLoading = true);
    try {
      final userId = int.tryParse(user.uid);
      if (userId != null) {
        final list = await _appointmentService.fetchUserAppointments(userId);
        if (mounted) {
          setState(() {
            _allAppointments = list;
            _isLoading = false;
          });
          _handleTabChange();
        }
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint('🔥 AppointmentsScreen Load Error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return const Color(0xFFFFA726); // Cam ấm
      case 'confirmed':
        return const Color(0xFF48A1F3); // Xanh lam
      case 'completed':
        return const Color(0xFF42A5F5); // Xanh biển
      case 'cancelled':
      case 'rejected':
        return const Color(0xFFEF5350); // Đỏ pastel
      default:
        return Colors.grey;
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chưa thanh toán';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
      case 'rejected':
        return 'Đã hủy';
      default:
        return 'Không rõ';
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Icons.hourglass_top_rounded;
      case 'confirmed':
        return Icons.verified_rounded;
      case 'completed':
        return Icons.task_alt_rounded;
      case 'cancelled':
      case 'rejected':
        return Icons.cancel_rounded;
      default:
        return Icons.help_outline;
    }
  }

  String _formatDate(String rawDate) {
    try {
      final date = DateTime.parse(rawDate);
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      return rawDate;
    }
  }

  String _formatTime(String rawTime) {
    if (rawTime.length > 5) {
      return rawTime.substring(0, 5); // Lấy HH:mm bỏ giây
    }
    return rawTime;
  }

  @override
  Widget build(BuildContext context) {
    const Color primaryThemeColor = Color(0xFF48A1F3); // Xanh lam chủ đạo
    return Scaffold(
      backgroundColor: const Color(0xFFF6F9F8),
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: primaryThemeColor,
        child: Column(
          children: [
            // --- STUNNING HEADER ---
            Container(
              padding: const EdgeInsets.only(top: 50, bottom: 8),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [primaryThemeColor, primaryThemeColor.withOpacity(0.85)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
                boxShadow: [
                  BoxShadow(
                    color: primaryThemeColor.withOpacity(0.25),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  )
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      'Lịch Hẹn Của Bạn',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Theo dõi và quản lý các lần thăm khám y tế',
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                        Row(
                          children: [
                            if (_selectedDateFilter != null)
                              IconButton(
                                icon: const Icon(Icons.clear, color: Colors.white70, size: 20),
                                onPressed: _clearDateFilter,
                                constraints: const BoxConstraints(),
                                padding: const EdgeInsets.only(right: 8),
                              ),
                            InkWell(
                              onTap: _pickDateFilter,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.calendar_month, color: Colors.white, size: 16),
                                    const SizedBox(width: 4),
                                    Text(
                                      _selectedDateFilter != null 
                                          ? DateFormat('dd/MM/yyyy').format(_selectedDateFilter!) 
                                          : 'Lọc ngày',
                                      style: const TextStyle(color: Colors.white, fontSize: 12),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Custom Glass TabBar
                  TabBar(
                    controller: _tabController,
                    isScrollable: true,
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white60,
                    indicatorSize: TabBarIndicatorSize.label,
                    indicator: BoxDecoration(
                      borderRadius: BorderRadius.circular(25),
                      color: Colors.white.withOpacity(0.25),
                    ),
                    dividerColor: Colors.transparent,
                    tabs: const [
                      Tab(child: Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('Tất cả', style: TextStyle(fontWeight: FontWeight.bold)))),
                      Tab(child: Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('Chưa thanh toán', style: TextStyle(fontWeight: FontWeight.bold)))),
                      Tab(child: Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('Đã xác nhận', style: TextStyle(fontWeight: FontWeight.bold)))),
                      Tab(child: Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('Đã hoàn thành', style: TextStyle(fontWeight: FontWeight.bold)))),
                      Tab(child: Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('Đã hủy', style: TextStyle(fontWeight: FontWeight.bold)))),
                    ],
                  ),
                ],
              ),
            ),

            // --- BODY ---
            Expanded(
              child: _isLoading
                  ? Center(
                      child: CircularProgressIndicator(color: primaryThemeColor),
                    )
                  : _filteredAppointments.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 20, 16, 80),
                          physics: const AlwaysScrollableScrollPhysics(),
                          itemCount: _filteredAppointments.length,
                          itemBuilder: (context, index) {
                            final appt = _filteredAppointments[index];
                            return _buildAppointmentCard(appt, context);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  )
                ],
              ),
              child: const Icon(Icons.calendar_today_outlined, size: 64, color: Colors.grey),
            ),
            const SizedBox(height: 20),
            const Text(
              'Không tìm thấy lịch hẹn',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
            ),
            const SizedBox(height: 6),
            const Text(
              'Các cuộc hẹn tương ứng sẽ xuất hiện tại đây.',
              style: TextStyle(fontSize: 13, color: Colors.black45),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppointmentCard(dynamic appt, BuildContext context) {
    final String status = (appt['status'] ?? 'pending').toString();
    final Color statusColor = _getStatusColor(status);
    
    final String rawDate = appt['appointment_date']?.toString() ?? '';
    final String dateStr = _formatDate(rawDate);
    final String timeStr = _formatTime(appt['appointment_time']?.toString() ?? '00:00');
    
    final doctor = appt['doctor'];
    final String docName = (doctor != null ? (doctor['user']?['full_name'] ?? doctor['name'] ?? 'Bác sĩ hệ thống') : 'Bác sĩ hệ thống').toString();
    final String specialty = (doctor != null ? (doctor['category']?['name'] ?? doctor['specialty'] ?? 'Đa khoa') : 'Đa khoa').toString();
    
    final hospital = appt['hospital'];
    final String hospName = (hospital != null ? (hospital['name'] ?? 'Bệnh viện đối tác') : 'Bệnh viện đối tác').toString();

    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 8),
          )
        ],
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Column(
          children: [
            Container(
              color: statusColor.withOpacity(0.06),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.access_time_rounded, size: 16, color: Colors.grey.shade700),
                      const SizedBox(width: 6),
                      Text(
                        '$timeStr - $dateStr',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          color: Colors.grey.shade800,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: statusColor,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: statusColor.withOpacity(0.3),
                          blurRadius: 6,
                          offset: const Offset(0, 3),
                        )
                      ]
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_getStatusIcon(status), size: 12, color: Colors.white),
                        const SizedBox(width: 4),
                        Text(
                          _getStatusLabel(status),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(18.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: statusColor.withOpacity(0.1),
                        child: Text(
                          docName.isNotEmpty ? docName.substring(0, 1) : 'D',
                          style: TextStyle(
                            color: statusColor, 
                            fontWeight: FontWeight.bold, 
                            fontSize: 22
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              docName,
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 17,
                                color: Colors.black87,
                                letterSpacing: -0.3,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Chuyên khoa: $specialty',
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    child: Divider(height: 1, thickness: 0.8, color: Color(0xFFEEEEEE)),
                  ),

                  _buildInfoRow(Icons.business_rounded, 'Nơi khám', hospName, Colors.indigo.shade600),
                  const SizedBox(height: 10),
                  _buildInfoRow(
                    Icons.sticky_note_2_outlined, 
                    'Lý do khám', 
                    appt['symptoms']?.toString() ?? 'Không rõ lý do', 
                    Colors.orange.shade700
                  ),
                  
                  if (status.toLowerCase() == 'pending' || status.toLowerCase() == 'confirmed') ...[
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              showAppSnackBar(context, 'Tính năng dời lịch đang được phát triển, vui lòng hủy và đặt lại!');
                            },
                            icon: const Icon(Icons.edit_calendar, size: 18),
                            label: const Text('Dời lịch'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.blue.shade700,
                              side: BorderSide(color: Colors.blue.shade700),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              _showCancelDialog(appt);
                            },
                            icon: const Icon(Icons.cancel_outlined, size: 18),
                            label: const Text('Hủy lịch'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red.shade600,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                  
                  if (status.toLowerCase() == 'cancelled' && (appt['admin_cancelled_free_reschedule'] == true) && (appt['refund_status'] == 'none')) ...[
                    const SizedBox(height: 18),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(12)),
                      child: const Text('Bệnh viện đã hủy lịch này. Bạn có thể Dời lịch miễn phí hoặc Yêu cầu hoàn tiền 100%.', style: TextStyle(color: Colors.red, fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              showAppSnackBar(context, 'Tính năng dời lịch đang được phát triển!');
                            },
                            icon: const Icon(Icons.edit_calendar, size: 18),
                            label: const Text('Dời lịch'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.blue.shade700,
                              side: BorderSide(color: Colors.blue.shade700),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              _showRefundDialog(appt);
                            },
                            icon: const Icon(Icons.account_balance_wallet_outlined, size: 18),
                            label: const Text('Hoàn tiền'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.orange.shade600,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              showAppSnackBar(context, 'Tính năng dời lịch đang được phát triển, vui lòng hủy và đặt lại!');
                            },
                            icon: const Icon(Icons.edit_calendar, size: 18),
                            label: const Text('Dời lịch'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.blue.shade700,
                              side: BorderSide(color: Colors.blue.shade700),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              _showCancelDialog(appt);
                            },
                            icon: const Icon(Icons.cancel_outlined, size: 18),
                            label: const Text('Hủy lịch'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red.shade600,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                  
                  if (status.toLowerCase() == 'completed') ...[
                    const SizedBox(height: 18),
                    Builder(
                      builder: (context) {
                        final existingReview = appt['review'];
                        final bool hasReviewed = existingReview != null;
                        
                        return SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              _showReviewDialog(appt);
                            },
                            icon: Icon(
                              hasReviewed ? Icons.edit_note_rounded : Icons.star_rounded, 
                              size: 20, 
                              color: Colors.white
                            ),
                            label: Text(
                              hasReviewed ? 'SỬA ĐÁNH GIÁ ✏️' : 'ĐÁNH GIÁ NGAY ⭐',
                              style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.5),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: hasReviewed ? Colors.blue.shade600 : Colors.orange.shade700,
                              foregroundColor: Colors.white,
                              elevation: 4,
                              shadowColor: (hasReviewed ? Colors.blue : Colors.orange).withOpacity(0.4),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value, Color iconColor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 16, color: iconColor),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 11, color: Colors.black45, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 1),
              Text(
                value,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.black87),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showCancelDialog(dynamic appt) {
    final TextEditingController reasonController = TextEditingController();
    final TextEditingController bankNameController = TextEditingController();
    final TextEditingController bankAccountController = TextEditingController();
    final TextEditingController accountNameController = TextEditingController();
    
    final rawDate = appt['appointment_date']?.toString() ?? '';
    final rawTime = appt['appointment_time']?.toString() ?? '';
    double diffHours = 0;
    bool showBankForm = false;
    String refundMessage = 'Bạn sẽ không được hoàn tiền do hủy quá sát giờ.';
    
    if (rawDate.isNotEmpty && rawTime.isNotEmpty) {
      try {
        final appointmentDateTime = DateTime.parse('${rawDate.substring(0, 10)}T$rawTime:00');
        final now = DateTime.now();
        diffHours = appointmentDateTime.difference(now).inMinutes / 60.0;
        
        if (diffHours >= 2) {
          showBankForm = true;
          refundMessage = 'Hủy trước 2 tiếng: Được hoàn 100% phí khám. Vui lòng nhập thông tin ngân hàng.';
        } else if (diffHours >= 1) {
          showBankForm = true;
          refundMessage = 'Hủy trước 1 tiếng: Được hoàn 50% phí khám. Vui lòng nhập thông tin ngân hàng.';
        }
      } catch (e) {
        print('Error parsing date: $e');
      }
    }

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Xác nhận hủy lịch'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Bạn có chắc chắn muốn hủy lịch hẹn này không?'),
                const SizedBox(height: 12),
                Text(refundMessage, style: TextStyle(color: showBankForm ? Colors.green.shade700 : Colors.red, fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 16),
                TextField(
                  controller: reasonController,
                  decoration: InputDecoration(
                    labelText: 'Lý do hủy (tùy chọn)',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  maxLines: 2,
                ),
                if (showBankForm) ...[
                  const SizedBox(height: 16),
                  const Text('Thông tin nhận hoàn tiền:', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: bankNameController,
                    decoration: InputDecoration(labelText: 'Tên Ngân Hàng (VD: Vietcombank)', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: bankAccountController,
                    decoration: InputDecoration(labelText: 'Số Tài Khoản', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: accountNameController,
                    decoration: InputDecoration(labelText: 'Tên Chủ Tài Khoản', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                  ),
                ]
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Không', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () async {
                if (showBankForm && (bankNameController.text.isEmpty || bankAccountController.text.isEmpty || accountNameController.text.isEmpty)) {
                  showAppSnackBar(context, 'Vui lòng nhập đầy đủ thông tin ngân hàng!', color: Colors.red);
                  return;
                }
                Navigator.pop(context);
                setState(() => _isLoading = true);
                final success = await _appointmentService.updateAppointmentStatus(
                  appointmentId: appt['id'], 
                  status: 'cancelled',
                  reason: reasonController.text.isNotEmpty ? reasonController.text : 'Người dùng hủy',
                  bankName: showBankForm ? bankNameController.text : null,
                  bankAccount: showBankForm ? bankAccountController.text : null,
                  accountName: showBankForm ? accountNameController.text : null,
                );
                if (success) {
                  showAppSnackBar(context, 'Hủy lịch thành công!', color: const Color(0xFF48A1F3));
                  _loadData();
                } else {
                  showAppSnackBar(context, 'Hủy lịch thất bại! Vui lòng thử lại.');
                  setState(() => _isLoading = false);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Hủy lịch', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      }
    );
  }

  void _showRefundDialog(dynamic appt) {
    final TextEditingController bankNameController = TextEditingController();
    final TextEditingController bankAccountController = TextEditingController();
    final TextEditingController accountNameController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Yêu cầu hoàn tiền'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Vì phòng khám hủy lịch, bạn được hoàn lại 100% phí khám. Vui lòng cung cấp tài khoản ngân hàng để nhận lại tiền.', style: TextStyle(fontSize: 14)),
                const SizedBox(height: 16),
                TextField(
                  controller: bankNameController,
                  decoration: InputDecoration(labelText: 'Tên Ngân Hàng (VD: Vietcombank)', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: bankAccountController,
                  decoration: InputDecoration(labelText: 'Số Tài Khoản', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: accountNameController,
                  decoration: InputDecoration(labelText: 'Tên Chủ Tài Khoản', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () async {
                if (bankNameController.text.isEmpty || bankAccountController.text.isEmpty || accountNameController.text.isEmpty) {
                  showAppSnackBar(context, 'Vui lòng nhập đầy đủ thông tin ngân hàng!', color: Colors.red);
                  return;
                }
                Navigator.pop(context);
                setState(() => _isLoading = true);
                
                final success = await _appointmentService.requestRefund(
                  appointmentId: appt['id'],
                  bankName: bankNameController.text,
                  bankAccount: bankAccountController.text,
                  accountName: accountNameController.text,
                );
                
                if (success) {
                  showAppSnackBar(context, 'Gửi yêu cầu hoàn tiền thành công!', color: const Color(0xFF48A1F3));
                  _loadData();
                } else {
                  showAppSnackBar(context, 'Có lỗi xảy ra, vui lòng thử lại.');
                  setState(() => _isLoading = false);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange.shade600,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Gửi yêu cầu', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      }
    );
  }

  void _showReviewDialog(dynamic appt) {
    final doctor = appt['doctor'];
    final String docName = (doctor != null ? (doctor['user']?['full_name'] ?? doctor['name'] ?? 'Bác sĩ') : 'Bác sĩ').toString();
    final existingReview = appt['review'];
    final bool isEditing = existingReview != null;
    
    int ratingValue = isEditing ? (existingReview['rating'] ?? 5) : 5;
    final TextEditingController commentController = TextEditingController(
      text: isEditing ? (existingReview['comment'] ?? '') : ''
    );
    
    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Dialog(
              backgroundColor: Colors.transparent,
              elevation: 0,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 30, offset: const Offset(0, 15))
                  ],
                ),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Header Icon
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: isEditing 
                              ? [Colors.blue.shade300, Colors.blue.shade600]
                              : [Colors.orange.shade300, Colors.orange.shade600],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: (isEditing ? Colors.blue : Colors.orange).withOpacity(0.4),
                              blurRadius: 16,
                              offset: const Offset(0, 8),
                            )
                          ],
                        ),
                        child: Icon(isEditing ? Icons.rate_review_rounded : Icons.star_rounded, size: 48, color: Colors.white),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        isEditing ? 'Sửa Đánh Giá' : 'Đánh giá buổi khám',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Bạn cảm thấy thế nào về dịch vụ của bác sĩ $docName?',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.black54, fontSize: 14, height: 1.4),
                      ),
                      const SizedBox(height: 24),
                      
                      // Interactive Stars
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(5, (index) {
                            final int starIndex = index + 1;
                            return GestureDetector(
                              onTap: () {
                                setModalState(() {
                                  ratingValue = starIndex;
                                });
                              },
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  curve: Curves.easeOutBack,
                                  transform: Matrix4.identity()..scale(starIndex <= ratingValue ? 1.15 : 1.0),
                                  child: Icon(
                                    starIndex <= ratingValue ? Icons.star_rounded : Icons.star_outline_rounded,
                                    color: starIndex <= ratingValue ? Colors.amber.shade400 : Colors.grey.shade300,
                                    size: 42,
                                  ),
                                ),
                              ),
                            );
                          }),
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Comment Field
                      TextField(
                        controller: commentController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          hintText: 'Chia sẻ thêm trải nghiệm của bạn (không bắt buộc)...',
                          hintStyle: const TextStyle(fontSize: 14, color: Colors.black38),
                          filled: true,
                          fillColor: Colors.grey.shade50,
                          contentPadding: const EdgeInsets.all(20),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(20),
                            borderSide: BorderSide(color: Colors.grey.shade200),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(20),
                            borderSide: BorderSide(color: Colors.grey.shade200),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(20),
                            borderSide: BorderSide(color: isEditing ? Colors.blue.shade400 : Colors.orange.shade400, width: 2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 28),
                      
                      // Actions
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => Navigator.pop(context),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                side: BorderSide(color: Colors.grey.shade300),
                              ),
                              child: const Text('Hủy bỏ', style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold, fontSize: 15)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () async {
                                final user = AuthService.currentUser;
                                if (user == null) return;
                                
                                final userId = int.tryParse(user.uid);
                                final doctorId = appt['doctor_id'] != null ? int.tryParse(appt['doctor_id'].toString()) : null;
                                final appointmentId = appt['id'] != null ? int.tryParse(appt['id'].toString()) : null;
                                
                                if (userId == null || doctorId == null || appointmentId == null) {
                                  showAppSnackBar(context, '🔥 Không xác định được thông tin lịch hẹn!', color: Colors.red);
                                  return;
                                }
                                
                                bool success;
                                if (isEditing) {
                                  success = await _reviewService.updateReview(
                                    reviewId: existingReview['id'],
                                    rating: ratingValue,
                                    comment: commentController.text.trim(),
                                  );
                                } else {
                                  success = await _reviewService.createReview(
                                    userId: userId,
                                    doctorId: doctorId,
                                    appointmentId: appointmentId,
                                    rating: ratingValue,
                                    comment: commentController.text.trim(),
                                  );
                                }
                                
                                if (success) {
                                  showAppSnackBar(context, '🎉 ${isEditing ? 'Cập nhật' : 'Gửi'} đánh giá thành công!', color: const Color(0xFF48A1F3));
                                  Navigator.pop(context); // Close dialog
                                  _loadData(); // Reload appointments to reflect new review status
                                } else {
                                  showAppSnackBar(context, '❌ Không thể lưu đánh giá.', color: Colors.red);
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isEditing ? Colors.blue.shade600 : Colors.orange.shade600,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              elevation: 0,
                            ),
                            child: const Text('Gửi đánh giá', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ), // Column
              ), // SingleChildScrollView
            ), // Container
          ); // Dialog
        }, // StatefulBuilder builder
      ); // StatefulBuilder
    }, // showDialog builder
  ); // showDialog
}
}
