import 'package:flutter/material.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  String? _selectedDoctor;
  DateTime? _selectedDate;
  String? _selectedTimeSlot;
  final List<String> doctors = ['BS. Nguyễn Văn A - Tim mạch', 'BS. Trần Thị B - Nội khoa', 'BS. Lê Văn C - Nhi khoa'];
  final List<String> timeSlots = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00', '15:00 - 16:00'];

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  void _confirmBooking() {
    if (_selectedDoctor == null || _selectedDate == null || _selectedTimeSlot == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn đầy đủ thông tin!')),
      );
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Đặt lịch thành công cho $_selectedDoctor vào $_selectedDate lúc $_selectedTimeSlot!')),
    );
    Navigator.pop(context); // FIXED: Quay về screen trước
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFF8F0),
      appBar: AppBar(
        title: const Text("Đặt lịch khám"),
        backgroundColor: Colors.greenAccent,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Chọn bác sĩ',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Card(
              child: DropdownButtonFormField<String>(
                value: _selectedDoctor,
                decoration: const InputDecoration(
                  labelText: 'Bác sĩ/Khoa',
                  contentPadding: EdgeInsets.all(16),
                ),
                items: doctors.map((doctor) => DropdownMenuItem(value: doctor, child: Text(doctor))).toList(),
                onChanged: (value) => setState(() => _selectedDoctor = value),
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              'Chọn ngày khám',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                title: const Text('Ngày khám'),
                subtitle: Text(_selectedDate == null ? 'Chọn ngày' : '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'),
                trailing: const Icon(Icons.calendar_today),
                onTap: () => _selectDate(context),
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              'Chọn khung giờ',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Card(
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: timeSlots.map((slot) => FilterChip(
                  label: Text(slot),
                  selected: _selectedTimeSlot == slot,
                  onSelected: (selected) => setState(() => _selectedTimeSlot = selected ? slot : null),
                  selectedColor: Colors.greenAccent.withOpacity(0.3),
                )).toList(),
              ),
            ),
            const SizedBox(height: 40),

            ElevatedButton(
              onPressed: _confirmBooking,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.greenAccent,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Xác nhận đặt lịch', style: TextStyle(fontSize: 18, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}