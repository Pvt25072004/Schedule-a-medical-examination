import 'dart:async';
import 'dart:convert';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:http/http.dart' as http;
import 'package:shimmer/shimmer.dart';
import '../service/news_service.dart';
import '../service/category_service.dart';
import '../service/auth_service.dart';
import '../utils/api_config.dart';
import '../service/doctor_service.dart';
import '../service/banner_service.dart';
import 'booking.dart';
import 'social_feed_screen.dart';
import 'appointments.dart';
import 'profile.dart' as profile_screen;
import 'service_packages_screen.dart';
import 'specialty_doctors.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../subscreens/profile/notification_history.dart';
import 'chatbot.dart';
import 'package:url_launcher/url_launcher.dart';
import '../service/service_package_service.dart';

// --- Cài đặt Màu Chủ đạo ---
const Color primaryColor = Colors.greenAccent; // Xanh lá cây
const Color primaryDarkColor = Color(0xFF1B5E20); // Xanh lá đậm cho chữ
const Color primaryLightColor = Color(0xFFE8F5E9); // Xanh lá rất nhạt cho nền

// Giả định: Mock data




// Hàm lấy icon thời tiết
IconData getWeatherIcon(String iconCode) {
  if (iconCode.contains('01')) return Icons.wb_sunny_rounded;
  if (iconCode.contains('09') || iconCode.contains('10')) return Icons.cloudy_snowing;
  if (iconCode.contains('03') || iconCode.contains('04')) return Icons.cloud;
  return Icons.cloud_outlined;
}



const int initialSpecialtyCount = 5;




class HomeScreen extends StatefulWidget {
  final VoidCallback? onBookingTap;
  final List<dynamic>? initialCategories;

  const HomeScreen({super.key, this.onBookingTap, this.initialCategories});

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
  bool _isLoadingWeather = false;
  List<dynamic> _healthNews = [];
  bool _isLoadingNews = false;
  bool _showAllSpecialties = false;

  // -- Phân trang tin tức --
  int _newsPage = 1;
  bool _isLoadingMoreNews = false;
  bool _hasMoreNews = true;
  final ScrollController _scrollController = ScrollController();
  
  final CategoryService _categoryService = CategoryService();
  final DoctorService _doctorService = DoctorService();

  bool _hasUnreadNotifications = false;

  Future<void> _fetchUnreadNotifications() async {
    final user = AuthService.currentUser;
    if (user == null) return;
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/notifications/user/${user.uid}');
      final response = await http.get(url, headers: {'Authorization': 'Bearer ${AuthService.accessToken}'});
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final unread = data.any((n) => n['is_read'] == false);
        if (mounted) setState(() => _hasUnreadNotifications = unread);
      }
    } catch (_) {}
  }
  List<dynamic> _categories = [];
  List<dynamic> _topDoctors = [];
  List<dynamic> _banners = [];
  bool _isLoadingCategories = false;
  bool _isLoadingTopDoctors = false;
  bool _isLoadingBanners = false;

  final ServicePackageService _packageService = ServicePackageService();
  List<dynamic> _popularPackages = [];
  bool _isLoadingPackages = false;

  @override
  void initState() {
    super.initState();
    _fetchUnreadNotifications();
    // Gán ngay chuyên khoa đã preload từ Splash
    _categories = widget.initialCategories ?? [];
    if (_categories.isNotEmpty) {
      _isLoadingCategories = false;
    } else {
      _isLoadingCategories = true;
    }

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
    
    _scrollController.addListener(_onScroll);

    // --- PARALLEL LOADING (Tăng hiệu năng) ---
    _refresh();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 50) {
      if (!_isLoadingMoreNews && _hasMoreNews) {
        _loadMoreNews();
      }
    }
  }

  Future<void> _refresh() async {
    setState(() {
      _newsPage = 1;
      _hasMoreNews = true;
    });
    // Gọi song song các API để tối ưu tốc độ load
    await Future.wait([
      _fetchUnreadNotifications(),
      _loadWeather(), 
      _loadNews(), 
      _loadCategories(),
      _loadTopDoctors(),
      _loadBanners(),
      _loadPopularPackages(),
    ]);
  }

  Future<void> _loadPopularPackages() async {
    if (mounted) setState(() => _isLoadingPackages = true);
    try {
      final pkgs = await _packageService.fetchPopularPackages();
      if (mounted) {
        setState(() {
          _popularPackages = pkgs.take(6).toList();
          _isLoadingPackages = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingPackages = false);
    }
  }

  Future<void> _loadBanners() async {
    if (mounted) setState(() => _isLoadingBanners = true);
    try {
      final banners = await BannerService.fetchBanners();
      if (mounted) {
        setState(() {
          _banners = banners;
          _isLoadingBanners = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingBanners = false);
    }
  }

  Future<void> _loadCategories() async {
    if (mounted) setState(() => _isLoadingCategories = true);
    try {
      final cats = await _categoryService.fetchCategories();
      if (mounted) {
        setState(() {
          _categories = cats;
          _isLoadingCategories = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingCategories = false);
    }
  }

  Future<void> _loadTopDoctors() async {
    if (mounted) setState(() => _isLoadingTopDoctors = true);
    try {
      final docs = await _doctorService.fetchTopRatedDoctors();
      if (mounted) {
        setState(() {
          _topDoctors = docs;
          _isLoadingTopDoctors = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingTopDoctors = false);
    }
  }

  Future<void> _loadNews() async {
    if (mounted) setState(() => _isLoadingNews = true);
    try {
      final news = await NewsService.fetchNews(page: 1, limit: 10);
      if (mounted) {
        setState(() {
          _healthNews = news;
          _isLoadingNews = false;
          if (news.length < 10) _hasMoreNews = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingNews = false);
    }
  }

  Future<void> _loadMoreNews() async {
    if (mounted) setState(() => _isLoadingMoreNews = true);
    try {
      _newsPage++;
      final news = await NewsService.fetchNews(page: _newsPage, limit: 10);
      if (mounted) {
        setState(() {
          if (news.isEmpty) {
            _hasMoreNews = false;
          } else {
            _healthNews.addAll(news);
            if (news.length < 10) _hasMoreNews = false;
          }
          _isLoadingMoreNews = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingMoreNews = false);
    }
  }

  /// --- HONEST UX WEATHER (Non-blocking) ---
  Future<void> _loadWeather() async {
    if (mounted) setState(() => _isLoadingWeather = true);
    try {
      // 1. Kiểm tra quyền định vị
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever || permission == LocationPermission.denied) {
        throw Exception('Quyền định vị bị từ chối');
      }

      // 2. Lấy vị trí hiện tại (Timeout 5s để không block UI quá lâu)
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.low,
      ).timeout(const Duration(seconds: 5));

      // 3. Lấy tên địa danh (Reverse Geocoding)
      List<Placemark> placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
      String locationName = placemarks.isNotEmpty 
          ? (placemarks.first.administrativeArea ?? placemarks.first.locality ?? 'Vị trí lạ') 
          : 'Vị trí lạ';

      // 4. Gọi API thời tiết miễn phí (Open-Meteo)
      final response = await http.get(Uri.parse(
        'https://api.open-meteo.com/v1/forecast?latitude=${position.latitude}&longitude=${position.longitude}&current_weather=true'
      ));
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final temp = data['current_weather']['temperature'];
        if (mounted) {
          setState(() {
            _weatherData = {
              'name': locationName,
              'main': {'temp': temp},
              'weather': [{'icon': '01d'}]
            };
            _isLoadingWeather = false;
          });
        }
      }
    } catch (e) {
      debugPrint('🔥 Weather Fallback (Honest UX): $e');
      if (mounted) {
        setState(() {
          _weatherData = {
            'name': 'Chưa có vị trí',
            'main': {'temp': '--'},
            'weather': [{'icon': '01d'}]
          };
          _isLoadingWeather = false;
        });
      }
    }
  }



  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  // --- Widget thời tiết ---
  Widget _buildWeatherWidget() {
    if (_isLoadingWeather) {
      return const SizedBox(
        width: 110,
        height: 28,
        child: Center(
          child: LinearProgressIndicator(
            backgroundColor: Color(0xFFE8F5E9),
            valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
            minHeight: 2,
          ),
        ),
      );
    }

    final dynamic tempVal = _weatherData?['main']['temp'];
    final String temp = tempVal is num ? tempVal.toStringAsFixed(1) : (tempVal?.toString() ?? '--');
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

  Widget _buildPackageCard(dynamic pkg) {
    return Container(
      width: 250,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6, offset: const Offset(0, 3))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Container(
              height: 70,
              width: double.infinity,
              color: primaryLightColor,
              child: const Icon(Icons.medical_services_outlined, size: 36, color: primaryColor),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  pkg['name'] ?? 'Gói Khám',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: primaryDarkColor),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  pkg['description'] ?? '',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${pkg['fixed_price'] ?? pkg['price'] ?? 0}đ',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange),
                    ),
                    InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => BookingScreen(
                              initialPackageData: pkg,
                            ),
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: primaryColor,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text('Đặt', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
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
                  Expanded(
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

  IconData _getCategoryIcon(String catName) {
    final name = catName.toLowerCase();
    if (name.contains('tim mạch')) return Icons.favorite_outline;
    if (name.contains('nha khoa')) return Icons.density_small;
    if (name.contains('da liễu')) return Icons.spa_outlined;
    if (name.contains('nhi')) return Icons.child_care;
    if (name.contains('sản') || name.contains('phụ khoa')) return Icons.woman_outlined;
    if (name.contains('tai mũi họng')) return Icons.earbuds;
    if (name.contains('khớp') || name.contains('xương')) return Icons.accessible_outlined;
    if (name.contains('mắt') || name.contains('nhãn khoa')) return Icons.visibility_outlined;
    if (name.contains('ung bướu')) return Icons.biotech_outlined;
    if (name.contains('nội khoa')) return Icons.heart_broken_outlined;
    return Icons.medical_services_outlined;
  }

  @override
  Widget build(BuildContext context) {
    final String userName = AuthService.currentUser?.displayName ?? 'Người dùng';
    final screenWidth = MediaQuery.of(context).size.width;
    // Tính số lượng chuyên khoa cần hiển thị từ Database
    final specialtiesToShow = _isLoadingCategories 
        ? 0 
        : (_showAllSpecialties 
            ? _categories.length 
            : (_categories.length > 5 ? 5 : _categories.length));

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
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: Image.asset(
                    'assets/images/LOGOmain.jpg',
                    width: 28,
                    height: 28,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'STL Clinic',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 22,
                ),
              ),
            ],
          ),
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          automaticallyImplyLeading: false,
          systemOverlayStyle: SystemUiOverlayStyle.dark,
          actions: [
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {
                showAppSnackBar(context, 'Tìm kiếm');
              },
            ),
            Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const NotificationHistoryScreen(),
                      ),
                    ).then((_) => _fetchUnreadNotifications());
                  },
                ),
                if (_hasUnreadNotifications)
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
            Padding(
              padding: const EdgeInsets.only(right: 12.0, left: 4.0),
              child: Center(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const profile_screen.ProfileScreen(),
                      ),
                    );
                  },
                  child: CircleAvatar(
                    radius: 16,
                    backgroundImage: AuthService.currentUser?.photoURL != null
                        ? NetworkImage(AuthService.currentUser!.photoURL!)
                        : const AssetImage('assets/images/default_avatar.png') as ImageProvider,
                    backgroundColor: Colors.white,
                  ),
                ),
              ),
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
              controller: _scrollController,
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
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'STL Xin chào,',
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
                        if (_isLoadingBanners)
                           const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Center(child: CircularProgressIndicator())),
                        if (!_isLoadingBanners && _banners.isNotEmpty)
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
                                        autoPlay: _banners.length > 1, // Chống khựng
                                        autoPlayInterval: const Duration(seconds: 3),
                                        enlargeCenterPage: true,
                                        enableInfiniteScroll: _banners.length > 1, // Chống khựng
                                        viewportFraction: 0.95,
                                        onPageChanged: (index, reason) =>
                                            setState(() => _currentBannerIndex = index),
                                      ),
                                      items: _banners.map((banner) {
                                        return Builder(
                                          builder: (BuildContext context) {
                                            final String imgUrl = (banner['image_url'] ?? '').toString();
                                            return Container(
                                              width: screenWidth,
                                              margin: const EdgeInsets.symmetric(horizontal: 4),
                                              decoration: BoxDecoration(
                                                borderRadius: BorderRadius.circular(16),
                                                color: Colors.grey[200],
                                              ),
                                              clipBehavior: Clip.antiAlias,
                                              child: Stack(
                                                fit: StackFit.expand,
                                                children: [
                                                  imgUrl.isNotEmpty
                                                      ? Image.network(
                                                          imgUrl,
                                                          fit: BoxFit.cover,
                                                          errorBuilder: (c, e, s) => const Icon(Icons.image_not_supported, color: Colors.grey),
                                                        )
                                                      : const Icon(Icons.image, color: Colors.grey),
                                                  Container(
                                                    decoration: BoxDecoration(
                                                      gradient: LinearGradient(
                                                        colors: [
                                                          Colors.black.withOpacity(0.6),
                                                          Colors.transparent,
                                                        ],
                                                        begin: Alignment.bottomCenter,
                                                        end: Alignment.topCenter,
                                                      ),
                                                    ),
                                                  ),
                                                  Align(
                                                    alignment: Alignment.bottomLeft,
                                                    child: Padding(
                                                      padding: const EdgeInsets.all(16),
                                                      child: Column(
                                                        mainAxisSize: MainAxisSize.min,
                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                        children: [
                                                          Text(
                                                            (banner['title'] ?? '').toString(),
                                                            style: const TextStyle(
                                                              color: Colors.white,
                                                              fontSize: 18,
                                                              fontWeight: FontWeight.bold,
                                                            ),
                                                            maxLines: 1,
                                                            overflow: TextOverflow.ellipsis,
                                                          ),
                                                          if (banner['description'] != null)
                                                          Text(
                                                            banner['description'].toString(),
                                                            style: const TextStyle(
                                                              color: Colors.white70,
                                                              fontSize: 14,
                                                            ),
                                                            maxLines: 1,
                                                            overflow: TextOverflow.ellipsis,
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            );
                                          },
                                        );
                                      }).toList(),
                                    ),
                                    // Dots overlay ở dưới banner
                                    if (_banners.length > 1)
                                    Positioned(
                                      bottom: 8,
                                      left: 0,
                                      right: 0,
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: _banners.asMap().entries.map((entry) {
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
                        // --- Gói Khám Sức Khỏe & Chatbot ---
                        Container(
                          width: double.infinity,
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: primaryLightColor,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: primaryColor.withOpacity(0.3)),
                          ),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      onPressed: () => _goToBookingScreen(context),
                                      icon: const Icon(Icons.calendar_month, size: 20),
                                      label: const Text('Đặt Bác Sĩ', style: TextStyle(fontWeight: FontWeight.bold)),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: primaryColor,
                                        foregroundColor: Colors.white,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        elevation: 0,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(builder: (context) => const ServicePackagesScreen()),
                                        );
                                      },
                                      icon: const Icon(Icons.medical_information, size: 20),
                                      label: const Text('Gói Khám', style: TextStyle(fontWeight: FontWeight.bold)),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.orangeAccent,
                                        foregroundColor: Colors.white,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        elevation: 0,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 20, thickness: 1, color: primaryLightColor),
                              InkWell(
                                onTap: () => _showChatbotDialog(context),
                                child: Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(color: primaryColor.withOpacity(0.8), shape: BoxShape.circle),
                                      child: const Icon(Icons.question_answer_outlined, color: Colors.white, size: 20),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text('Bạn đang gặp vấn đề?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: primaryDarkColor)),
                                          Text('Trò chuyện với bác sĩ AI ngay', style: TextStyle(fontSize: 14, color: Colors.grey[600])),
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
                        _isLoadingCategories
                            ? const Padding(
                                padding: EdgeInsets.all(20.0),
                                child: Center(
                                  child: SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(strokeWidth: 2.5, color: primaryDarkColor),
                                  ),
                                ),
                              )
                            : GridView.builder(
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
                                  if (index == 4 && !_showAllSpecialties && _categories.length > 5) {
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

                                  final specialty = _categories[index];
                                  final String catName = (specialty['name'] ?? 'Chuyên khoa').toString();
                                  
                                  return InkWell(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => SpecialtyDoctorsScreen(
                                            category: specialty,
                                          ),
                                        ),
                                      );
                                    },
                                    child: Column(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color: primaryColor.withOpacity(0.1),
                                            shape: BoxShape.circle,
                                          ),
                                          child: Icon(
                                            _getCategoryIcon(catName),
                                            size: 24,
                                            color: primaryColor,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Expanded(
                                          child: Text(
                                            catName,
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey[700],
                                              fontWeight: FontWeight.w500,
                                            ),
                                            textAlign: TextAlign.center,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
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
                        if (_isLoadingTopDoctors || _topDoctors.isNotEmpty)
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
                        if (_isLoadingTopDoctors)
                             const SizedBox(
                                height: 185,
                                child: Center(
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 40),
                                    child: LinearProgressIndicator(
                                      backgroundColor: Color(0xFFE8F5E9),
                                      valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                                      minHeight: 2,
                                    ),
                                  ),
                                ),
                              )
                        else if (_topDoctors.isNotEmpty)
                             SizedBox(
                                height: 185,
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  itemCount: _topDoctors.length,
                                  itemBuilder: (context, index) {
                                    final doctor = _topDoctors[index];
                                    
                                    // Parse rating an toàn
                                    double rating = 5.0;
                                    if (doctor['rating'] != null) {
                                      if (doctor['rating'] is num) {
                                        rating = (doctor['rating'] as num).toDouble();
                                      } else if (doctor['rating'] is String) {
                                        rating = double.tryParse(doctor['rating']) ?? 5.0;
                                      }
                                    }
                                    
                                    final String hospitalName = (doctor['hospitals'] != null && (doctor['hospitals'] as List).isNotEmpty)
                                        ? (doctor['hospitals'][0]['name'] ?? 'Phòng khám riêng').toString()
                                        : 'Phòng khám riêng';
                                        
                                    final String doctorName = (doctor['user']?['full_name'] ?? doctor['name'] ?? 'Bác sĩ').toString();
                                    final String categoryName = (doctor['category']?['name'] ?? 'Chuyên gia').toString();
                                    
                                    final String avatarUrl = (doctor['avatar_url'] ?? doctor['user']?['avatar'] ?? '').toString();

                                    return Container(
                                      width: 160,
                                      margin: const EdgeInsets.symmetric(horizontal: 4),
                                      child: Card(
                                        elevation: 4,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(16),
                                        ),
                                        child: InkWell(
                                          onTap: () {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) => BookingScreen(initialDoctorData: doctor),
                                              ),
                                            );
                                          },
                                          borderRadius: BorderRadius.circular(16),
                                          child: Padding(
                                            padding: const EdgeInsets.all(10),
                                            child: Column(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [
                                                ClipOval(
                                                  child: Container(
                                                    color: primaryColor.withOpacity(0.1),
                                                    child: avatarUrl.isNotEmpty
                                                      ? Image.network(
                                                          avatarUrl,
                                                          height: 55,
                                                          width: 55,
                                                          fit: BoxFit.cover,
                                                          errorBuilder: (c, e, s) => const Icon(Icons.person, size: 35, color: primaryColor),
                                                        )
                                                      : const Icon(Icons.person, size: 35, color: primaryColor),
                                                  ),
                                                ),
                                                const SizedBox(height: 8),
                                                Text(
                                                  doctorName,
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
                                                  categoryName,
                                                  style: TextStyle(
                                                    fontSize: 11,
                                                    color: primaryColor,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                  textAlign: TextAlign.center,
                                                ),
                                                const SizedBox(height: 2),
                                                Text(
                                                  '🏥 $hospitalName',
                                                  style: TextStyle(
                                                    fontSize: 10,
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
                                                      return const Icon(Icons.star, color: Colors.amber, size: 12);
                                                    } else {
                                                      return Icon(Icons.star_border, color: Colors.grey[300], size: 12);
                                                    }
                                                  }),
                                                ),
                                                const Spacer(),
                                                SizedBox(
                                                  width: double.infinity,
                                                  height: 26,
                                                  child: ElevatedButton(
                                                    onPressed: () {
                                                      Navigator.push(
                                                        context,
                                                        MaterialPageRoute(
                                                          builder: (context) => BookingScreen(initialDoctorData: doctor),
                                                        ),
                                                      );
                                                    },
                                                    style: ElevatedButton.styleFrom(
                                                      backgroundColor: primaryColor,
                                                      foregroundColor: Colors.white,
                                                      padding: EdgeInsets.zero,
                                                      elevation: 0,
                                                      shape: RoundedRectangleBorder(
                                                        borderRadius: BorderRadius.circular(20),
                                                      ),
                                                    ),
                                                    child: const Text('Đặt lịch ngay', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
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
                        // --- Gói Dịch Vụ Nổi Bật ---
                        if (_isLoadingPackages || _popularPackages.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Gói dịch vụ nổi bật',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: primaryDarkColor,
                                  ),
                                ),
                                TextButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (context) => const ServicePackagesScreen()),
                                    );
                                  },
                                  child: const Text('Xem tất cả', style: TextStyle(color: primaryColor, fontWeight: FontWeight.bold)),
                                )
                              ],
                            ),
                          ),
                        if (_isLoadingPackages)
                             const SizedBox(
                                height: 185,
                                child: Center(
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 40),
                                    child: LinearProgressIndicator(
                                      backgroundColor: Color(0xFFE8F5E9),
                                      valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                                      minHeight: 2,
                                    ),
                                  ),
                                ),
                              )
                        else if (_popularPackages.isNotEmpty)
                          SizedBox(
                            height: 200,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              itemCount: _popularPackages.length,
                              itemBuilder: (context, index) {
                                final package = _popularPackages[index];
                                return _buildPackageCard(package);
                              },
                            ),
                          ),
                        const SizedBox(height: 16),

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
                                          onTap: () async {
                                            final String link = (news['source'] ?? news['link'] ?? '').toString();
                                            if (link.isNotEmpty) {
                                              final Uri url = Uri.parse(link);
                                              if (await canLaunchUrl(url)) {
                                                await launchUrl(url, mode: LaunchMode.externalApplication);
                                              } else {
                                                showAppSnackBar(context, 'Không thể mở liên kết này.');
                                              }
                                            } else {
                                              showAppSnackBar(context, 'Đọc bài: ${(news['title'] ?? 'Bài viết').toString()}');
                                            }
                                          },
                                          borderRadius: BorderRadius.circular(12),
                                          child: Padding(
                                            padding: const EdgeInsets.all(12),
                                            child: Row(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                ClipRRect(
                                                  borderRadius: BorderRadius.circular(8),
                                                  child: Builder(
                                                    builder: (context) {
                                                      final String imgUrl = (news['image_url'] ?? news['image'] ?? '').toString();
                                                      if (imgUrl.startsWith('http')) {
                                                        return Image.network(
                                                          imgUrl,
                                                          height: 80,
                                                          width: 80,
                                                          fit: BoxFit.cover,
                                                          errorBuilder: (c, e, s) => Container(
                                                            height: 80, width: 80, color: Colors.grey[300],
                                                            child: const Icon(Icons.image_not_supported, color: Colors.grey),
                                                          ),
                                                        );
                                                      } else if (imgUrl.isNotEmpty) {
                                                        return Image.asset(
                                                          imgUrl,
                                                          height: 80,
                                                          width: 80,
                                                          fit: BoxFit.cover,
                                                          errorBuilder: (c, e, s) => Container(
                                                            height: 80, width: 80, color: Colors.grey[300],
                                                            child: const Icon(Icons.image_not_supported, color: Colors.grey),
                                                          ),
                                                        );
                                                      }
                                                      return Container(
                                                        height: 80, width: 80, color: Colors.grey[300],
                                                        child: const Icon(Icons.image_not_supported, color: Colors.grey),
                                                      );
                                                    },
                                                  ),
                                                ),
                                                const SizedBox(width: 12),
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      Text(
                                                        (news['title'] ?? 'Bài viết').toString(),
                                                        style: const TextStyle(
                                                          fontSize: 16,
                                                          fontWeight: FontWeight.bold,
                                                        ),
                                                        maxLines: 2,
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                      const SizedBox(height: 4),
                                                      Text(
                                                        (news['summary'] ?? news['excerpt'] ?? '').toString(),
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
                                  if (_isLoadingMoreNews)
                                    const Padding(
                                      padding: EdgeInsets.symmetric(vertical: 20),
                                      child: Center(
                                        child: CircularProgressIndicator(
                                          valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                                        ),
                                      ),
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