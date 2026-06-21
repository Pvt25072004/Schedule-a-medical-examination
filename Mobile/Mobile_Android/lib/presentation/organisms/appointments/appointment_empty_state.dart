import 'package:flutter/material.dart';

class AppointmentEmptyState extends StatelessWidget {
  const AppointmentEmptyState({super.key});

  @override
  Widget build(BuildContext context) {
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
}
