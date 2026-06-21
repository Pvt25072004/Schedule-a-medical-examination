import 'package:clinic_booking_system/core/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../logics/auth/providers/auth_provider.dart';
import '../../../logics/appointment/providers/appointment_provider.dart';
import 'package:provider/provider.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';
import '../../../service/review_service.dart';
import 'reschedule_page.dart';
import '../../organisms/appointments/appointment_card.dart';
import '../../organisms/appointments/appointment_empty_state.dart';

class AppointmentsPage extends StatefulWidget {
  const AppointmentsPage({super.key});

  @override
  State<AppointmentsPage> createState() => _AppointmentsPageState();
}

class _AppointmentsPageState extends State<AppointmentsPage> with TickerProviderStateMixin {
  bool _isLoading = true;
  List<dynamic> _allAppointments = [];
  List<dynamic> _filteredAppointments = [];
  
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
              primary: AppColors.primary,
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
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;
    if (user == null) {
      setState(() => _isLoading = false);
      return;
    }

    setState(() => _isLoading = true);
    try {
      final userId = int.tryParse(user.id);
      if (userId != null) {
        final appointmentProvider = context.read<AppointmentProvider>();
        await appointmentProvider.fetchUserAppointments(userId);
        
        if (mounted) {
          setState(() {
            _allAppointments = appointmentProvider.userAppointments;
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
        return AppColors.primary; // Xanh lam
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

    return Scaffold(
      backgroundColor: const Color(0xFFF6F9F8),
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: AppColors.primary,
        child: Column(
          children: [
            // --- STUNNING HEADER ---
            Container(
              padding: const EdgeInsets.only(top: 50, bottom: 8),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary, AppColors.primary.withOpacity(0.85)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.25),
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
                      child: CircularProgressIndicator(color: AppColors.primary),
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
    return const AppointmentEmptyState();
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

    return AppointmentCard(
      appt: appt,
      statusColor: statusColor,
      statusLabel: _getStatusLabel(status),
      statusIcon: _getStatusIcon(status),
      dateStr: dateStr,
      timeStr: timeStr,
      docName: docName,
      specialty: specialty,
      hospName: hospName,
      status: status,
      onReschedule: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ReschedulePage(appointment: appt)),
        ).then((value) {
          if (value == true) {
            _loadData();
          }
        });
      },
      onCancel: () {
        _showCancelDialog(appt);
      },
      onRefund: () {
        _showRefundDialog(appt);
      },
      onReview: () {
        _showReviewDialog(appt);
      },
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
    int refundPercentage = 0;
    
    if (rawDate.isNotEmpty && rawTime.isNotEmpty) {
      try {
        final timeStr = rawTime.length >= 5 ? rawTime.substring(0, 5) : rawTime;
        final appointmentDateTime = DateTime.parse('${rawDate.substring(0, 10)}T$timeStr:00');
        final now = DateTime.now();
        diffHours = appointmentDateTime.difference(now).inMinutes / 60.0;
        
        if (appt['status'] == 'confirmed') {
          if (diffHours >= 2) {
            showBankForm = true;
            refundPercentage = 100;
          } else if (diffHours >= 1) {
            showBankForm = true;
            refundPercentage = 50;
          }
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
                if (appt['status'] == 'confirmed') ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      border: Border.all(color: Colors.orange.shade200),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Thông báo hoàn tiền:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.deepOrange)),
                        const SizedBox(height: 8),
                        const Text('• Hủy trước 2 tiếng: Hoàn 100%', style: TextStyle(fontSize: 13, color: Colors.deepOrange)),
                        const Text('• Hủy trước 1 tiếng: Hoàn 50%', style: TextStyle(fontSize: 13, color: Colors.deepOrange)),
                        const Text('• Hủy dưới 1 tiếng: Không hoàn tiền', style: TextStyle(fontSize: 13, color: Colors.deepOrange)),
                        const SizedBox(height: 8),
                        Text('Lịch của bạn sẽ được hoàn: $refundPercentage%', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.deepOrange, fontSize: 14)),
                      ],
                    ),
                  ),
                ],
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
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      border: Border.all(color: Colors.blue.shade100),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Vui lòng cung cấp thông tin tài khoản nhận hoàn tiền:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blueAccent, fontSize: 13)),
                        const SizedBox(height: 12),
                        TextField(
                          controller: bankNameController,
                          decoration: InputDecoration(
                            labelText: 'Tên Ngân Hàng (VD: Vietcombank)', 
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: bankAccountController,
                          decoration: InputDecoration(
                            labelText: 'Số Tài Khoản', 
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)
                          ),
                          keyboardType: TextInputType.number,
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: accountNameController,
                          decoration: InputDecoration(
                            labelText: 'Tên Chủ Tài Khoản', 
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)
                          ),
                          textCapitalization: TextCapitalization.characters,
                        ),
                      ],
                    ),
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
                final appointmentProvider = context.read<AppointmentProvider>();
                final success = await appointmentProvider.executeUpdateappointmentstatus(
                  appointmentId: appt['id'], 
                  status: 'cancelled',
                  reason: reasonController.text.isNotEmpty ? reasonController.text : 'Người dùng hủy',
                  bankName: showBankForm ? bankNameController.text : null,
                  bankAccount: showBankForm ? bankAccountController.text : null,
                  accountName: showBankForm ? accountNameController.text : null,
                );
                if (success) {
                  showAppSnackBar(context, 'Hủy lịch thành công!', color: AppColors.primary);
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
                
                final appointmentProvider = context.read<AppointmentProvider>();
                final success = await appointmentProvider.executeRequestrefund(
                  appointmentId: appt['id'],
                  bankName: bankNameController.text,
                  bankAccount: bankAccountController.text,
                  accountName: accountNameController.text,
                );
                
                if (success) {
                  showAppSnackBar(context, 'Gửi yêu cầu hoàn tiền thành công!', color: AppColors.primary);
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
                                final authProvider = context.read<AuthProvider>();
                                final user = authProvider.currentUser;
                                if (user == null) return;
                                
                                final userId = int.tryParse(user.id);
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
                                  showAppSnackBar(context, '🎉 ${isEditing ? 'Cập nhật' : 'Gửi'} đánh giá thành công!', color: AppColors.primary);
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



