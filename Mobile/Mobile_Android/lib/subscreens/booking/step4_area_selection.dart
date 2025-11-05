// step4_date_time_selection.dart - New step for date and time
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

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
  // Đặt selectedDate ban đầu là null để buộc người dùng chọn
  DateTime? selectedDate;
  String selectedTimeSlot = '';

  // Màu chủ đạo giả định (Lấy từ HomeScreen)
  final Color primaryColor = Colors.greenAccent;
  final Color primaryDarkColor = const Color(0xFF1B5E20);
  final Color primaryLightColor = const Color(0xFFE8F5E9);


  // Ngày giả định để mô phỏng lịch tháng (Ví dụ: Tháng 11/2025)
  late DateTime _displayedMonth;

  final List<String> timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30',
  ];

  @override
  void initState() {
    super.initState();
    // Khởi tạo tháng hiển thị là tháng hiện tại
    _displayedMonth = DateTime.now();
  }

  // Hàm DatePicker truyền thống vẫn được giữ lại để mở lịch toàn màn hình
  Future<void> _selectDate() async {
    final DateTime now = DateTime.now();
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: selectedDate ?? now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)), // 3 tháng tới
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: ColorScheme.light(
              primary: primaryDarkColor, // Header color
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: Colors.black87,
            ),
            dialogBackgroundColor: Colors.white,
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        selectedDate = picked;
        _displayedMonth = picked; // Cập nhật tháng hiển thị
        // Reset time slot khi chọn ngày mới
        selectedTimeSlot = '';
      });
    }
  }

  // --- WIDGET MÔ PHỎNG LỊCH THÁNG ---
  Widget _buildMonthCalendar() {
    // Lấy ngày đầu tiên của tháng hiển thị
    final firstDayOfMonth = DateTime(_displayedMonth.year, _displayedMonth.month, 1);

    // Ngày đầu tiên hiển thị trên lưới (Thứ Hai hoặc Chủ Nhật tùy theo locale, ở đây giả định Chủ Nhật)
    final startGridDay = firstDayOfMonth.subtract(Duration(days: firstDayOfMonth.weekday % 7));

    // Tạo danh sách các ngày để hiển thị trong lưới (tối đa 42 ô)
    final List<DateTime> days = List.generate(42, (index) => startGridDay.add(Duration(days: index)));

    // Ngày trong tuần (tiếng Việt, ngắn gọn)
    const List<String> weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Màu header (Teal)
    final Color headerColor = Colors.teal;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            // Month Navigation Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_left),
                  onPressed: () {
                    setState(() {
                      _displayedMonth = DateTime(_displayedMonth.year, _displayedMonth.month - 1, 1);
                    });
                  },
                ),
                Text(
                  // Đảm bảo locale 'vi' được truyền cho DateFormat
                  DateFormat('MMMM yyyy', 'vi').format(_displayedMonth),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.arrow_right),
                  onPressed: () {
                    setState(() {
                      _displayedMonth = DateTime(_displayedMonth.year, _displayedMonth.month + 1, 1);
                    });
                  },
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Weekdays Header (CN, T2, T3, ...)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: weekdays.map((day) => Expanded(
                child: Center(
                  child: Text(day, style: TextStyle(fontWeight: FontWeight.bold, color: headerColor)),
                ),
              )).toList(),
            ),
            const Divider(height: 10),

            // Calendar Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
                childAspectRatio: 1.0,
                mainAxisSpacing: 4,
                crossAxisSpacing: 4,
              ),
              itemCount: days.length,
              itemBuilder: (context, index) {
                final date = days[index];
                final bool isInMonth = date.month == _displayedMonth.month;
                final bool isToday = date.year == DateTime.now().year && date.month == DateTime.now().month && date.day == DateTime.now().day;
                final bool isSelected = selectedDate != null && date.year == selectedDate!.year && date.month == selectedDate!.month && date.day == selectedDate!.day;
                final bool isPast = date.isBefore(DateTime.now().subtract(const Duration(hours: 24)));

                // Điều kiện để disable/mờ ngày
                final bool isDisabled = !isInMonth || isPast;

                return GestureDetector(
                  onTap: isDisabled ? null : () { // Không thể bấm nếu Disabled
                    setState(() {
                      selectedDate = date;
                      selectedTimeSlot = '';
                    });
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isSelected
                          ? primaryColor.withOpacity(0.8)
                          : (isToday && !isDisabled ? Colors.blue.shade100 : null), // Màu khác cho "Hôm nay"
                      border: isSelected ? Border.all(color: primaryDarkColor, width: 2) : null,
                    ),
                    child: Center(
                      child: Opacity( // Dùng Opacity để mờ ngày ngoài tháng và ngày đã qua
                        opacity: isDisabled ? 0.3 : 1.0,
                        child: Text(
                          '${date.day}',
                          style: TextStyle(
                            color: isSelected ? primaryDarkColor : Colors.black87,
                            fontWeight: isSelected || isToday ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }


  // Widget hiển thị lưới chọn giờ hoặc thông báo
  Widget _buildTimeSelection() {
    if (selectedDate == null) {
      return Container(
        padding: const EdgeInsets.all(24),
        width: double.infinity,
        height: 150, // Chiều cao cố định cho khung thông báo
        decoration: BoxDecoration(
          color: primaryLightColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: primaryColor.withOpacity(0.5)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_busy, color: primaryDarkColor.withOpacity(0.7), size: 40),
            const SizedBox(height: 10),
            Text(
              'Vui lòng chọn ngày khám ở trên.',
              style: TextStyle(color: primaryDarkColor.withOpacity(0.7), fontSize: 16),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    // Nếu đã chọn ngày, hiển thị lưới chọn giờ
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(left: 16, top: 16),
            child: Text(
              'Chọn giờ khám (các khung giờ còn trống):',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 2.8,
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
              ),
              itemCount: timeSlots.length,
              itemBuilder: (context, index) {
                final slot = timeSlots[index];
                final isSelected = selectedTimeSlot == slot;
                return ChoiceChip(
                  label: Text(slot, style: TextStyle(color: isSelected ? primaryDarkColor : Colors.black87, fontWeight: FontWeight.w500)),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() => selectedTimeSlot = selected ? slot : '');
                  },
                  // Đổi màu selected thành primaryColor
                  selectedColor: primaryColor,
                  backgroundColor: Colors.grey.shade100,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(color: isSelected ? primaryDarkColor : Colors.grey.shade300),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // Widget hiển thị xác nhận đặt lịch
  Widget _buildConfirmationBar() {
    if (selectedDate != null && selectedTimeSlot.isNotEmpty) {
      final formattedDate = DateFormat('EEEE, dd/MM/yyyy', 'vi').format(selectedDate!);
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        margin: const EdgeInsets.only(top: 20),
        decoration: BoxDecoration(
          // Đổi màu nền thành xanh nhạt hơn (0.3)
          color: primaryColor.withOpacity(0.3),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: primaryDarkColor.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Lịch khám đã chọn:',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                // Giữ màu chữ đậm cho dễ đọc
                color: Color(0xFF1B5E20),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '$formattedDate | Giờ: $selectedTimeSlot',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1B5E20),
              ),
            ),
          ],
        ),
      );
    }
    return const SizedBox.shrink(); // Không hiển thị nếu chưa chọn đủ
  }


  @override
  Widget build(BuildContext context) {
    // Kiểm tra xem đã chọn Ngày và Giờ chưa để kích hoạt nút
    final bool isReadyToProceed = selectedDate != null && selectedTimeSlot.isNotEmpty;

    // Header Color (Giả định Teal hoặc màu của Step 4)
    final Color headerColor = Colors.teal;

    return Column(
      children: [
        // --- Header Tùy Chỉnh (Đã loại bỏ nút Back) ---
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Colors.grey.shade200, width: 1)),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'Chọn ngày và giờ khám',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87
                ),
              ),
            ],
          ),
        ),
        // --- Kết thúc Header Tùy Chỉnh ---

        Expanded(
          child: SingleChildScrollView( // Dùng SingleChildScrollView để cuộn nội dung
            // SỬA ĐỔI PADDING ĐỂ THÊM 100PX BOTTOM
            padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 110.0), // Tăng bottom padding lên 110px cho chắc
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Chọn ngày (Lịch tháng mô phỏng)
                const Text(
                  '1. Chọn ngày khám:',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                _buildMonthCalendar(), // Sử dụng lịch tháng trực quan hơn

                // Nút mở DatePicker (Dạng ListTile cải tiến)
                Card(
                  elevation: 2,
                  margin: const EdgeInsets.only(top: 10, bottom: 20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    leading: Icon(Icons.calendar_month, color: primaryDarkColor),
                    title: const Text('Ngày đã chọn'),
                    subtitle: Text(
                      selectedDate == null ? 'Nhấn để mở lịch chọn ngày' : DateFormat('EEEE, dd/MM/yyyy', 'vi').format(selectedDate!),
                      style: TextStyle(fontWeight: FontWeight.bold, color: selectedDate == null ? Colors.red : primaryDarkColor),
                    ),
                    trailing: const Icon(Icons.edit, size: 20, color: Colors.grey),
                    onTap: _selectDate,
                  ),
                ),

                const SizedBox(height: 20),

                // 2. Chọn giờ (Logic hiển thị theo ngày)
                const Text(
                  '2. Chọn giờ khám:',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                _buildTimeSelection(),

                // 3. Thanh xác nhận (chỉ hiển thị khi đầy đủ)
                _buildConfirmationBar(),

                // 4. Nút Tiếp theo
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(top: 10),
                  child: ElevatedButton(
                    onPressed: isReadyToProceed
                        ? () => widget.onNext({'date': selectedDate!, 'timeSlot': selectedTimeSlot})
                        : null,
                    style: ElevatedButton.styleFrom(
                      // Đổi màu nền nút thành primaryColor
                      backgroundColor: isReadyToProceed ? primaryColor : Colors.grey,
                      foregroundColor: isReadyToProceed ? primaryDarkColor : Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Tiếp theo', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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