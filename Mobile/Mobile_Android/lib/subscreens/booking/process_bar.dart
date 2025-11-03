// progress_bar.dart - Updated for 6 steps with labels, horizontal scroll, and tappable completed steps
import 'package:flutter/material.dart';

class BookingProgressBar extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final Function(int)? onStepTap; // Callback for tapping completed steps
  BookingProgressBar({
    super.key,
    required this.currentStep,
    this.totalSteps = 7,
    this.onStepTap,
  });

  // Labels for each step
  final List<String> stepLabels = [
    'Khu vực',
    'Bệnh viện',
    'Chuyên khoa',
    'Ngày giờ',
    'Bác sĩ',
    'Thông tin',
    'Xác nhận'
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120, // Tăng chiều cao để chứa labels
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: List.generate(totalSteps, (index) {
            final stepNum = index + 1;
            final isActive = stepNum == currentStep;
            final isCompleted = stepNum < currentStep;
            final isDisabled = !isActive && !isCompleted; // Grey steps not tappable
            final Widget stepColumn = Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Column(
                children: [
                  Container(
                    width: 40, // Tăng kích thước
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isActive
                          ? Colors.teal
                          : (isCompleted ? Colors.green : Colors.grey.withOpacity(0.3)),
                      border: Border.all(
                          color: isActive ? Colors.teal : (isCompleted ? Colors.green : Colors.grey), width: 2),
                    ),
                    child: Center(
                      child: Text(
                        '$stepNum',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: isActive ? 18 : 16, // Tăng font size
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  if (stepNum < totalSteps) ...[
                    Container(
                      width: 50,
                      height: 2,
                      color: isCompleted
                          ? Colors.green
                          : Colors.grey.withOpacity(0.3),
                    ),
                    const SizedBox(height: 8),
                  ],
                  Text(
                    stepLabels[stepNum - 1],
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                      color: isActive ? Colors.teal : (isCompleted ? Colors.green : Colors.grey),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
            // Wrap with GestureDetector only for completed steps
            if (isCompleted && onStepTap != null) {
              return GestureDetector(
                onTap: () => onStepTap!(stepNum),
                child: stepColumn,
              );
            }
            return stepColumn;
          }),
        ),
      ),
    );
  }
}