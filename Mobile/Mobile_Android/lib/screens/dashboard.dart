// main_screen.dart - Main screen with bottom navigation and draggable chatbot
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:clinic_booking_system/screens/settings.dart';
import 'appointments.dart';
import 'booking.dart';
import 'home.dart';
import 'qr_scan.dart';
import 'chatbot.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> with TickerProviderStateMixin {
  int _selectedIndex = 0;

  double chatX = 0;
  double chatY = 0;

  late AnimationController _chatController;
  late Animation<double> _chatScale;
  bool _showChatHint = true; // 👈 Hiện lời chào 4s
  bool _initialized = false;

  @override
  void initState() {
    super.initState();

    _chatController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    )..repeat(reverse: true);

    _chatScale = Tween<double>(begin: 1.0, end: 1.1)
        .animate(CurvedAnimation(parent: _chatController, curve: Curves.easeInOut));

    // 👇 Ẩn popup sau 4s
    Timer(const Duration(seconds: 5), () {
      if (mounted) setState(() => _showChatHint = false);
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      _initialized = true;
      final size = MediaQuery.of(context).size;
      if (mounted) {
        setState(() {
          chatX = size.width - 90;
          chatY = size.height - 170;
        });
      }
    }
  }

  @override
  void dispose() {
    _chatController.dispose();
    super.dispose();
  }

  void _switchToBooking() {
    setState(() {
      _selectedIndex = 1;
    });
  }

  // 👈 Mở popup dialog khi tap chatbot
  void _openChatDialog() {
    showDialog(
      context: context,
      barrierDismissible: true, // 👈 Có thể tap ngoài để đóng
      barrierColor: Colors.black.withOpacity(0.3), // 👈 Làm nền mờ hơn
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(16),
          child: ClipRRect( // 👈 Wrap để clip bo tròn toàn bộ, đảm bảo dưới cũng bo
            borderRadius: BorderRadius.circular(20),
            child: Container(
              width: double.infinity,
              height: MediaQuery.of(context).size.height * 0.7, // 👈 Giảm xuống 70% để nhỏ hơn
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.95), // 👈 Thêm độ trong suốt nhẹ
                // 👈 Bỏ borderRadius ở đây, để ClipRRect lo
              ),
              child: Column(
                children: [
                  // 👈 Header với nút đóng
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: const BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(20),
                        topRight: Radius.circular(20),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "Chatbot Assistant",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white),
                          onPressed: () => Navigator.of(context).pop(),
                        ),
                      ],
                    ),
                  ),
                  // 👈 Nội dung chatbot screen
                  Expanded(
                    child: const ChatBotScreen(), // 👈 Wrap ChatBotScreen vào đây
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        extendBody: true,
        body: Stack(
          children: [
            IndexedStack(
              index: _selectedIndex,
              children: [
                HomeScreen(onBookingTap: _switchToBooking),
                const BookingScreen(),
                const AppointmentsScreen(),
                const SettingScreen(),
              ],
            ),

            // ✅ Chatbot nổi (dùng ảnh PNG)
            // ✅ Draggable chatbot
            Positioned(
              left: chatX,
              top: chatY,
              child: GestureDetector(
                onPanUpdate: (details) {
                  final screenSize = MediaQuery.of(context).size;
                  setState(() {
                    chatX += details.delta.dx;
                    chatY += details.delta.dy;
                    // Giới hạn trong màn hình
                    chatX = chatX.clamp(0.0, screenSize.width - 70.0);
                    chatY = chatY.clamp(0.0, screenSize.height - 150.0);
                  });
                },
                onTap: _openChatDialog, // 👈 Thay vì Navigator.push, giờ dùng dialog
                child: Stack(
                  clipBehavior: Clip.none, // 👈 Cho phép popup hiển thị ngoài vùng chatbot
                  alignment: Alignment.center,
                  children: [
                    // 👇 Hiệu ứng hiện lời chào (4s tự tắt)
                    if (_showChatHint)
                      Positioned(
                        right: 80,
                        top: -10,
                        child: AnimatedOpacity(
                          opacity: _showChatHint ? 1 : 0,
                          duration: const Duration(milliseconds: 600),
                          child: AnimatedSlide(
                            offset: _showChatHint ? Offset.zero : const Offset(0.2, 0),
                            duration: const Duration(milliseconds: 600),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.green.shade600,
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.25),
                                    blurRadius: 6,
                                    offset: const Offset(2, 3),
                                  ),
                                ],
                              ),
                              child: const Text(
                                "Bạn cần giúp đỡ?\nHãy nhắn tôi nhé!",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                        ),
                      ),

                    // 👇 Chatbot PNG có animation rung nhẹ
                    AnimatedBuilder(
                      animation: _chatScale,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: _chatScale.value,
                          child: Container(
                            width: 70,
                            height: 70,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  blurRadius: 6,
                                  color: Colors.black.withOpacity(0.25),
                                ),
                              ],
                            ),
                            child: ClipOval(
                              child: Image.asset(
                                'assets/images/chatbot.png', // 👈 Ảnh chatbot
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),

        // ✅ Navbar kiểu notch
        bottomNavigationBar: BottomAppBar(
          shape: const CircularNotchedRectangle(),
          notchMargin: 6,
          elevation: 0, // 👈 Bỏ shadow để navbar không xám khi scroll
          child: SizedBox(
            height: 60,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                navItem(Icons.home, "Trang chủ", 0),
                navItem(Icons.medical_services, "Đặt lịch", 1),
                const SizedBox(width: 40),
                navItem(Icons.list_alt, "Lịch hẹn", 2),
                navItem(Icons.settings, "Cài đặt", 3),
              ],
            ),
          ),
        ),

        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

        floatingActionButton: AnimatedBuilder(
          animation: _chatController,
          builder: (context, child) {
            final t = _chatController.value;
            final bool changed = t > 0.5;

            return Stack(
              alignment: Alignment.center,
              children: [
                // 🌀 Hiệu ứng tia sáng quét dọc trong hình tròn
                ClipOval(
                  child: ShaderMask(
                    shaderCallback: (rect) {
                      return LinearGradient(
                        begin: Alignment(0, -1.0 + 2.0 * t), // Từ trên xuống
                        end: Alignment(0, -0.8 + 2.0 * t),
                        colors: [
                          Colors.white.withOpacity(0.0),
                          Colors.white.withOpacity(0.6),
                          Colors.white.withOpacity(0.0),
                        ],
                        stops: const [0.0, 0.5, 1.0],
                      ).createShader(rect);
                    },
                    blendMode: BlendMode.srcATop,
                    child: FloatingActionButton(
                      backgroundColor: Colors.green,
                      shape: const CircleBorder(),
                      elevation: 10,
                      child: Transform.scale(
                        scale: 1 + 0.08 * (changed ? (1 - (t - 0.5) * 2) : t * 2),
                        child: Icon(
                          changed ? Icons.qr_code_2_outlined : Icons.qr_code_scanner,
                          size: 28,
                          color: Colors.white,
                        ),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const QRScanScreen()),
                        );
                      },
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  // ✅ Bottom Navbar item
  Widget navItem(IconData icon, String label, int index) {
    final bool active = _selectedIndex == index;
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(30),
      child: InkWell(
        borderRadius: BorderRadius.circular(30),
        splashColor: Colors.green.withOpacity(0.2),
        highlightColor: Colors.transparent,
        onTap: () => setState(() => _selectedIndex = index),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: active ? Colors.green : Colors.grey),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  color: active ? Colors.green : Colors.grey,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}