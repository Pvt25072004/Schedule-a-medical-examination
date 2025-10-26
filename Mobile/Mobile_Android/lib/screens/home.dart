import 'dart:convert';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart'; // Thêm package: shared_preferences: ^2.2.2

// Giả sử bạn có UserProvider hoặc tương tự để lấy tên user
// Ở đây mock tên user
String getUserName() => 'Nguyễn Văn A'; // Thay bằng logic thực tế

// Mock banner data (giữ nguyên)
final List<Map<String, String>> bannerData = [
  {'image': 'assets/banners/banner1.jpg', 'title': 'Ưu đãi khám sức khỏe 50%'},
  {'image': 'assets/banners/banner2.jpg', 'title': 'Vaccine mới nhất'},
  {
    'image': 'assets/banners/banner3.jpg',
    'title': 'Tư vấn trực tuyến miễn phí'
  },
];

// Mock weather data - Thực tế sẽ fetch từ API
Future<Map<String, dynamic>> fetchWeather() async {
  // Thay API_KEY bằng key thực từ OpenWeatherMap
  const apiKey = 'YOUR_OPENWEATHER_API_KEY';
  const city = 'Hanoi'; // Hoặc lấy từ location
  final url = Uri.parse(
      'https://api.openweathermap.org/data/2.5/weather?q=$city&appid=$apiKey&units=metric');
  final response = await http.get(url);
  if (response.statusCode == 200) {
    return json.decode(response.body);
  }
  // Mock data nếu lỗi
  return {
    'name': 'Hà Nội',
    'main': {'temp': 28.0},
    'weather': [
      {'description': 'Trời nắng', 'icon': '01d'}
    ],
  };
}

// Icon data cho các phần thông tin y tế (giữ nguyên)
final List<Map<String, dynamic>> healthInfo = [
  {
    'title': 'Dinh dưỡng',
    'description': 'Lời khuyên ăn uống lành mạnh',
    'icon': Icons.restaurant,
    'color': Colors.orange
  },
  {
    'title': 'Tập luyện',
    'description': 'Bài tập hàng ngày cho sức khỏe',
    'icon': Icons.fitness_center,
    'color': Colors.blue
  },
  {
    'title': 'Phòng ngừa',
    'description': 'Cách tránh bệnh truyền nhiễm',
    'icon': Icons.security,
    'color': Colors.green
  },
  {
    'title': 'Tâm lý',
    'description': 'Chăm sóc sức khỏe tinh thần',
    'icon': Icons.psychology,
    'color': Colors.purple
  },
  {
    'title': 'Khám định kỳ',
    'description': 'Lịch khám sức khỏe định kỳ',
    'icon': Icons.calendar_today,
    'color': Colors.red
  },
  {
    'title': 'Thuốc men',
    'description': 'Hướng dẫn sử dụng thuốc an toàn',
    'icon': Icons.medication,
    'color': Colors.teal
  },
];

// Mock data cho bác sĩ nổi tiếng (giữ nguyên)
final List<Map<String, dynamic>> famousDoctors = [
  {
    'name': 'BS. Nguyễn Thị Lan',
    'specialty': 'Tim mạch',
    'rating': 4.9,
    'image': 'assets/doctors/doctor1.jpg',
    'bio': 'Chuyên gia hàng đầu về bệnh tim mạch với 20 năm kinh nghiệm.',
  },
  {
    'name': 'BS. Trần Văn Minh',
    'specialty': 'Nhi khoa',
    'rating': 4.8,
    'image': 'assets/doctors/doctor2.jpg',
    'bio': 'Bác sĩ nhi khoa tận tâm, yêu trẻ em.',
  },
  {
    'name': 'BS. Lê Thị Hoa',
    'specialty': 'Da liễu',
    'rating': 4.7,
    'image': 'assets/doctors/doctor3.jpg',
    'bio': 'Chuyên trị mụn và chăm sóc da chuyên sâu.',
  },
];

// Cache key cho news
const String _newsCacheKey = 'health_news_cache';
const String _newsTimestampKey = 'health_news_timestamp';
const int _cacheExpirationHours = 24; // Reset sau 24h

// Fetch news từ NewsAPI (chỉ 4 bài, cache 24h)
Future<List<Map<String, dynamic>>> fetchHealthNews() async {
  final prefs = await SharedPreferences.getInstance();
  final cachedNewsJson = prefs.getString(_newsCacheKey);
  final cachedTimestamp = prefs.getInt(_newsTimestampKey);

  // Check cache
  if (cachedNewsJson != null && cachedTimestamp != null) {
    final now = DateTime.now().millisecondsSinceEpoch;
    if (now - cachedTimestamp < _cacheExpirationHours * 60 * 60 * 1000) {
      return List<Map<String, dynamic>>.from(jsonDecode(cachedNewsJson));
    }
  }

  // Fetch mới nếu cache hết hạn
  const apiKey = 'YOUR_NEWSAPI_KEY'; // Đăng ký miễn phí tại newsapi.org
  final url = Uri.parse(
      'https://newsapi.org/v2/everything?q=health+OR+medical&language=vi&sortBy=publishedAt&pageSize=4&apiKey=$apiKey');
  try {
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final articles = data['articles'] as List;
      final newsList = articles
          .map((article) => {
                'title': article['title'] ?? 'No title',
                'excerpt': article['description'] ?? 'No description',
                'image': article['urlToImage'] ??
                    'assets/news/default.jpg', // Fallback image
                'date': DateTime.parse(article['publishedAt'])
                    .toString()
                    .substring(0, 10), // YYYY-MM-DD
                'readMore': 'Đọc thêm',
                'url': article['url'], // Để navigate full article
              })
          .toList();

      // Cache
      await prefs.setString(_newsCacheKey, jsonEncode(newsList));
      await prefs.setInt(
          _newsTimestampKey, DateTime.now().millisecondsSinceEpoch);

      return newsList;
    }
  } catch (e) {
    print('Error fetching news: $e');
  }

  // Fallback mock nếu lỗi
  return [
    {
      'title': '10 mẹo phòng ngừa cảm cúm mùa đông',
      'excerpt':
          'Với thời tiết thay đổi, hãy áp dụng ngay những mẹo đơn giản này để bảo vệ sức khỏe.',
      'image': 'assets/news/news1.jpg',
      'date': '26/10/2025',
      'readMore': 'Đọc thêm',
    },
    // ... thêm 3 mock nữa nếu cần
  ];
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  late AnimationController _slideController;
  late Animation<Offset> _slideAnimation;
  int _currentBannerIndex = 0;
  int _currentDoctorIndex = 0;
  Map<String, dynamic>? _weatherData;
  bool _isLoadingWeather = true;
  List<Map<String, dynamic>> _healthNews = [];
  bool _isLoadingNews = true;

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

  @override
  Widget build(BuildContext context) {
    final userName = getUserName();
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: const Color(0xFFF0F8F0), // Nền xanh nhạt y tế
      appBar: AppBar(
        title: const Text('Trang chủ',
            style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.greenAccent,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle),
            onPressed: () {
              // Navigate to profile
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Chuyển đến hồ sơ cá nhân')),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              children: [
                // Header: Greeting + Weather (giữ nguyên)
                SlideTransition(
                  position: _slideAnimation,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.greenAccent, Colors.green.shade100],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Xin chào,',
                                style: TextStyle(
                                    fontSize: 16, color: Colors.white70),
                              ),
                              Text(
                                userName,
                                style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                        // Weather Widget (giữ nguyên)
                        Card(
                          elevation: 4,
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              children: [
                                _isLoadingWeather
                                    ? const CircularProgressIndicator()
                                    : Column(
                                        children: [
                                          Text(
                                            '${_weatherData?['main']['temp']?.toStringAsFixed(1) ?? 'N/A'}°C',
                                            style: const TextStyle(
                                                fontSize: 20,
                                                fontWeight: FontWeight.bold),
                                          ),
                                          Text(
                                            _weatherData?['weather'][0]
                                                        ['description']
                                                    ?.toString()
                                                    .toUpperCase() ??
                                                'N/A',
                                            style:
                                                const TextStyle(fontSize: 12),
                                          ),
                                          Image.network(
                                            'https://openweathermap.org/img/wn/${_weatherData?['weather'][0]['icon'] ?? '01d'}@2x.png',
                                            width: 40,
                                            errorBuilder:
                                                (context, error, stackTrace) =>
                                                    const Icon(Icons.cloud,
                                                        size: 40),
                                          ),
                                        ],
                                      ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Banner Carousel (giữ nguyên)
                AnimationConfiguration.staggeredList(
                  position: 0,
                  duration: const Duration(milliseconds: 375),
                  child: SlideAnimation(
                    verticalOffset: 50.0,
                    child: FadeInAnimation(
                      child: Column(
                        children: [
                          CarouselSlider(
                            options: CarouselOptions(
                              height: 180,
                              autoPlay: true,
                              autoPlayInterval: const Duration(seconds: 3),
                              enlargeCenterPage: true,
                              onPageChanged: (index, reason) =>
                                  setState(() => _currentBannerIndex = index),
                              viewportFraction: 0.9,
                            ),
                            items: bannerData.map((banner) {
                              return Builder(
                                builder: (BuildContext context) {
                                  return Container(
                                    width: screenWidth,
                                    margin: const EdgeInsets.symmetric(
                                        horizontal: 8),
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(16),
                                      image: DecorationImage(
                                        image: AssetImage(banner[
                                            'image']!), // Thay bằng NetworkImage nếu từ URL
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(16),
                                        gradient: LinearGradient(
                                          colors: [
                                            Colors.black.withOpacity(0.4),
                                            Colors.transparent
                                          ],
                                          begin: Alignment.bottomCenter,
                                          end: Alignment.topCenter,
                                        ),
                                      ),
                                      child: Align(
                                        alignment: Alignment.bottomLeft,
                                        child: Padding(
                                          padding: const EdgeInsets.all(16),
                                          child: Text(
                                            banner['title']!,
                                            style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 18,
                                                fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              );
                            }).toList(),
                          ),
                          // Banner indicators (giữ nguyên)
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: bannerData.asMap().entries.map((entry) {
                              return Container(
                                width: 8,
                                height: 8,
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 4),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _currentBannerIndex == entry.key
                                      ? Colors.greenAccent
                                      : Colors.grey,
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Health Info Grid (giữ nguyên)
                AnimationConfiguration.staggeredGrid(
                  position: 1,
                  duration: const Duration(milliseconds: 375),
                  columnCount: 2,
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 1.2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: healthInfo.length,
                    itemBuilder: (context, index) {
                      final info = healthInfo[index];
                      return SlideAnimation(
                        verticalOffset: 50.0,
                        child: FadeInAnimation(
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 500),
                            curve: Curves.easeInOut,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.green.withOpacity(0.1),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                              gradient: LinearGradient(
                                colors: [
                                  info['color'],
                                  info['color'].withOpacity(0.7)
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(info['icon'],
                                      size: 40, color: Colors.white),
                                  const SizedBox(height: 8),
                                  Text(
                                    info['title'],
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    info['description'],
                                    style: const TextStyle(
                                        color: Colors.white70, fontSize: 12),
                                    textAlign: TextAlign.center,
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
                const SizedBox(height: 24),
                // Famous Doctors Section (giữ nguyên)
                AnimationConfiguration.staggeredList(
                  position: 2,
                  duration: const Duration(milliseconds: 375),
                  child: SlideAnimation(
                    verticalOffset: 50.0,
                    child: FadeInAnimation(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: const Text(
                              'Bác sĩ nổi tiếng',
                              style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green),
                            ),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            height: 200,
                            child: CarouselSlider(
                              options: CarouselOptions(
                                height: 200,
                                autoPlay: true,
                                autoPlayInterval: const Duration(seconds: 4),
                                enlargeCenterPage: true,
                                viewportFraction: 0.85,
                                onPageChanged: (index, reason) =>
                                    setState(() => _currentDoctorIndex = index),
                              ),
                              items: famousDoctors.map((doctor) {
                                return Builder(
                                  builder: (BuildContext context) {
                                    return Container(
                                      margin: const EdgeInsets.symmetric(
                                          horizontal: 8),
                                      child: Card(
                                        elevation: 8,
                                        shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(16)),
                                        child: Padding(
                                          padding: const EdgeInsets.all(12),
                                          child: Column(
                                            children: [
                                              ClipRRect(
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                                child: Image.asset(
                                                  doctor['image'],
                                                  height: 100,
                                                  width: double.infinity,
                                                  fit: BoxFit.cover,
                                                ),
                                              ),
                                              const SizedBox(height: 8),
                                              Text(
                                                doctor['name'],
                                                style: const TextStyle(
                                                    fontSize: 16,
                                                    fontWeight:
                                                        FontWeight.bold),
                                                textAlign: TextAlign.center,
                                              ),
                                              Text(
                                                doctor['specialty'],
                                                style: TextStyle(
                                                    fontSize: 14,
                                                    color: Colors.grey[600]),
                                                textAlign: TextAlign.center,
                                              ),
                                              Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment.center,
                                                children: List.generate(
                                                    5,
                                                    (i) => Icon(
                                                          Icons.star,
                                                          color: i <
                                                                  (doctor['rating'] ??
                                                                      0)
                                                              ? Colors.amber
                                                              : Colors.grey,
                                                          size: 16,
                                                        )),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                doctor['bio'],
                                                style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.grey[500]),
                                                textAlign: TextAlign.center,
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                );
                              }).toList(),
                            ),
                          ),
                          // Doctor indicators (giữ nguyên)
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children:
                                famousDoctors.asMap().entries.map((entry) {
                              return Container(
                                width: 8,
                                height: 8,
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 4),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _currentDoctorIndex == entry.key
                                      ? Colors.greenAccent
                                      : Colors.grey,
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                ),
                // Health News Section (cập nhật với real data)
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
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Tin tức y tế',
                                  style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.green),
                                ),
                                TextButton(
                                  onPressed: () {
                                    // Navigate to full news
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                          content: Text('Xem tất cả tin tức')),
                                    );
                                  },
                                  child: const Text('Xem tất cả'),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          _isLoadingNews
                              ? const Padding(
                                  padding: EdgeInsets.all(16),
                                  child: Center(
                                      child: CircularProgressIndicator()),
                                )
                              : _healthNews.isEmpty
                                  ? const Padding(
                                      padding: EdgeInsets.all(16),
                                      child: Text('Không có tin tức mới'),
                                    )
                                  : ListView.separated(
                                      shrinkWrap: true,
                                      physics:
                                          const NeverScrollableScrollPhysics(),
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 16),
                                      itemCount: _healthNews.length,
                                      separatorBuilder: (context, index) =>
                                          const SizedBox(height: 12),
                                      itemBuilder: (context, index) {
                                        final news = _healthNews[index];
                                        return Card(
                                          elevation: 4,
                                          shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12)),
                                          child: InkWell(
                                            onTap: () {
                                              // Navigate to full article (sử dụng news['url'])
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(
                                                SnackBar(
                                                    content: Text(
                                                        'Đọc bài: ${news['title']}')),
                                              );
                                            },
                                            borderRadius:
                                                BorderRadius.circular(12),
                                            child: Padding(
                                              padding: const EdgeInsets.all(12),
                                              child: Row(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  ClipRRect(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            8),
                                                    child: Image.network(
                                                      news['image'],
                                                      height: 80,
                                                      width: 80,
                                                      fit: BoxFit.cover,
                                                      errorBuilder: (context,
                                                              error,
                                                              stackTrace) =>
                                                          Container(
                                                        height: 80,
                                                        width: 80,
                                                        color: Colors.grey[300],
                                                        child: const Icon(Icons
                                                            .image_not_supported),
                                                      ),
                                                    ),
                                                  ),
                                                  const SizedBox(width: 12),
                                                  Expanded(
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        Text(
                                                          news['title'],
                                                          style: const TextStyle(
                                                              fontSize: 16,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold),
                                                          maxLines: 2,
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                        ),
                                                        const SizedBox(
                                                            height: 4),
                                                        Text(
                                                          news['excerpt'],
                                                          style: TextStyle(
                                                              fontSize: 14,
                                                              color: Colors
                                                                  .grey[600]),
                                                          maxLines: 2,
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                        ),
                                                        const SizedBox(
                                                            height: 8),
                                                        Row(
                                                          mainAxisAlignment:
                                                              MainAxisAlignment
                                                                  .spaceBetween,
                                                          children: [
                                                            Text(
                                                              news['date'],
                                                              style: TextStyle(
                                                                  fontSize: 12,
                                                                  color: Colors
                                                                          .grey[
                                                                      400]),
                                                            ),
                                                            TextButton(
                                                              onPressed: () {
                                                                // Read more action (sử dụng news['url'])
                                                                ScaffoldMessenger.of(
                                                                        context)
                                                                    .showSnackBar(
                                                                  SnackBar(
                                                                      content: Text(
                                                                          '${news['readMore']}')),
                                                                );
                                                              },
                                                              child: Text(news[
                                                                  'readMore']),
                                                            ),
                                                          ],
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
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
