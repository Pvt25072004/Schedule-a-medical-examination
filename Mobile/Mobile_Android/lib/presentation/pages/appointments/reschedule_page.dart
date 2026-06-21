import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import 'package:intl/intl.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import 'package:flip_card/flip_card.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../service/schedule_service.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../logics/appointment/providers/appointment_provider.dart';
import 'package:provider/provider.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../core/utils/snackbar_helper.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class ReschedulePage extends StatefulWidget {
  final dynamic appointment;

  const ReschedulePage({super.key, required this.appointment});

  @override
  State<ReschedulePage> createState() => _ReschedulePageState();
}

class _ReschedulePageState extends State<ReschedulePage> {
  DateTime? selectedDate;
  String selectedTimeSlot = '';



  late DateTime _displayedMonth;
  final ScheduleService _scheduleService = ScheduleService();
  
  List<dynamic> _doctorSchedules = [];
  Set<String> _availableDates = {};
  bool _isLoadingSchedules = false;
  bool _isLoadingTimes = false;
  bool _isRescheduling = false;

  List<String> timeSlots = [];
  final GlobalKey<FlipCardState> _flipCardKey = GlobalKey<FlipCardState>();
  final double cardHeight = 400;

  @override
  void initState() {
    super.initState();
    _displayedMonth = DateTime.now();
    _loadSchedules();
  }

  int get _doctorId {
    final doctor = widget.appointment['doctor'];
    if (doctor != null) {
      return doctor['id'] as int;
    }
    return 0;
  }

  Future<void> _loadSchedules() async {
    if (_doctorId == 0) return;
    
    setState(() => _isLoadingSchedules = true);
    
    final schedules = await _scheduleService.fetchDoctorSchedules(_doctorId);

    final Set<String> dates = {};
    for (var s in schedules) {
      if (s['is_available'] == true && s['work_date'] != null) {
        dates.add(s['work_date'].toString().substring(0, 10)); // Extract YYYY-MM-DD
      }
    }

    if (mounted) {
      setState(() {
        _doctorSchedules = schedules;
        _availableDates = dates;
        _isLoadingSchedules = false;
      });
    }
  }

  Future<void> _loadAvailableTimes(DateTime date) async {
    if (_doctorId == 0) return;
    
    setState(() => _isLoadingTimes = true);
    final dateStr = DateFormat('yyyy-MM-dd').format(date);
    final times = await _scheduleService.fetchAvailableTimes(_doctorId, dateStr);
    
    if (mounted) {
      setState(() {
        timeSlots = times;
        _isLoadingTimes = false;
      });
    }
  }

  Future<void> _selectDate(DateTime date) async {
    setState(() {
      selectedDate = date;
      selectedTimeSlot = '';
    });
    
    await _loadAvailableTimes(date);

    if (_flipCardKey.currentState != null) {
      Future.delayed(const Duration(milliseconds: 300), () {
        _flipCardKey.currentState?.toggleCard();
      });
    }
  }

  void _handleFlip() {
    if (selectedDate == null) {
      showAppSnackBar(context, 'Vui lòng chọn ngày trước', color: Colors.orange);
    } else {
      _flipCardKey.currentState?.toggleCard();
    }
  }

  Widget _buildFlashcard() {
    return GestureDetector(
      onTap: _handleFlip,
      child: FlipCard(
        key: _flipCardKey,
        direction: FlipDirection.HORIZONTAL,
        front: _buildDateSelectionCard(),
        back: _buildTimeSelectionCard(),
      ),
    );
  }

  Widget _buildDateSelectionCard() {
    final firstDayOfMonth = DateTime(_displayedMonth.year, _displayedMonth.month, 1);
    final startGridDay = firstDayOfMonth.subtract(Duration(days: firstDayOfMonth.weekday % 7));
    final List<DateTime> days = List.generate(42, (i) => startGridDay.add(Duration(days: i)));
    const weekdays = ['CN','T2','T3','T4','T5','T6','T7'];

    return SizedBox(
      height: cardHeight,
      child: Card(
        elevation: 8,
        shadowColor: AppColors.primary.withOpacity(0.2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(icon: const Icon(Icons.arrow_back_ios, size: 18), onPressed: () {
                    setState(() {
                      _displayedMonth = DateTime(_displayedMonth.year, _displayedMonth.month - 1, 1);
                    });
                  }),
                  Text(DateFormat('MMMM yyyy','vi').format(_displayedMonth).toUpperCase(),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  IconButton(icon: const Icon(Icons.arrow_forward_ios, size: 18), onPressed: () {
                    setState(() {
                      _displayedMonth = DateTime(_displayedMonth.year, _displayedMonth.month + 1, 1);
                    });
                  }),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: weekdays.map((d) => Expanded(
                  child: Center(child: Text(d, style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey.shade600))),
                )).toList(),
              ),
              const SizedBox(height: 10),
              Expanded(
                child: _isLoadingSchedules
                ? const Center(child: CircularProgressIndicator())
                : GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 7, childAspectRatio: 1.0, mainAxisSpacing: 6, crossAxisSpacing: 6),
                  itemCount: days.length,
                  itemBuilder: (context, index) {
                    final date = days[index];
                    final isInMonth = date.month == _displayedMonth.month;
                    final isToday = date.year == DateTime.now().year && date.month == DateTime.now().month && date.day == DateTime.now().day;
                    final isSelected = selectedDate != null && date.year == selectedDate!.year && date.month == selectedDate!.month && date.day == selectedDate!.day;
                    final isPast = date.isBefore(DateTime.now().subtract(const Duration(hours: 24)));
                    
                    bool isDisabled = !isInMonth || isPast;
                    if (_doctorId != 0) {
                      final dateStr = DateFormat('yyyy-MM-dd').format(date);
                      if (!_availableDates.contains(dateStr)) {
                        isDisabled = true;
                      }
                    }

                    return GestureDetector(
                      onTap: isDisabled ? null : () => _selectDate(date),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSelected ? AppColors.primary : (isToday && !isDisabled ? AppColors.primary.withOpacity(0.1) : Colors.transparent),
                          border: isSelected ? Border.all(color: AppColors.primaryDark, width: 2) : (isToday ? Border.all(color: AppColors.primary) : null),
                        ),
                        child: Center(
                          child: Text('${date.day}', style: TextStyle(
                            color: isSelected ? Colors.white : (isDisabled ? Colors.grey.shade300 : Colors.black87),
                            fontWeight: isSelected || isToday ? FontWeight.bold : FontWeight.w500,
                          )),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimeSelectionCard() {
    return SizedBox(
      height: cardHeight,
      child: Card(
        elevation: 8,
        shadowColor: AppColors.primary.withOpacity(0.2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: selectedDate == null
              ? const Center(child: Text('Vui lòng chọn ngày trước', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)))
              : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.access_time_rounded, color: AppColors.primary),
                  const SizedBox(width: 8),
                  const Text('Chọn giờ khám', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: _isLoadingTimes
                ? const Center(child: CircularProgressIndicator())
                : timeSlots.isEmpty
                ? const Center(child: Text('Không có ca khám khả dụng.', style: TextStyle(color: Colors.red)))
                : GridView.builder(
                  shrinkWrap: true,
                  physics: const AlwaysScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3, childAspectRatio: 2.2, mainAxisSpacing: 10, crossAxisSpacing: 10),
                  itemCount: timeSlots.length,
                  itemBuilder: (context, index) {
                    final slot = timeSlots[index];
                    final isSelected = selectedTimeSlot == slot;
                    return GestureDetector(
                      onTap: () => setState(() => selectedTimeSlot = slot),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary : Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isSelected ? AppColors.primaryDark : Colors.grey.shade300),
                          boxShadow: isSelected ? [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 4))] : [],
                        ),
                        child: Center(
                          child: Text(slot, style: TextStyle(
                              color: isSelected ? Colors.white : Colors.black87,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                          )),
                        ),
                      ),
                    );
                  },
                ),
              ),
              if (timeSlots.isNotEmpty)
                Center(
                  child: TextButton.icon(
                    onPressed: () => _flipCardKey.currentState?.toggleCard(),
                    icon: const Icon(Icons.calendar_month, size: 16),
                    label: const Text('Đổi ngày khác'),
                  ),
                )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildConfirmationBar() {
    if (selectedDate != null && selectedTimeSlot.isNotEmpty) {
      final formattedDate = DateFormat('EEEE, dd/MM/yyyy','vi').format(selectedDate!);
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        margin: const EdgeInsets.only(top: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.primary.withOpacity(0.3)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))
          ]
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), shape: BoxShape.circle),
              child: Icon(Icons.check_circle_outline, color: AppColors.primary, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Lịch hẹn mới của bạn', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('$formattedDate - $selectedTimeSlot', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.black87)),
                ],
              ),
            ),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Future<void> _submitReschedule() async {
    if (selectedDate == null || selectedTimeSlot.isEmpty) return;
    
    // Find schedule_id
    final dateStr = DateFormat('yyyy-MM-dd').format(selectedDate!);
    int? scheduleId;
    for (var s in _doctorSchedules) {
      if (s['work_date'] != null && s['work_date'].toString().startsWith(dateStr) && s['time_slot'] == selectedTimeSlot) {
        scheduleId = s['id'];
        break;
      }
    }
    
    // If exact time slot not found in schedule list directly (could be multi-slot schedule), we just take the first schedule of that day as fallback. 
    // Wait, schedule might not have exact time_slot if it's a range.
    if (scheduleId == null) {
       for (var s in _doctorSchedules) {
         if (s['work_date'] != null && s['work_date'].toString().startsWith(dateStr)) {
           scheduleId = s['id'];
           break;
         }
       }
    }
    
    if (scheduleId == null) {
      showAppSnackBar(context, 'Lỗi: Không tìm thấy ca trực tương ứng.', color: Colors.red);
      return;
    }

    setState(() => _isRescheduling = true);
    
    final apptId = widget.appointment['id'] as int;
    final doctorId = _doctorId;
    final hospitalId = widget.appointment['hospital'] != null ? widget.appointment['hospital']['id'] as int : 0;
    
    final appointmentProvider = context.read<AppointmentProvider>();
    final success = await appointmentProvider.executeRescheduleappointment(
      appointmentId: apptId,
      scheduleId: scheduleId,
      doctorId: doctorId,
      hospitalId: hospitalId,
      appointmentDate: dateStr,
      appointmentTime: selectedTimeSlot,
    );
    
    setState(() => _isRescheduling = false);
    
    if (success) {
      if (mounted) {
        showAppSnackBar(context, 'Dời lịch thành công!', color: Colors.green);
        Navigator.pop(context, true); // Return true to refresh list
      }
    } else {
      if (mounted) {
        showAppSnackBar(context, 'Dời lịch thất bại. Vui lòng thử lại.', color: Colors.red);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isReady = selectedDate != null && selectedTimeSlot.isNotEmpty;
    final doctor = widget.appointment['doctor'];
    final docName = (doctor != null ? (doctor['user']?['full_name'] ?? doctor['name'] ?? 'Bác sĩ') : 'Bác sĩ').toString();

    return Scaffold(
      backgroundColor: const Color(0xFFF6F9F8),
      appBar: AppBar(
        title: const Text('Dời lịch hẹn', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 20)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
        centerTitle: true,
      ),
      body: _doctorId == 0 
      ? const Center(child: Text('Lịch hẹn gốc không hợp lệ (Thiếu thông tin bác sĩ)'))
      : Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            color: Colors.white,
            width: double.infinity,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: AppColors.primary.withOpacity(0.1),
                      child: Icon(Icons.edit_calendar_rounded, color: AppColors.primary),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Bác sĩ $docName', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          const Text('Vui lòng chọn ngày và giờ khám mới.', style: TextStyle(color: Colors.grey, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildFlashcard(),
                  _buildConfirmationBar(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
          
          // Bottom button
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))]
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: isReady && !_isRescheduling ? _submitReschedule : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey.shade300,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: _isRescheduling 
                    ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Xác nhận dời lịch', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}





