import 'dart:async';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:http/http.dart' as http;
import 'chatbot.dart';

// --- Cài đặt Màu Chủ đạo ---
const Color primaryColor = Colors.greenAccent; // Xanh lá cây
const Color primaryDarkColor = Color(0xFF1B5E20); // Xanh lá đậm cho chữ
const Color primaryLightColor = Color(0xFFE8F5E9); // Xanh lá rất nhạt cho nền

// Giả định: Mock data
String getUserName() => 'Nguyễn Văn A';

final List<Map<String, String>> bannerData = [
  {'image': 'assets/images/banner1.jpg', 'title': 'Ưu đãi khám sức khỏe 50%', 'subtitle': 'Duy nhất trong tháng'},
  {'image': 'assets/images/banner2.jpg', 'title': 'Vaccine mới nhất', 'subtitle': 'Miễn phí tư vấn'},
  {'image': 'assets/images/banner3.jpg', 'title': 'Tư vấn trực tuyến miễn phí', 'subtitle': 'Đội ngũ chuyên gia'},
];

// Hàm lấy icon thời tiết mock
IconData getWeatherIcon(String iconCode) {
  if (iconCode.contains('01')) return Icons.wb_sunny_rounded;
  if (iconCode.contains('09') || iconCode.contains('10')) return Icons.cloudy_snowing;
  if (iconCode.contains('03') || iconCode.contains('04')) return Icons.cloud;
  return Icons.cloud_outlined;
}

// Mock weather data - (Giữ nguyên logic fetch/mock)
Future<Map<String, dynamic>> fetchWeather() async {
  return {
    'name': 'Hà Nội',
    'main': {'temp': 28.0, 'humidity': 70},
    'weather': [
      {'description': 'Trời nắng', 'icon': '01d'}
    ],
  };
}

// Icon data cho chuyên khoa (Thêm nhiều hơn 5)
final List<Map<String, dynamic>> allSpecialties = [
  {'title': 'Nha khoa', 'icon': Icons.density_small},
  {'title': 'Da liễu', 'icon': Icons.spa_outlined},
  {'title': 'Nội khoa', 'icon': Icons.heart_broken_outlined},
  {'title': 'Sản phụ khoa', 'icon': Icons.woman_outlined},
  {'title': 'Tai Mũi Họng', 'icon': Icons.earbuds},
  {'title': 'Cơ Xương Khớp', 'icon': Icons.accessible_outlined},
  {'title': 'Nhãn khoa', 'icon': Icons.visibility_outlined},
  {'title': 'Ung bướu', 'icon': Icons.biotech_outlined},
];
const int initialSpecialtyCount = 5;

// Mock data cho bác sĩ nổi tiếng
final List<Map<String, dynamic>> famousDoctors = [
  {
    'name': 'BS. Trần Văn Khánh',
    'specialty': 'Tim mạch',
    'rating': 4.9,
    'image': 'assets/doctors/doctor1.jpg',
    'bio': 'Bệnh viện Hồng Ngọc',
  },
  {
    'name': 'BS. Nguyễn Thị Hoa',
    'specialty': 'Da liễu',
    'rating': 4.8,
    'image': 'assets/doctors/doctor2.jpg',
    'bio': 'Phòng khám Sài Gòn',
  },
  {
    'name': 'TS. Lê Văn Tín',
    'specialty': 'Cơ Xương Khớp',
    'rating': 4.7,
    'image': 'assets/doctors/doctor1.jpg',
    'bio': 'Bệnh viện 108',
  },
  {
    'name': 'BS. Phạm Thanh',
    'specialty': 'Nhi Khoa',
    'rating': 5.0,
    'image': 'assets/doctors/doctor2.jpg',
    'bio': 'Bệnh viện Nhi TW',
  },
];

// Fallback mock news
final List<Map<String, dynamic>> mockNews = [
  {
    'title': 'Mẹo ăn uống lành mạnh',
    'excerpt': 'Chế độ ăn cân bằng cho sức khỏe tốt.',
    'image': 'assets/news/news1.jpg',
  },
  {
    'title': 'Tập luyện cho tim mạch',
    'excerpt': 'Bài tập đơn giản hàng ngày.',
    'image': 'assets/news/news2.jpg',
  },
  {
    'title': 'Phòng ngừa bệnh thường gặp',
    'excerpt': 'Lời khuyên từ chuyên gia.',
    'image': 'assets/news/news3.jpg',
  },
];

Future<List<Map<String, dynamic>>> fetchHealthNews() async {
  return Future.value(mockNews);
}

class HomeScreen extends StatefulWidget {
  final VoidCallback? onBookingTap;

  const HomeScreen({super.key, this.onBookingTap});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  late AnimationController _slideController;
  late Animation<Offset> _slideAnimation;

  int _currentBannerIndex = 0;
  Map<String, dynamic>? _weatherData;
  bool _isLoadingWeather = true;
  List<Map<String, dynamic>> _healthNews = [];
  bool _isLoadingNews = true;
  bool _showAllSpecialties = false;

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 1), end: Offset.zero).animate(
          CurvedAnimation(parent: _slideController, curve: Curves.easeOutCubic),
        );

    _fadeController.forward().then((_) => _slideController.forward());
    _loadWeather();
    _loadNews();
  }

  Future<void> _loadNews() async {
    setState(() => _isLoadingNews = true);
    final news = await fetchHealthNews();
    setState(() {
      _healthNews = news;
      _isLoadingNews = false;
    });
  }

  Future<void> _loadWeather() async {
    setState(() => _isLoadingWeather = true);
    final data = await fetchWeather();
    setState(() {
      _weatherData = data;
      _isLoadingWeather = false;
    });
  }

  Future<void> _refresh() async {
    await Future.wait([_loadWeather(), _loadNews()]);
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  // --- Widget thời tiết ---
  Widget _buildWeatherWidget() {
    if (_isLoadingWeather) {
      return const SizedBox(
        width: 120,
        height: 32,
        child: Center(
          child: LinearProgressIndicator(color: primaryColor),
        ),
      );
    }

    final temp = _weatherData?['main']['temp']?.toStringAsFixed(1) ?? 'N/A';
    final city = _weatherData?['name'] ?? 'Vị trí';
    final iconCode = _weatherData?['weather'][0]['icon'] ?? '01d';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: primaryColor.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            getWeatherIcon(iconCode),
            color: primaryDarkColor,
            size: 18,
          ),
          const SizedBox(width: 4),
          Text(
            '$temp°C, $city',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: primaryDarkColor,
            ),
          ),
        ],
      ),
    );
  }

  // --- Hàm show Dialog Chatbot ---
  void _showChatbotDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      barrierColor: Colors.black.withOpacity(0.3),
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(16),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Container(
              width: double.infinity,
              height: MediaQuery.of(context).size.height * 0.7,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.95),
              ),
              child: Column(
                children: [
                  // Header với nút đóng
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: const BoxDecoration(
                      color: primaryColor,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(20),
                        topRight: Radius.circular(20),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.android_outlined, color: Colors.white),
                            const SizedBox(width: 8),
                            const Text(
                              'Chat với AI Bác sĩ',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white),
                          onPressed: () => Navigator.of(context).pop(),
                        ),
                      ],
                    ),
                  ),
                  // Nội dung chatbot screen
                  const Expanded(
                    child: ChatBotScreen(),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // --- Hàm chuyển đến màn hình Booking (thực tế) ---
  void _goToBookingScreen(BuildContext context) {
    widget.onBookingTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    final userName = getUserName();
    final screenWidth = MediaQuery.of(context).size.width;
    // Tính số lượng chuyên khoa cần hiển thị
    final specialtiesToShow = _showAllSpecialties ? allSpecialties.length : initialSpecialtyCount;

    // Chiều cao nền top
    const double topBackgroundHeight = 175.0;
    // Chiều cao cần kéo nội dung lên để lấn vào nền 150px (ví dụ: kéo lên 140px)
    const double contentTranslateY = 165.0;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        // Đảm bảo status bar trong suốt để màu nền body kéo lên
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: Colors.white,

        // --- AppBar (Thanh tìm kiếm) ---
        appBar: AppBar(
          title: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: primaryColor.withOpacity(0.3), width: 1),
            ),
            child: Row(
              children: [
                const Icon(Icons.search, color: primaryDarkColor),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Tìm kiếm bác sĩ, chuyên khoa, bệnh viện...',
                      hintStyle: TextStyle(fontSize: 16, color: primaryDarkColor.withOpacity(0.7)),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                    style: const TextStyle(fontSize: 16, color: primaryDarkColor),
                  ),
                ),
              ],
            ),
          ),
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          automaticallyImplyLeading: false,
          systemOverlayStyle: SystemUiOverlayStyle.dark,
          actions: [
            Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () {
                    showAppSnackBar(context, 'Thông báo');
                  },
                ),
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        // --- Kết thúc AppBar ---

        // --- BODY (Dùng SingleChildScrollView + Transform để chồng lớp) ---
        body: RefreshIndicator(
          onRefresh: _refresh,
          color: primaryColor,
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              // Padding bottom cho không gian trống dưới cùng
              padding: const EdgeInsets.only(bottom: 80),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // --- 1. Nền top xanh (Cuộn theo body) ---
                  Container(
                    width: double.infinity,
                    height: topBackgroundHeight,
                    decoration: BoxDecoration(
                        color: primaryColor,
                        borderRadius: const BorderRadius.only(
                            bottomLeft: Radius.circular(15),
                            bottomRight: Radius.circular(15)
                        )
                    ),
                  ),

                  // --- 2. Nội dung chính (Kéo toàn bộ khối này lên trên) ---
                  Transform.translate(
                    offset: Offset(0, -contentTranslateY), // Kéo lên 140px
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // --- Header: Greeting + Weather (Giờ nó nằm trong khối Transform) ---
                        SlideTransition(
                          position: _slideAnimation,
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            // Chỉ cần margin ngang, margin dọc bị chi phối bởi Transform
                            margin: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: primaryLightColor,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: primaryColor.withOpacity(0.3)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const CircleAvatar(
                                      radius: 20,
                                      backgroundColor: primaryDarkColor,
                                      child: Icon(Icons.person, size: 20, color: Colors.white),
                                    ),
                                    const SizedBox(width: 12),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Xin chào,',
                                          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                                        ),
                                        Text(
                                          userName,
                                          style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: primaryDarkColor,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                _buildWeatherWidget(),
                              ],
                            ),
                          ),
                        ),
                        // --- Kết thúc Header ---

                        // ✅ THÊM KHOẢNG CÁCH 10PX GIỮA HEADER CARD VÀ BANNER
                        const SizedBox(height: 15),

                        // --- Banner Carousel (Xít sát Header) ---
                        AnimationConfiguration.staggeredList(
                          position: 0,
                          duration: const Duration(milliseconds: 375),
                          child: SlideAnimation(
                            verticalOffset: 50.0,
                            child: FadeInAnimation(
                              child: Container(
                                // Margin top: 0 vì SizedBox đã tạo khoảng cách 10px
                                margin: const EdgeInsets.only(left: 2, right: 2, top: 0, bottom: 8),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 8,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Stack(
                                  children: [
                                    // Carousel
                                    CarouselSlider(
                                      options: CarouselOptions(
                                        height: 140, // Tăng height để chứa dots
                                        autoPlay: true,
                                        autoPlayInterval: const Duration(seconds: 3),
                                        enlargeCenterPage: true,
                                        viewportFraction: 0.95,
                                        onPageChanged: (index, reason) =>
                                            setState(() => _currentBannerIndex = index),
                                      ),
                                      items: bannerData.map((banner) {
                                        return Builder(
                                          builder: (BuildContext context) {
                                            return Container(
                                              width: screenWidth,
                                              margin: const EdgeInsets.symmetric(horizontal: 4),
                                              decoration: BoxDecoration(
                                                borderRadius: BorderRadius.circular(16),
                                                image: DecorationImage(
                                                  image: AssetImage(banner['image']!),
                                                  fit: BoxFit.cover,
                                                ),
                                              ),
                                              child: Container(
                                                decoration: BoxDecoration(
                                                  borderRadius: BorderRadius.circular(16),
                                                  gradient: LinearGradient(
                                                    colors: [
                                                      Colors.black.withOpacity(0.4),
                                                      Colors.transparent,
                                                    ],
                                                    begin: Alignment.bottomCenter,
                                                    end: Alignment.topCenter,
                                                  ),
                                                ),
                                                child: Align(
                                                  alignment: Alignment.bottomLeft,
                                                  child: Padding(
                                                    padding: const EdgeInsets.all(16),
                                                    child: Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                        Text(
                                                          banner['title']!,
                                                          style: const TextStyle(
                                                            color: Colors.white,
                                                            fontSize: 18,
                                                            fontWeight: FontWeight.bold,
                                                          ),
                                                        ),
                                                        Text(
                                                          banner['subtitle'] ?? 'Ưu đãi',
                                                          style: const TextStyle(
                                                            color: Colors.white70,
                                                            fontSize: 14,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            );
                                          },
                                        );
                                      }).toList(),
                                    ),
                                    // Dots overlay ở dưới banner
                                    Positioned(
                                      bottom: 8,
                                      left: 0,
                                      right: 0,
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: bannerData.asMap().entries.map((entry) {
                                          return AnimatedContainer(
                                            duration: const Duration(milliseconds: 300),
                                            margin: const EdgeInsets.symmetric(horizontal: 4),
                                            width: _currentBannerIndex == entry.key ? 12 : 8,
                                            height: _currentBannerIndex == entry.key ? 12 : 8,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: _currentBannerIndex == entry.key
                                                  ? primaryColor
                                                  : Colors.white.withOpacity(0.7),
                                            ),
                                          );
                                        }).toList(),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                        // Xít Banner và Phần đặt lịch lại (giảm từ 5 xuống 0)
                        const SizedBox(height: 0),
                        // --- Đặt lịch ngay + Chatbot (Gộp Container, Nền xanh nhạt, Tối ưu khoảng cách) ---
                        Container(
                          width: double.infinity,
                          // Xít container lại
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            // Nền xanh nhạt
                            color: primaryLightColor,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 10,
                                offset: const Offset(0, 5),
                              ),
                            ],
                            border: Border.all(color: primaryColor.withOpacity(0.3)),
                          ),
                          child: Column(
                            children: [
                              // Nút Đặt lịch ngay
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    _goToBookingScreen(context);
                                  },
                                  icon: const Icon(Icons.calendar_month_outlined, size: 24),
                                  label: const Text(
                                    'Đặt lịch ngay',
                                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: primaryColor,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    elevation: 0,
                                  ),
                                ),
                              ),
                              // Giảm khoảng cách divider
                              const Divider(height: 20, thickness: 1, color: primaryLightColor),

                              // Phần Chatbot
                              InkWell(
                                onTap: () {
                                  _showChatbotDialog(context);
                                },
                                child: Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: primaryColor.withOpacity(0.8),
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                        Icons.question_answer_outlined,
                                        color: Colors.white,
                                        size: 20,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text(
                                            'Bạn đang gặp vấn đề?',
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                              color: primaryDarkColor,
                                            ),
                                          ),
                                          Text(
                                            'Trò chuyện với bác sĩ AI ngay',
                                            style: TextStyle(
                                              fontSize: 14,
                                              color: Colors.grey[600],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: primaryColor),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Xít Container đặt lịch và Chuyên khoa lại
                        const SizedBox(height: 8),

                        // --- Chuyên khoa Grid (Xem tất cả) ---
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'Chuyên khoa phổ biến',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: primaryDarkColor,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 5,
                            childAspectRatio: 0.8,
                            crossAxisSpacing: 8,
                            mainAxisSpacing: 8,
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: specialtiesToShow,
                          itemBuilder: (context, index) {
                            if (index == initialSpecialtyCount - 1 && !_showAllSpecialties) {
                              return InkWell(
                                onTap: () {
                                  setState(() {
                                    _showAllSpecialties = true;
                                  });
                                },
                                child: Column(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: const BoxDecoration(
                                        color: primaryColor,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                        Icons.more_horiz_outlined,
                                        size: 24,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Expanded(
                                      child: Text(
                                        'Xem tất cả',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: primaryColor,
                                          fontWeight: FontWeight.w600,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }

                            final specialty = allSpecialties[index];
                            return Column(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: primaryColor.withOpacity(0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    specialty['icon'],
                                    size: 24,
                                    color: primaryColor,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Expanded(
                                  child: Text(
                                    specialty['title'],
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[700],
                                      fontWeight: FontWeight.w500,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ],
                            );
                          },
                        ),

                        // Nút "Thu gọn" nếu đang show tất cả
                        if (_showAllSpecialties)
                          Padding(
                            // Giảm padding
                            padding: const EdgeInsets.only(top: 8),
                            child: Center(
                              child: TextButton(
                                onPressed: () {
                                  setState(() {
                                    _showAllSpecialties = false;
                                  });
                                },
                                child: Text(
                                  'Thu gọn',
                                  style: TextStyle(color: primaryColor, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                          ),
                        // Xít Chuyên khoa và Bác sĩ lại
                        const SizedBox(height: 8),

                        // --- Bác sĩ nổi bật (UI mới, Xịn hơn) ---
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'Bác sĩ được đề xuất',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: primaryDarkColor,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          height: 180,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            itemCount: famousDoctors.length,
                            itemBuilder: (context, index) {
                              final doctor = famousDoctors[index];
                              final rating = doctor['rating'] as double;
                              return Container(
                                width: 150,
                                margin: const EdgeInsets.symmetric(horizontal: 4),
                                child: Card(
                                  elevation: 6,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: InkWell(
                                    onTap: () {
                                      showAppSnackBar(context, 'Xem chi tiết BS. ${doctor['name']}');
                                    },
                                    borderRadius: BorderRadius.circular(16),
                                    child: Padding(
                                      padding: const EdgeInsets.all(10),
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          ClipOval(
                                            child: Image.asset(
                                              doctor['image'],
                                              height: 60,
                                              width: 60,
                                              fit: BoxFit.cover,
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            doctor['name'],
                                            style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                              color: primaryDarkColor,
                                            ),
                                            textAlign: TextAlign.center,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          Text(
                                            '${doctor['specialty']} - ${doctor['bio']}',
                                            style: TextStyle(
                                              fontSize: 11,
                                              color: Colors.grey[600],
                                            ),
                                            textAlign: TextAlign.center,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 4),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: List.generate(5, (i) {
                                              if (i < rating.floor()) {
                                                return const Icon(Icons.star, color: Colors.amber, size: 14);
                                              } else if (i < rating) {
                                                return const Icon(Icons.star_half, color: Colors.amber, size: 14);
                                              } else {
                                                return Icon(Icons.star_border, color: Colors.grey[300], size: 14);
                                              }
                                            }),
                                          ),
                                          const Spacer(),
                                          SizedBox(
                                            width: double.infinity,
                                            height: 28,
                                            child: ElevatedButton(
                                              onPressed: () {
                                                showAppSnackBar(context, 'Đặt lịch ${doctor['name']}');
                                              },
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: primaryColor,
                                                foregroundColor: Colors.white,
                                                padding: EdgeInsets.zero,
                                                shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(20),
                                                ),
                                              ),
                                              child: const Text('Đặt lịch', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        // Xít Bác sĩ và Tin tức lại
                        const SizedBox(height: 8),

                        // --- Bài viết sức khỏe (Giữ nguyên) ---
                        AnimationConfiguration.staggeredList(
                          position: 3,
                          duration: const Duration(milliseconds: 375),
                          child: SlideAnimation(
                            verticalOffset: 50.0,
                            child: FadeInAnimation(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                    child: Text(
                                      'Bài viết sức khỏe',
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: primaryDarkColor,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  ListView.separated(
                                    shrinkWrap: true,
                                    physics: const NeverScrollableScrollPhysics(),
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                    itemCount: _healthNews.length,
                                    separatorBuilder: (context, index) => const SizedBox(height: 16),
                                    itemBuilder: (context, index) {
                                      final news = _healthNews[index];
                                      return Card(
                                        elevation: 2,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        child: InkWell(
                                          onTap: () {
                                            showAppSnackBar(context, 'Đọc bài: ${news['title']}');
                                          },
                                          borderRadius: BorderRadius.circular(12),
                                          child: Padding(
                                            padding: const EdgeInsets.all(12),
                                            child: Row(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                ClipRRect(
                                                  borderRadius: BorderRadius.circular(8),
                                                  child: Image.asset(
                                                    news['image'],
                                                    height: 80,
                                                    width: 80,
                                                    fit: BoxFit.cover,
                                                    errorBuilder: (context, error, stackTrace) =>
                                                        Container(
                                                          height: 80,
                                                          width: 80,
                                                          color: Colors.grey[300],
                                                          child: const Icon(Icons.image_not_supported, color: Colors.grey),
                                                        ),
                                                  ),
                                                ),
                                                const SizedBox(width: 12),
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      Text(
                                                        news['title'],
                                                        style: const TextStyle(
                                                          fontSize: 16,
                                                          fontWeight: FontWeight.bold,
                                                        ),
                                                        maxLines: 2,
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                      const SizedBox(height: 4),
                                                      Text(
                                                        news['excerpt'],
                                                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                                                        maxLines: 2,
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
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
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}