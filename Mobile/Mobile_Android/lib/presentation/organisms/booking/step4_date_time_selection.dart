// step4_date_time_selection.dart - Flashcard ngày->giờ, toggle đổ nước
import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import 'package:intl/intl.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import 'package:flip_card/flip_card.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../service/schedule_service.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../service/appointment_service.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class Step4DateTimeSelection extends StatefulWidget {
  final int? doctorId;
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;
  const Step4DateTimeSelection({
    super.key,
    this.doctorId,
    required this.onNext,
    required this.onBack,
  });

  @override
  State<Step4DateTimeSelection> createState() => _Step4DateTimeSelectionState();
}

class _Step4DateTimeSelectionState extends State<Step4DateTimeSelection> {
  DateTime? selectedDate;
  String selectedTimeSlot = '';



  late DateTime _displayedMonth;
  bool flashcardEnabled = true;

  final ScheduleService _scheduleService = ScheduleService();
  List<dynamic> _doctorSchedules = [];
  Set<String> _availableDates = {};
  bool _isLoadingSchedules = false;
  bool _isLoadingTimes = false;

  List<String> timeSlots = [];

  final GlobalKey<FlipCardState> _flipCardKey = GlobalKey<FlipCardState>();

  double cardHeight = 400; // Chiều cao cố định cho 2 mặt bằng nhau

  @override
  void initState() {
    super.initState();
    _displayedMonth = DateTime.now();
    if (widget.doctorId != null) {
      _loadSchedules();
    }
  }

  Future<void> _loadSchedules() async {
    setState(() => _isLoadingSchedules = true);
    
    final schedules = await _scheduleService.fetchDoctorSchedules(widget.doctorId!);

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
    if (widget.doctorId == null) return;
    setState(() => _isLoadingTimes = true);
    final dateStr = DateFormat('yyyy-MM-dd').format(date);
    final times = await _scheduleService.fetchAvailableTimes(widget.doctorId!, dateStr);
    
    if (mounted) {
      setState(() {
        timeSlots = times;
        _isLoadingTimes = false;
      });
    }
  }

  bool _isSlotAvailable(String slot) {
    // Backend API already filtered times, so all times in timeSlots are available
    return true;
  }

  Future<void> _selectDate(DateTime date) async {
    setState(() {
      selectedDate = date;
      selectedTimeSlot = '';
    });
    
    // Load available times from backend
    await _loadAvailableTimes(date);

    // Lật flashcard sau khi chọn ngày
    if (_flipCardKey.currentState != null) {
      Future.delayed(const Duration(milliseconds: 500), () {
        _flipCardKey.currentState?.toggleCard();
      });
    }
  }

  void _handleFlip() {
    if (selectedDate == null) {
      // Hiển thị thông báo vui lòng chọn ngày
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn ngày trước')),
      );
    } else {
      _flipCardKey.currentState?.toggleCard();
    }
  }

  Widget _buildFlashcard() {
    return GestureDetector(
      onTap: _handleFlip, // chặn lật khi chưa chọn ngày
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
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(icon: const Icon(Icons.arrow_left), onPressed: () {
                    setState(() {
                      _displayedMonth = DateTime(_displayedMonth.year, _displayedMonth.month-1, 1);
                    });
                  }),
                  Text(DateFormat('MMMM yyyy','vi').format(_displayedMonth),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  IconButton(icon: const Icon(Icons.arrow_right), onPressed: () {
                    setState(() {
                      _displayedMonth = DateTime(_displayedMonth.year, _displayedMonth.month+1, 1);
                    });
                  }),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: weekdays.map((d) => Expanded(
                  child: Center(child: Text(d, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.teal))),
                )).toList(),
              ),
              const Divider(height: 10),
              Expanded(
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 7, childAspectRatio: 1.0, mainAxisSpacing: 4, crossAxisSpacing: 4),
                  itemCount: days.length,
                  itemBuilder: (context,index){
                    final date = days[index];
                    final isInMonth = date.month==_displayedMonth.month;
                    final isToday = date.year==DateTime.now().year && date.month==DateTime.now().month && date.day==DateTime.now().day;
                    final isSelected = selectedDate!=null && date.year==selectedDate!.year && date.month==selectedDate!.month && date.day==selectedDate!.day;
                    final isPast = date.isBefore(DateTime.now().subtract(const Duration(hours:24)));
                    
                    bool isDisabled = !isInMonth || isPast;
                    if (widget.doctorId != null) {
                      final dateStr = DateFormat('yyyy-MM-dd').format(date);
                      if (!_availableDates.contains(dateStr)) {
                        isDisabled = true; // Bác sĩ không có ca trực ngày này
                      }
                    }

                    return GestureDetector(
                      onTap: isDisabled ? null : ()=>_selectDate(date),
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSelected ? AppColors.primary.withOpacity(0.8) :
                          (isToday && !isDisabled ? Colors.blue.shade100 : null),
                          border: isSelected ? Border.all(color: AppColors.primaryDark, width: 2) : null,
                        ),
                        child: Center(
                          child: Opacity(
                            opacity: isDisabled?0.3:1.0,
                            child: Text('${date.day}', style: TextStyle(
                              color: isSelected? AppColors.primaryDark :Colors.black87,
                              fontWeight: isSelected||isToday?FontWeight.bold:FontWeight.normal,
                            )),
                          ),
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
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: selectedDate == null
              ? const Center(child: Text('Vui lòng chọn ngày trước', style: TextStyle(fontSize: 16,fontWeight: FontWeight.bold)))
              : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Chọn giờ khám:', style: const TextStyle(fontSize:16,fontWeight: FontWeight.bold)),
              const SizedBox(height:8),
              Expanded(
                child: _isLoadingTimes
                ? const Center(child: CircularProgressIndicator())
                : timeSlots.isEmpty
                ? const Center(child: Text('Không có ca khám khả dụng ngày này.', style: TextStyle(color: Colors.red)))
                : GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount:3, childAspectRatio:2.8, mainAxisSpacing:8, crossAxisSpacing:8),
                  itemCount: timeSlots.length,
                  itemBuilder: (context,index){
                    final slot=timeSlots[index];
                    final isAvailable = _isSlotAvailable(slot);
                    final isSelected = selectedTimeSlot==slot && isAvailable;
                    return ChoiceChip(
                      label: Text(slot, style: TextStyle(
                          color: isAvailable ? (isSelected? AppColors.primaryDark :Colors.black87) : Colors.black26,
                          fontWeight:FontWeight.w500,
                          decoration: isAvailable ? TextDecoration.none : TextDecoration.lineThrough,
                      )),
                      selected:isSelected,
                      onSelected: isAvailable ? (s)=>setState(()=>selectedTimeSlot=s?slot:'') : null,
                      selectedColor: AppColors.primary,
                      backgroundColor: isAvailable ? Colors.grey.shade100 : Colors.grey.shade200,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: BorderSide(color:isSelected? AppColors.primaryDark :(isAvailable ? Colors.grey.shade300 : Colors.transparent)),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height:10),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildConfirmationBar(){
    if(selectedDate!=null && selectedTimeSlot.isNotEmpty){
      final formattedDate=DateFormat('EEEE, dd/MM/yyyy','vi').format(selectedDate!);
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        margin: const EdgeInsets.only(top: 20),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.3),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.primaryDark.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Lịch khám đã chọn:', style: TextStyle(fontSize:16,fontWeight: FontWeight.bold,color: AppColors.primaryDark)),
            const SizedBox(height:4),
            Text('$formattedDate | Giờ: $selectedTimeSlot',
                style: const TextStyle(fontSize:18,fontWeight:FontWeight.w600,color: AppColors.primaryDark)),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }

  String? _getRoomForSlot(DateTime? date, String timeSlot) {
    if (date == null || timeSlot.isEmpty) return null;
    final dateStr = DateFormat('yyyy-MM-dd').format(date);
    for (var s in _doctorSchedules) {
      if (s['work_date'] != null && s['work_date'].toString().startsWith(dateStr)) {
        if (s['room'] != null) {
          return s['room']['name']?.toString() ?? s['room']['room_name']?.toString();
        }
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final bool isReadyToProceed = selectedDate!=null && selectedTimeSlot.isNotEmpty;

    return Column(
      children:[
        // Header giữ nguyên
        Container(
          padding: const EdgeInsets.symmetric(horizontal:16,vertical:12),
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Colors.grey.shade200, width:1)),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children:[
              Text('Chọn ngày và giờ khám', style: TextStyle(fontSize:18,fontWeight:FontWeight.bold,color: Colors.black87)),
            ],
          ),
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16,16,16,110), // Giữ nguyên padding
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children:[
                _buildFlashcard(),
                _buildConfirmationBar(),
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(top:10),
                  child: ElevatedButton(
                    onPressed: isReadyToProceed ? ()=>widget.onNext({'date':selectedDate!, 'timeSlot':selectedTimeSlot, 'roomName': _getRoomForSlot(selectedDate, selectedTimeSlot)}) : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isReadyToProceed? AppColors.primary :Colors.grey,
                      foregroundColor: isReadyToProceed? AppColors.primaryDark :Colors.white,
                      padding: const EdgeInsets.symmetric(vertical:14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Tiếp theo', style: TextStyle(fontSize:18,fontWeight:FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}




