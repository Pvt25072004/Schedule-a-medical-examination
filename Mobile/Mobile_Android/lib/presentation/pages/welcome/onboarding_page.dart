import 'package:clinic_booking_system/dashboard.dart';
import 'package:clinic_booking_system/presentation/molecules/welcome/role_card.dart';
import 'package:clinic_booking_system/core/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../logics/auth/providers/auth_provider.dart';
import '../../../logics/user/providers/user_provider.dart';
import '../../../logics/core_data/providers/city_provider.dart';
import 'package:provider/provider.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  final TextEditingController _displayNameController = TextEditingController();
  DateTime? _selectedDate;
  final TextEditingController _streetController = TextEditingController();
  String? _selectedProvince;
  final TextEditingController _districtController = TextEditingController();
  final TextEditingController _medicalHistoryController =
      TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<CityProvider>().fetchCities();
    });
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;
    if (user != null) {
      final userProvider = context.read<UserProvider>();
      await userProvider.fetchUserData(user.id);
      final userData = userProvider.userData;
      if (userData == null) return;
      setState(() {
        _displayNameController.text = userData['displayName'] ?? '';
        final dob = userData['dateOfBirth'];
        if (dob != null) _selectedDate = DateTime.parse(dob);
        final address = userData['address'] as Map? ?? {};
        final loadedProvince = address['province']?.toString();
        _selectedProvince = loadedProvince;

        _districtController.text = address['district']?.toString() ?? '';
        _streetController.text = address['street'] ?? '';
        _medicalHistoryController.text = userData['medicalHistory'] ?? '';
        // Luôn bắt đầu từ bước 0 để người dùng có thể tự tay xác nhận vai trò và thông tin
        _currentStep = 0;
        if (_pageController.hasClients) {
          _pageController.jumpToPage(0);
        }
      });
    }
  }

  Future<void> _nextStep() async {
    final authProvider = context.read<AuthProvider>();
    final userProvider = context.read<UserProvider>();
    final user = authProvider.currentUser;
    if (user == null) return;

    switch (_currentStep) {
      case 0: // Basic Profile
        if (_displayNameController.text.isEmpty || _selectedDate == null) {
          showAppSnackBar(
            context,
            'Vui lòng hoàn tất thông tin!',
          );
          return;
        }
        await userProvider.updateProfile(user.id, {
          'displayName': _displayNameController.text.trim(),
          'dateOfBirth': DateFormat('yyyy-MM-dd').format(_selectedDate!),
          'role': 'PATIENT',
        });
        _pageController.nextPage(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut);
        break;
      case 1: // Address
        if (_selectedProvince == null ||
            _districtController.text.isEmpty ||
            _streetController.text.isEmpty) {
          showAppSnackBar(
            context,
            'Vui lòng hoàn tất địa chỉ!',
          );
          return;
        }
        await userProvider.updateProfile(user.id, {
          'address': {
            'province': _selectedProvince,
            'district': _districtController.text.trim(),
            'street': _streetController.text.trim(),
          },
        });
        _pageController.nextPage(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut);
        break;
      case 2: // Medical History - Complete
        await userProvider.updateProfile(user.id, {
          'medicalHistory': _medicalHistoryController.text.trim(),
          'is_onboarding_needed': false, // FIXED: Chỉ false ở cuối
        });
        showAppSnackBar(
          context,
          'Hoàn tất hồ sơ! Chào mừng đến STL Clinic',
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const MainScreen()),
        );
        break;
    }
    setState(() => _currentStep++);
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: Text('Bước ${_currentStep + 1}/3'),
          automaticallyImplyLeading: false),
      body: PageView(
        controller: _pageController,
        physics: const NeverScrollableScrollPhysics(),
        children: [
          // Step 0: Basic Profile
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Hồ sơ cơ bản',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _displayNameController,
                  decoration: const InputDecoration(
                      labelText: 'Tên hiển thị', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: () => _selectDate(context),
                  child: InputDecorator(
                    decoration: const InputDecoration(
                        labelText: 'Ngày sinh', border: OutlineInputBorder()),
                    child: Text(_selectedDate == null
                        ? 'Chọn ngày sinh'
                        : _selectedDate.toString().split(' ')[0]),
                  ),
                ),
                const Spacer(),
                ElevatedButton(
                    onPressed: _nextStep, child: const Text('Tiếp theo')),
              ],
            ),
          ),
          // Step 1: Address
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Thông tin địa chỉ',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                Consumer<CityProvider>(
                  builder: (context, cityProvider, child) {
                    if (cityProvider.isLoading) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    // Validate selectedProvince exists in list
                    final isValidSelection = _selectedProvince != null && 
                        cityProvider.cities.any((c) => c.id == _selectedProvince);

                    return DropdownButtonFormField<String>(
                      value: isValidSelection ? _selectedProvince : null,
                      decoration: const InputDecoration(labelText: 'Tỉnh/Thành phố'),
                      items: cityProvider.cities
                          .map((city) => DropdownMenuItem(
                                value: city.id,
                                child: Text(city.name),
                              ))
                          .toList(),
                      onChanged: (v) {
                        setState(() {
                          _selectedProvince = v;
                        });
                      },
                    );
                  },
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _districtController,
                  decoration: const InputDecoration(
                      labelText: 'Quận/Huyện',
                      border: OutlineInputBorder()),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _streetController,
                  decoration: const InputDecoration(
                      labelText: 'Đường/Phố/Số nhà',
                      border: OutlineInputBorder()),
                ),
                const Spacer(),
                ElevatedButton(
                    onPressed: _nextStep, child: const Text('Tiếp theo')),
              ],
            ),
          ),
          // Step 2: Medical History
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Thông tin bệnh nền',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Nhập các bệnh nền hoặc tình trạng sức khỏe đặc biệt (nếu có).',
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _medicalHistoryController,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    labelText: 'Bệnh nền',
                    border: OutlineInputBorder(),
                    hintText: 'Nhập bệnh nền...',
                  ),
                ),
                const Spacer(),
                ElevatedButton(
                    onPressed: _nextStep, child: const Text('Hoàn tất')),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    _displayNameController.dispose();
    _streetController.dispose();
    _medicalHistoryController.dispose();
    super.dispose();
  }
}
