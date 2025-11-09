// step4_date_time_selection.dart - Flashcard ngày->giờ, toggle đổ nước
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flip_card/flip_card.dart';

class Step4DateTimeSelection extends StatefulWidget {
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;
  const Step4DateTimeSelection({
    super.key,
    required this.onNext,
    required this.onBack,
  });

  @override
  State<Step4DateTimeSelection> createState() => _Step4DateTimeSelectionState();
}

class _Step4DateTimeSelectionState extends State<Step4DateTimeSelection> {
  DateTime? selectedDate;
  String selectedTimeSlot = '';

  final Color primaryColor = Colors.greenAccent;
  final Color primaryDarkColor = const Color(0xFF1B5E20);

  late DateTime _displayedMonth;
  bool flashcardEnabled = true;

  final List<String> timeSlots = [
    '08:00','08:30','09:00','09:30','10:00','10:30',
    '11:00','13:00','13:30','14:00','14:30','15:00',
    '15:30','16:00','16:30',
  ];

  final GlobalKey<FlipCardState> _flipCardKey = GlobalKey<FlipCardState>();

  double cardHeight = 400; // Chiều cao cố định cho 2 mặt bằng nhau

  @override
  void initState() {
    super.initState();
    _displayedMonth = DateTime.now();
  }

  Future<void> _selectDate(DateTime date) async {
    setState(() {
      selectedDate = date;
      selectedTimeSlot = '';
    });
    // Lật flashcard 1 giây sau khi chọn ngày
    if (_flipCardKey.currentState != null) {
      Future.delayed(const Duration(seconds: 1), () {
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
                    final isDisabled = !isInMonth || isPast;

                    return GestureDetector(
                      onTap: isDisabled ? null : ()=>_selectDate(date),
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSelected ? primaryColor.withOpacity(0.8) :
                          (isToday && !isDisabled ? Colors.blue.shade100 : null),
                          border: isSelected ? Border.all(color: primaryDarkColor, width: 2) : null,
                        ),
                        child: Center(
                          child: Opacity(
                            opacity: isDisabled?0.3:1.0,
                            child: Text('${date.day}', style: TextStyle(
                              color: isSelected?primaryDarkColor:Colors.black87,
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
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount:3, childAspectRatio:2.8, mainAxisSpacing:8, crossAxisSpacing:8),
                  itemCount: timeSlots.length,
                  itemBuilder: (context,index){
                    final slot=timeSlots[index];
                    final isSelected = selectedTimeSlot==slot;
                    return ChoiceChip(
                      label: Text(slot, style: TextStyle(
                          color:isSelected?primaryDarkColor:Colors.black87,
                          fontWeight:FontWeight.w500
                      )),
                      selected:isSelected,
                      onSelected:(s)=>setState(()=>selectedTimeSlot=s?slot:''),
                      selectedColor: primaryColor,
                      backgroundColor: Colors.grey.shade100,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: BorderSide(color:isSelected?primaryDarkColor:Colors.grey.shade300),
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
          color: primaryColor.withOpacity(0.3),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: primaryDarkColor.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Lịch khám đã chọn:', style: TextStyle(fontSize:16,fontWeight: FontWeight.bold,color: Color(0xFF1B5E20))),
            const SizedBox(height:4),
            Text('$formattedDate | Giờ: $selectedTimeSlot',
                style: const TextStyle(fontSize:18,fontWeight:FontWeight.w600,color: Color(0xFF1B5E20))),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
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
                    onPressed: isReadyToProceed ? ()=>widget.onNext({'date':selectedDate!, 'timeSlot':selectedTimeSlot}) : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isReadyToProceed?primaryColor:Colors.grey,
                      foregroundColor: isReadyToProceed?primaryDarkColor:Colors.white,
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
