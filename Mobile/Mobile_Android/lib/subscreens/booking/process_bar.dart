// progress_bar.dart - Updated for 8 steps with scrolling UX
import 'package:flutter/material.dart';

class BookingProgressBar extends StatefulWidget {
  final int currentStep;
  final int totalSteps;
  final Function(int)? onStepTap;

  const BookingProgressBar({
    super.key,
    required this.currentStep,
    this.totalSteps = 8,
    this.onStepTap,
  });

  @override
  State<BookingProgressBar> createState() => _BookingProgressBarState();
}

class _BookingProgressBarState extends State<BookingProgressBar> {
  final ScrollController _scrollController = ScrollController();
  final List<GlobalKey> _stepKeys = [];

  // Labels for each step
  final List<String> stepLabels = const [
    'Khu vực',
    'Bệnh viện',
    'Chuyên khoa',
    'Ngày giờ',
    'Bác sĩ',
    'Thông tin',
    'Thanh toán',
    'Xác nhận'
  ];

  @override
  void initState() {
    super.initState();
    for (int i = 0; i < widget.totalSteps; i++) {
      _stepKeys.add(GlobalKey());
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToCurrentStep(widget.currentStep);
    });
  }

  @override
  void didUpdateWidget(covariant BookingProgressBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentStep != widget.currentStep) {
      _scrollToCurrentStep(widget.currentStep);
    }
  }

  void _scrollToCurrentStep(int stepNum) {
    if (stepNum > widget.totalSteps || stepNum < 1) return;

    final key = _stepKeys[stepNum - 1];
    final context = key.currentContext;

    if (context != null && _scrollController.hasClients) {
      final RenderBox renderBox = context.findRenderObject() as RenderBox;

      // SỬA LỖI: Sử dụng context của StatefulWidget để tìm RenderObject
      final RenderObject? scrollAncestor = this.context.findRenderObject();

      if (scrollAncestor == null) return; // Bảo vệ nếu chưa render xong

      // Tính toán vị trí tương đối so với ScrollView
      final position = renderBox.localToGlobal(Offset.zero, ancestor: scrollAncestor);

      final screenWidth = MediaQuery.of(this.context).size.width;
      final stepWidth = renderBox.size.width;

      // Tính toán offset để đặt bước ở giữa màn hình (hoặc gần giữa)
      final targetOffset = _scrollController.offset + position.dx - (screenWidth / 2) + (stepWidth / 2);

      _scrollController.animateTo(
        targetOffset,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Màu chủ đạo giả định
    const Color primaryColor = Colors.green;
    const Color activeColor = Colors.teal;
    const Color primaryDarkColor = Color(0xFF1B5E20);

    // Kiểm tra nếu đang ở bước Xác nhận (Step 8)
    final bool isFinalConfirmation = widget.currentStep == 8;

    return Container(
      height: 110,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: SingleChildScrollView(
        controller: _scrollController, // GÁN SCROLL CONTROLLER
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          children: List.generate(widget.totalSteps, (index) {
            final stepNum = index + 1;
            final isActive = stepNum == widget.currentStep;
            final isCompleted = stepNum < widget.currentStep;

            // Xử lý đường kẻ nối
            final Widget divider = stepNum < widget.totalSteps
                ? Container(
              width: 50,
              height: 2,
              color: isCompleted
                  ? primaryColor
                  : Colors.grey.withOpacity(0.3),
              margin: const EdgeInsets.symmetric(horizontal: 4),
            )
                : const SizedBox.shrink();

            final Widget stepColumn = SizedBox(
              key: _stepKeys[index], // GÁN GLOBAL KEY
              width: 80, // Giữ width cố định để tính toán cuộn chính xác
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isActive
                          ? activeColor
                          : (isCompleted ? primaryColor : Colors.grey.withOpacity(0.3)),
                      border: Border.all(
                          color: isActive ? activeColor : (isCompleted ? primaryColor : Colors.grey.shade400),
                          width: 2
                      ),
                    ),
                    child: Center(
                      child: Text(
                        '$stepNum',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    stepLabels[index],
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                      color: isActive ? activeColor : (isCompleted ? primaryDarkColor : Colors.grey),
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            );

            // --- Logic Wrap GestureDetector ---
            // Chỉ cho phép bấm vào các bước đã hoàn thành VÀ KHÔNG PHẢI BƯỚC CUỐI (8)
            final bool canBeTapped = isCompleted && !isFinalConfirmation;

            return Row(
              children: [
                if (canBeTapped && widget.onStepTap != null)
                  GestureDetector(
                    onTap: () => widget.onStepTap!(stepNum),
                    child: stepColumn,
                  )
                else
                  stepColumn,

                // Divider (đường kẻ)
                divider,
              ],
            );
          }),
        ),
      ),
    );
  }
}