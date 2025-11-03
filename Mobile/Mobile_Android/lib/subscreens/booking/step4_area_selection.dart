// step4_date_time_selection.dart - New step for date and time
import 'package:clinic_booking_system/subscreens/booking/step2_area_selection.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart'; // For date formatting, add to pubspec.yaml

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
  DateTime selectedDate = DateTime.now();
  String selectedTimeSlot = '';

  final List<String> timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30',
  ];

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked != null) setState(() => selectedDate = picked);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AppBar(
          title: const Text('Chọn ngày và giờ khám'),
          backgroundColor: Colors.teal,
          foregroundColor: Colors.white,
          automaticallyImplyLeading: false,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: widget.onBack,
          ),
        ).asBody(),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                // Date picker (simple calendar simulation or use table)
                Card(
                  child: Column(
                    children: [
                      ListTile(
                        title: Text('Chọn ngày'),
                        subtitle: Text(DateFormat('MMMM yyyy').format(selectedDate)),
                        trailing: const Icon(Icons.calendar_today),
                        onTap: _selectDate,
                      ),
                      // Simple calendar grid (mock for Nov 2025)
                      Table(
                        children: [
                          TableRow(children: [
                            _buildCalendarDay(26, false),
                            _buildCalendarDay(27, false),
                            _buildCalendarDay(28, false),
                            _buildCalendarDay(29, false),
                            _buildCalendarDay(30, false),
                            _buildCalendarDay(31, false),
                            _buildCalendarDay(1, false),
                          ]),
                          TableRow(children: [
                            _buildCalendarDay(2, false),
                            _buildCalendarDay(3, false),
                            _buildCalendarDay(4, false),
                            _buildCalendarDay(5, false),
                            _buildCalendarDay(6, true), // Selected
                            _buildCalendarDay(7, false),
                            _buildCalendarDay(8, false),
                          ]),
                          // Add more rows as needed
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                // Time slots grid
                Card(
                  child: Column(
                    children: [
                      const ListTile(title: Text('Chọn giờ')),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            childAspectRatio: 2,
                          ),
                          itemCount: timeSlots.length,
                          itemBuilder: (context, index) {
                            final slot = timeSlots[index];
                            return FilterChip(
                              label: Text(slot),
                              selected: selectedTimeSlot == slot,
                              onSelected: (selected) {
                                setState(() => selectedTimeSlot = selected ? slot : '');
                              },
                              selectedColor: Colors.blue.withOpacity(0.3),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: selectedTimeSlot.isNotEmpty
                      ? () => widget.onNext({'date': selectedDate, 'timeSlot': selectedTimeSlot})
                      : null,
                  child: const Text('Tiếp theo'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCalendarDay(int day, bool isSelected) {
    return GestureDetector(
      onTap: () => setState(() {
        selectedDate = DateTime(selectedDate.year, selectedDate.month, day);
      }),
      child: Container(
        margin: const EdgeInsets.all(4),
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isSelected ? Colors.blue : null,
        ),
        child: Text('$day'),
      ),
    );
  }
}