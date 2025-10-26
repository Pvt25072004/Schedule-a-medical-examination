import 'package:clinic_booking_system/screens/main_screen.dart';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../service/auth_service.dart';

class OnboardingFlowScreen extends StatefulWidget {
  const OnboardingFlowScreen({super.key});

  @override
  State<OnboardingFlowScreen> createState() => _OnboardingFlowScreenState();
}

class _OnboardingFlowScreenState extends State<OnboardingFlowScreen> {
  final AuthService _authService = AuthService();
  final PageController _pageController = PageController();
  int _currentStep = 0;
  String? _selectedRole;
  bool _isDoctor = false;
  final TextEditingController _doctorCodeController = TextEditingController();
  final TextEditingController _displayNameController = TextEditingController();
  DateTime? _selectedDate;
  final TextEditingController _streetController = TextEditingController();
  String? _selectedProvince;
  String? _selectedDistrict;
  final List<String> provinces = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'];
  final Map<String, List<String>> districts = {
    'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Cầu Giấy'],
    'TP. Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 7'],
    'Đà Nẵng': ['Hải Châu', 'Thanh Khê'],
    'Cần Thơ': ['Ninh Kiều', 'Cái Răng'],
  };
  final TextEditingController _medicalHistoryController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      final userData = await _authService.fetchUserData(user.uid);
      setState(() {
        _selectedRole = userData['role'];
        if (_selectedRole == 'DOCTOR') _isDoctor = true;
        _doctorCodeController.text = userData['doctor_code'] ?? '';
        _displayNameController.text = userData['displayName'] ?? '';
        final dob = userData['dateOfBirth'];
        if (dob != null) _selectedDate = DateTime.parse(dob);
        final address = userData['address'] as Map? ?? {};
        _selectedProvince = address['province'];
        _selectedDistrict = address['district'];
        _streetController.text = address['street'] ?? '';
        _medicalHistoryController.text = userData['medicalHistory'] ?? '';
        // FIXED: Jump to current step based on completeness (e.g., if role set, start step 1)
        if (_selectedRole != null && _selectedRole != 'UNASSIGNED') _currentStep = 1;
        if (_displayNameController.text.isNotEmpty && _selectedDate != null) _currentStep = 2;
        if (_selectedProvince != null && _selectedDistrict != null && _streetController.text.isNotEmpty) _currentStep = 3;
        _pageController.jumpToPage(_currentStep);
      });
    }
  }

  Future<void> _nextStep() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    switch (_currentStep) {
      case 0: // Role Selection
        if (_selectedRole == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Vui lòng chọn vai trò!')),
          );
          return;
        }
        Map<String, dynamic> updates = {'role': _selectedRole};
        if (_isDoctor) {
          final doctorCode = _doctorCodeController.text.trim();
          if (doctorCode.isEmpty) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Vui lòng nhập mã bác sĩ!')),
            );
            return;
          }
          updates['doctor_code'] = doctorCode;
        }
        await _authService.updateProfile(user.uid, updates);
        _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
        break;
      case 1: // Basic Profile
        if (_displayNameController.text.isEmpty || _selectedDate == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Vui lòng hoàn tất thông tin!')),
          );
          return;
        }
        await _authService.updateProfile(user.uid, {
          'displayName': _displayNameController.text.trim(),
          'dateOfBirth': _selectedDate!.toIso8601String(),
        });
        _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
        break;
      case 2: // Address
        if (_selectedProvince == null || _selectedDistrict == null || _streetController.text.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Vui lòng hoàn tất địa chỉ!')),
          );
          return;
        }
        await _authService.updateProfile(user.uid, {
          'address': {
            'province': _selectedProvince,
            'district': _selectedDistrict,
            'street': _streetController.text.trim(),
          },
        });
        _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
        break;
      case 3: // Medical History - Complete
        await _authService.updateProfile(user.uid, {
          'medicalHistory': _medicalHistoryController.text.trim(),
          'is_onboarding_needed': false, // FIXED: Chỉ false ở cuối
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Hoàn tất hồ sơ! Chào mừng đến STL Clinic')),
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
      appBar: AppBar(title: Text('Bước ${_currentStep + 1}/4')),
      body: PageView(
        controller: _pageController,
        physics: const NeverScrollableScrollPhysics(),
        children: [
          // Step 0: Role Selection
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Chọn vai trò',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                _buildRoleCard(
                  'PATIENT',
                  Icons.personal_injury,
                  'Tôi là Bệnh nhân',
                  'Đặt lịch khám, quản lý hồ sơ sức khỏe cá nhân.',
                  _selectedRole == 'Bệnh nhân',
                      () {
                    setState(() {
                      _selectedRole = 'Bệnh nhân';
                      _isDoctor = false;
                    });
                  },
                ),
                const SizedBox(height: 20),
                _buildRoleCard(
                  'DOCTOR',
                  Icons.local_hospital_outlined,
                  'Tôi là Bác sĩ/Chuyên gia',
                  'Quản lý lịch làm việc, hồ sơ chuyên môn.',
                  _selectedRole == 'Bác sĩ',
                      () {
                    setState(() {
                      _selectedRole = 'Bác sĩ';
                      _isDoctor = true;
                    });
                  },
                ),
                if (_isDoctor) ...[
                  const SizedBox(height: 20),
                  TextField(
                    controller: _doctorCodeController,
                    decoration: InputDecoration(
                      labelText: 'Mã bác sĩ (VD: BS001)',
                      prefixIcon: const Icon(Icons.verified_user),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      hintText: 'Nhập mã bác sĩ của bạn',
                    ),
                  ),
                ],
                const Spacer(),
                ElevatedButton(onPressed: _nextStep, child: const Text('Tiếp theo')),
              ],
            ),
          ),
          // Step 1: Basic Profile
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
                  decoration: const InputDecoration(labelText: 'Tên hiển thị', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: () => _selectDate(context),
                  child: InputDecorator(
                    decoration: const InputDecoration(labelText: 'Ngày sinh', border: OutlineInputBorder()),
                    child: Text(_selectedDate == null ? 'Chọn ngày sinh' : _selectedDate.toString().split(' ')[0]),
                  ),
                ),
                const Spacer(),
                ElevatedButton(onPressed: _nextStep, child: const Text('Tiếp theo')),
              ],
            ),
          ),
          // Step 2: Address
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
                DropdownButtonFormField<String>(
                  value: _selectedProvince,
                  decoration: const InputDecoration(labelText: 'Tỉnh/Thành phố'),
                  items: provinces.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                  onChanged: (v) {
                    setState(() {
                      _selectedProvince = v;
                      _selectedDistrict = null;
                    });
                  },
                ),
                const SizedBox(height: 20),
                if (_selectedProvince != null)
                  DropdownButtonFormField<String>(
                    value: _selectedDistrict,
                    decoration: const InputDecoration(labelText: 'Quận/Huyện'),
                    items: (districts[_selectedProvince] ?? []).map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
                    onChanged: (v) => setState(() => _selectedDistrict = v),
                  ),
                const SizedBox(height: 20),
                TextField(
                  controller: _streetController,
                  decoration: const InputDecoration(labelText: 'Đường/Phố/Số nhà', border: OutlineInputBorder()),
                ),
                const Spacer(),
                ElevatedButton(onPressed: _nextStep, child: const Text('Tiếp theo')),
              ],
            ),
          ),
          // Step 3: Medical History
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
                ElevatedButton(onPressed: _nextStep, child: const Text('Hoàn tất')),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleCard(String role, IconData icon, String title, String subtitle, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF1F8E9) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? const Color(0xFF1B5E20) : Colors.grey.shade300, width: 2),
          boxShadow: [
            BoxShadow(color: Colors.grey.withOpacity(0.15), spreadRadius: 2, blurRadius: 8, offset: const Offset(0, 4)),
          ],
        ),
        child: Row(
          children: [
            Icon(icon, size: 40, color: isSelected ? const Color(0xFF1B5E20) : Colors.blueGrey),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isSelected ? const Color(0xFF1B5E20) : Colors.black)),
                  const SizedBox(height: 4),
                  Text(subtitle, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    _doctorCodeController.dispose();
    _displayNameController.dispose();
    _streetController.dispose();
    _medicalHistoryController.dispose();
    super.dispose();
  }
}