import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../screens/home.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileState();
}

class _EditProfileState extends State<EditProfileScreen> {
  Map<dynamic, dynamic>? userData;
  bool _isLoading = true;

  // Controllers cho các trường nhập liệu
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _medicalHistoryController = TextEditingController();
  final _insuranceController = TextEditingController();

  // Địa chỉ - tách riêng
  final _streetController = TextEditingController();
  final _districtController = TextEditingController();
  final _provinceController = TextEditingController();

  String _selectedGender = 'Nam';

  DateTime? _selectedDob;
  final List<String> _genders = ['Nam', 'Nữ', 'Khác'];

  // Màu fill nền cho input
  final Color _inputFillColor = Colors.grey.shade50;

  // Trạng thái email/phone từ Firebase (để quyết định readOnly)
  bool _emailExists = false;
  bool _phoneExists = false;

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  // Helper để tạo tiêu đề khối
  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 24, bottom: 12),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 20,
            decoration: BoxDecoration(
              color: primaryColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  // --- LOGIC FETCH DATA (Cập nhật để kiểm tra email/phone exists) ---
  Future<void> _fetchUserData() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      if (context.mounted) {
        Navigator.pop(context);
      }
      return;
    }

    final ref = FirebaseDatabase.instance.ref('users/${user.uid}');
    final snapshot = await ref.get();

    if (snapshot.exists && mounted) {
      setState(() {
        userData = snapshot.value as Map<dynamic, dynamic>;
        _isLoading = false;

        _nameController.text = userData?['displayName'] ?? '';
        _phoneController.text = userData?['phone'] ?? '';
        _emailController.text = userData?['email'] ?? '';

        _selectedGender = userData?['gender'] ?? 'Nam';
        _medicalHistoryController.text = userData?['medicalHistory'] ?? '';
        _insuranceController.text = userData?['insuranceId'] ?? 'BH123456789'; // Giả định BH Y tế

        final address = userData?['address'] as Map<dynamic, dynamic>?;
        if (address != null) {
          _streetController.text = address['street'] ?? '';
          _districtController.text = address['district'] ?? '';
          _provinceController.text = address['province'] ?? '';
        } else {
          // Mocking địa chỉ nếu DB chưa có
          _streetController.text = '';
          _districtController.text = '';
          _provinceController.text = '';
        }

        final dobRaw = userData?['dateOfBirth'];
        if (dobRaw != null) {
          try {
            if (dobRaw is int) {
              _selectedDob = DateTime.fromMillisecondsSinceEpoch(dobRaw);
            } else if (dobRaw is String) {
              _selectedDob = DateTime.tryParse(dobRaw);
            }
          } catch (e) {
            _selectedDob = null;
          }
        }

        // Kiểm tra email/phone exists để set readOnly
        _emailExists = userData?['email'] != null && userData?['email']!.isNotEmpty;
        _phoneExists = userData?['phone'] != null && userData?['phone']!.isNotEmpty;

        // Cập nhật UI nếu cần
        if (mounted) {
          setState(() {}); // Đảm bảo UI rebuild với readOnly mới
        }
      });
    } else {
      setState(() {
        _isLoading = false;
      });
    }
  }

  // --- LOGIC CHỌN NGÀY ---
  Future<void> _pickDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDob ?? DateTime(2000),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Colors.greenAccent,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && mounted) {
      setState(() {
        _selectedDob = picked;
      });
    }
  }

  // --- LOGIC SAVE (Cập nhật để kiểm tra email/phone exists và báo OTP nếu cần) ---
  Future<void> _saveProfile() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    if (_nameController.text.trim().isEmpty) {
      showAppSnackBar(context, 'Vui lòng nhập tên hiển thị');
      return;
    }

    // Kiểm tra nếu email hoặc phone đã tồn tại và có thay đổi, báo OTP
    if (_emailExists && _emailController.text != userData?['email']) {
      showAppSnackBar(context, 'Email đã tồn tại. Vui lòng xác thực OTP để thay đổi.');
      // TODO: Tích hợp OTP verification logic here
      return;
    }
    if (_phoneExists && _phoneController.text != userData?['phone']) {
      showAppSnackBar(context, 'Số điện thoại đã tồn tại. Vui lòng xác thực OTP để thay đổi.');
      // TODO: Tích hợp OTP verification logic here
      return;
    }

    try {
      final updates = <String, dynamic>{
        'displayName': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'email': _emailController.text.trim(),
        'gender': _selectedGender,
        'dateOfBirth': _selectedDob?.toIso8601String(),
        'medicalHistory': _medicalHistoryController.text.trim(),
        'insuranceId': _insuranceController.text.trim(),
        'address': {
          'street': _streetController.text.trim(),
          'district': _districtController.text.trim(),
          'province': _provinceController.text.trim(),
        },
      };

      await FirebaseDatabase.instance.ref('users/${user.uid}').update(updates);

      if (context.mounted) {
        showAppSnackBar(context, 'Cập nhật hồ sơ thành công');
        Navigator.pop(context);
      }
    } catch (e) {
      if (context.mounted) {
        showAppSnackBar(context, 'Lỗi cập nhật: ${e.toString()}');
      }
    }
  }

  // --- LOGIC XÓA TÀI KHOẢN (Giữ nguyên) ---
  Future<void> _deleteAccount() async {
    showAppSnackBar(context, 'Chức năng xóa tài khoản đang phát triển...');
  }

  // --- WIDGET TEXTFIELD CÓ KHUNG (Cập nhật readOnly động cho email/phone) ---
  Widget _buildFramedTextField({
    required TextEditingController controller,
    required String labelText,
    required TextStyle textStyle,
    Widget? prefixIcon,
    TextInputType keyboardType = TextInputType.text,
    bool readOnly = false,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: controller,
      readOnly: readOnly,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: labelText,
        prefixIcon: prefixIcon,
        suffixIcon: readOnly ? Icon(Icons.verified, color: Colors.green.shade600, size: 20) : null, // Icon verified nếu readOnly
        labelStyle: TextStyle(color: Colors.grey.shade600, fontSize: 16),

        // Styling khung
        filled: true,
        fillColor: readOnly ? Colors.green.shade50 : _inputFillColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide.none, // Viền mỏng sẽ được thay thế bằng fill color
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: primaryColor, width: 2), // Viền xanh khi focus
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Colors.red),
        ),
      ),
      style: textStyle,
    );
  }

  @override
  Widget build(BuildContext context) {
    final labelStyle = TextStyle(fontSize: 16, color: Colors.black87);

    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator(color: Colors.greenAccent)),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA), // Nền nhẹ nhàng hơn
      appBar: AppBar(
        title: const Text("Tài khoản", style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0.5, // Shadow nhẹ
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // --- 1. KHỐI ẢNH ĐẠI DIỆN (Thu khoảng cách top/bottom) ---
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0), // Giảm padding từ 20 xuống 16
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader('Ảnh đại diện'),
                    const SizedBox(height: 12), // Giảm từ 16 xuống 12
                    Row(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.greenAccent, width: 3),
                          ),
                          child: CircleAvatar(
                            radius: 40,
                            backgroundColor: Colors.greenAccent.shade100,
                            child: const Icon(Icons.person, size: 50, color: Colors.greenAccent),
                          ),
                        ),
                        const SizedBox(width: 20),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () { showAppSnackBar(context, 'Chọn ảnh (Mock)'); },
                            icon: const Icon(Icons.camera_alt_outlined, size: 20),
                            label: const Text('Thay đổi ảnh', style: TextStyle(fontWeight: FontWeight.w600)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.greenAccent,
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4), // Giảm từ 8 xuống 4
                    Text('JPG, PNG. Tối đa 2MB', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20), // Giảm từ 24 xuống 20

            // --- 2. KHỐI THÔNG TIN CÁ NHÂN ---
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader('Thông tin cá nhân'),
                    const SizedBox(height: 16),

                    // Họ và tên (TextFormField)
                    _buildFramedTextField(
                      controller: _nameController,
                      labelText: 'Họ và tên *',
                      textStyle: labelStyle,
                      prefixIcon: const Icon(Icons.person_outline, size: 20, color: Colors.grey),
                    ),
                    const SizedBox(height: 16),

                    // Giới tính (Dropdown bọc trong Container để có khung nền)
                    _buildFramedTextField(
                      controller: TextEditingController(text: _selectedGender),
                      labelText: 'Giới tính',
                      textStyle: labelStyle,
                      prefixIcon: const Icon(Icons.transgender, size: 20, color: Colors.grey),
                      readOnly: true,
                    ),
                    const SizedBox(height: 16),

                    // Ngày sinh (Custom Input Field)
                    GestureDetector(
                      onTap: _pickDate,
                      child: _buildFramedTextField(
                        controller: TextEditingController(
                          text: _selectedDob != null
                              ? DateFormat('dd/MM/yyyy').format(_selectedDob!)
                              : null,
                        ),
                        labelText: 'Ngày sinh',
                        textStyle: labelStyle.copyWith(
                          color: _selectedDob == null ? Colors.grey.shade600 : Colors.black87,
                        ),
                        prefixIcon: const Icon(Icons.calendar_today_outlined, size: 20, color: Colors.grey),
                        readOnly: true,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Số bảo hiểm y tế
                    _buildFramedTextField(
                      controller: _insuranceController,
                      labelText: 'Số bảo hiểm y tế',
                      textStyle: labelStyle,
                      prefixIcon: const Icon(Icons.verified_user_outlined, size: 20, color: Colors.grey),
                    ),
                    const SizedBox(height: 16),

                    // Bệnh nền
                    _buildFramedTextField(
                      controller: _medicalHistoryController,
                      labelText: 'Bệnh nền',
                      textStyle: labelStyle,
                      maxLines: 3,
                      prefixIcon: const Icon(Icons.medical_information_outlined, size: 20, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20), // Giảm từ 24 xuống 20

            // --- 3. KHỐI THÔNG TIN LIÊN HỆ & ĐỊA CHỈ (Tách địa chỉ thành 3 field) ---
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader('Thông tin liên hệ'),
                    const SizedBox(height: 16),

                    // Email (readOnly nếu exists)
                    _buildFramedTextField(
                      controller: _emailController,
                      labelText: 'Email *',
                      textStyle: labelStyle,
                      prefixIcon: const Icon(Icons.email_outlined, size: 20, color: Colors.grey),
                      keyboardType: TextInputType.emailAddress,
                      readOnly: _emailExists, // Xám nếu exists
                    ),
                    const SizedBox(height: 16),

                    // Số điện thoại (readOnly nếu exists)
                    _buildFramedTextField(
                      controller: _phoneController,
                      labelText: 'Số điện thoại *',
                      textStyle: labelStyle,
                      prefixIcon: const Icon(Icons.phone_outlined, size: 20, color: Colors.grey),
                      keyboardType: TextInputType.phone,
                      readOnly: _phoneExists, // Xám nếu exists
                    ),
                    const SizedBox(height: 16),

                    // Địa chỉ - tách riêng
                    _buildFramedTextField(
                      controller: _streetController,
                      labelText: 'Số nhà, đường *',
                      textStyle: labelStyle,
                      prefixIcon: const Icon(Icons.location_on_outlined, size: 20, color: Colors.grey),
                    ),
                    const SizedBox(height: 16),
                    _buildFramedTextField(
                      controller: _districtController,
                      labelText: 'Quận/Huyện *',
                      textStyle: labelStyle,
                      prefixIcon: const Icon(Icons.map_outlined, size: 20, color: Colors.grey),
                    ),
                    const SizedBox(height: 16),
                    _buildFramedTextField(
                      controller: _provinceController,
                      labelText: 'Thành phố/Tỉnh *',
                      textStyle: labelStyle,
                      prefixIcon: const Icon(Icons.location_city_outlined, size: 20, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),

            // --- 4. NÚT HÀNH ĐỘNG ---
            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 2,
                ),
                child: const Text(
                  "Lưu thay đổi",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Nút Xóa tài khoản
            SizedBox(
              height: 50,
              child: OutlinedButton(
                onPressed: _deleteAccount,
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  "Xóa tài khoản",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _medicalHistoryController.dispose();
    _streetController.dispose();
    _districtController.dispose();
    _provinceController.dispose();
    _insuranceController.dispose();
    super.dispose();
  }
}