import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'presentation/pages/profile/profile_page.dart';
import 'presentation/pages/appointments/appointments_page.dart';
import 'presentation/pages/booking/booking_page.dart';
import 'presentation/pages/home/home_page.dart';
import 'presentation/organisms/chatbot/chatbot_widget.dart';
import 'presentation/pages/social/social_feed_page.dart';
import 'presentation/pages/doctors/doctor_dashboard_page.dart';
import 'presentation/pages/doctors/all_doctors_page.dart';
import 'presentation/pages/service_packages/service_packages_page.dart';
import 'core/utils/snackbar_helper.dart' as snackbar_helper;
import 'package:provider/provider.dart';
import 'logics/auth/providers/auth_provider.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> with TickerProviderStateMixin {
  int _selectedIndex = 0;
  bool _isDoctor = false;

  double chatX = 0;
  double chatY = 0;

  late AnimationController _chatController;
  late Animation<double> _chatScale;
  bool _showChatHint = true; // 👈 Hiện lời chào 4s
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _checkDoctorRole();

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

  bool _canScanQR = false;

  Future<void> _checkDoctorRole() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.currentUser;
    if (user != null) {
      if (mounted) {
        setState(() {
          _isDoctor = (user.role == 'Bác sĩ' || user.role?.toLowerCase() == 'doctor' || user.role == 'DOCTOR');
        });
      }
    }
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
    _showBookingOptions();
  }

  void _showBookingOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('Tùy chọn Đặt Lịch', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
              ListTile(
                leading: const Icon(Icons.local_hospital, color: Color(0xFF48A1F3)),
                title: const Text('Đặt lịch theo cơ sở'),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _selectedIndex = 1);
                },
              ),
              ListTile(
                leading: const Icon(Icons.person, color: Colors.blue),
                title: const Text('Đặt khám theo bác sĩ'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (context) => const AllDoctorsPage()));
                },
              ),
              ListTile(
                leading: const Icon(Icons.home, color: Colors.orange),
                title: const Text('Khám tại nhà'),
                onTap: () {
                  Navigator.pop(context);
                  snackbar_helper.showAppSnackBar(context, 'Tính năng Khám tại nhà đang phát triển!');
                },
              ),
              ListTile(
                leading: const Icon(Icons.medical_services, color: Colors.purple),
                title: const Text('Gói dịch vụ khám'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (context) => const ServicePackagesPage()));
                },
              ),
            ],
          ),
        );
      },
    );
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
                      color: const Color(0xFF48A1F3),
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
                    child: const ChatbotWidget(), // 👈 Wrap ChatBotScreen vào đây
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
                HomePage(onBookingTap: _switchToBooking),
                const BookingPage(),
                const SocialFeedPage(),
                const AppointmentsPage(),
                const ProfilePage(),
              ],
            ),

            // 🔄 Nút Chuyển Sang Giao Diện Bác Sĩ (Chỉ hiện nếu User là Bác sĩ)
            if (_isDoctor)
              Positioned(
                top: 55,
                right: 20,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.teal.shade700, Colors.teal.shade500],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.teal.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      )
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(20),
                      onTap: () {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (context) => const DoctorDashboardPage()),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(Icons.medical_services_outlined, color: Colors.white, size: 14),
                            SizedBox(width: 4),
                            Text(
                              'Về Bác sĩ',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
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
                                color: const Color(0xFF48A1F3),
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
          elevation: 0,
          child: SizedBox(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                navItem(Icons.home, "Trang chủ", 0),
                navItem(Icons.public, "Cộng đồng", 2),
                const SizedBox(width: 40),
                navItem(Icons.calendar_month, "Đặt lịch", -1), // -1 triggers popup
                navItem(Icons.list_alt, "Lịch hẹn", 3),
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
                ClipOval(
                  child: ShaderMask(
                    shaderCallback: (rect) {
                      return LinearGradient(
                        begin: Alignment(0, -1.0 + 2.0 * t), 
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
                      backgroundColor: const Color(0xFF48A1F3),
                      shape: const CircleBorder(),
                      elevation: 10,
                      child: Transform.scale(
                        scale: 1 + 0.08 * (changed ? (1 - (t - 0.5) * 2) : t * 2),
                        child: Builder(
                          builder: (context) {
                            final authProvider = Provider.of<AuthProvider>(context);
                            final currentUser = authProvider.currentUser;
                            return (currentUser?.photoUrl != null && currentUser!.photoUrl!.isNotEmpty)
                                ? ClipOval(
                                    child: Image.network(
                                      currentUser.photoUrl!,
                                      width: 28,
                                      height: 28,
                                      fit: BoxFit.cover,
                                      errorBuilder: (c, e, s) => Icon(
                                        changed ? Icons.person_outline : Icons.person,
                                        size: 28,
                                        color: Colors.white,
                                      ),
                                    ),
                                  )
                                : Icon(
                                    changed ? Icons.person_outline : Icons.person,
                                    size: 28,
                                    color: Colors.white,
                                  );
                          }
                        ),
                      ),
                      onPressed: () {
                        setState(() => _selectedIndex = 4);
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
    final bool active = _selectedIndex == index && index != -1;
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(30),
      child: InkWell(
        borderRadius: BorderRadius.circular(30),
        splashColor: const Color(0xFF48A1F3).withOpacity(0.2),
        highlightColor: Colors.transparent,
        onTap: () {
          if (index == -1) {
            _showBookingOptions();
          } else {
            setState(() => _selectedIndex = index);
          }
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: active ? const Color(0xFF48A1F3) : Colors.grey),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  color: active ? const Color(0xFF48A1F3) : Colors.grey,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
