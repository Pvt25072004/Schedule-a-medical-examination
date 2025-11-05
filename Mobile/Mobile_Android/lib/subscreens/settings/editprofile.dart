import 'package:clinic_booking_system/utils/snackbar_helper.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  Map<dynamic, dynamic>? userData;
  bool _isLoading = true;

  // Controllers cho các trường nhập liệu
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _bioController = TextEditingController();
  final _medicalHistoryController = TextEditingController();
  final _streetController = TextEditingController();
  final _districtController = TextEditingController();
  final _provinceController = TextEditingController();

  DateTime? _selectedDob;

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

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

        // Điền dữ liệu vào controllers
        _nameController.text = userData?['displayName'] ?? '';
        _phoneController.text = userData?['phone'] ?? '';
        _emailController.text = userData?['email'] ?? '';
        _bioController.text = userData?['bio'] ?? '';
        _medicalHistoryController.text = userData?['medicalHistory'] ?? '';

        // Xử lý địa chỉ
        final address = userData?['address'] as Map<dynamic, dynamic>?;
        if (address != null) {
          _streetController.text = address['street'] ?? '';
          _districtController.text = address['district'] ?? '';
          _provinceController.text = address['province'] ?? '';
        }

        // Xử lý ngày sinh
        final dobRaw = userData?['dateOfBirth'];
        if (dobRaw != null) {
          try {
            if (dobRaw is int) {
              _selectedDob = DateTime.fromMillisecondsSinceEpoch(dobRaw);
            } else if (dobRaw is String) {
              _selectedDob = DateTime.parse(dobRaw);
            }
          } catch (e) {
            _selectedDob = null;
          }
        }
      });
    } else {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _pickDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDob ?? DateTime.now(),
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

  Future<void> _saveProfile() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    // Kiểm tra validation cơ bản (có thể thêm FormKey nếu cần)
    if (_nameController.text.trim().isEmpty) {
      showAppSnackBar(context, 'Vui lòng nhập tên hiển thị');
      return;
    }

    try {
      final updates = <String, dynamic>{
        'displayName': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'email': _emailController.text.trim(),
        'bio': _bioController.text.trim(),
        'medicalHistory': _medicalHistoryController.text.trim(),
        'dateOfBirth': _selectedDob?.toIso8601String(),
        'address': {
          'street': _streetController.text.trim(),
          'district': _districtController.text.trim(),
          'province': _provinceController.text.trim(),
        },
      };

      await FirebaseDatabase.instance.ref('users/${user.uid}').update(updates);

      if (context.mounted) {
        showAppSnackBar(context, 'Cập nhật hồ sơ thành công');
        Navigator.pop(context); // Quay lại màn hình Setting
      }
    } catch (e) {
      if (context.mounted) {
        showAppSnackBar(context, 'Lỗi cập nhật: ${e.toString()}');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFF8F0),
      appBar: AppBar(
        title: const Text("Chỉnh sửa hồ sơ"),
        backgroundColor: Colors.greenAccent,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.greenAccent))
          : SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Tên hiển thị
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: "Tên hiển thị",
                prefixIcon: Icon(Icons.person, color: Colors.greenAccent),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
              ),
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),

            // Số điện thoại
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: "Số điện thoại",
                prefixIcon: Icon(Icons.phone, color: Colors.greenAccent),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
              ),
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),

            // Email (có thể làm read-only nếu liên kết với Auth)
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: "Email",
                prefixIcon: Icon(Icons.email, color: Colors.greenAccent),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
              ),
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),

            // Giới thiệu
            TextFormField(
              controller: _bioController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: "Giới thiệu",
                prefixIcon: Icon(Icons.description, color: Colors.greenAccent),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
              ),
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),

            // Địa chỉ - Số nhà, đường
            TextFormField(
              controller: _streetController,
              decoration: const InputDecoration(
                labelText: "Số nhà, đường",
                prefixIcon: Icon(Icons.location_on, color: Colors.greenAccent),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
              ),
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            // Quận/Huyện
            TextFormField(
              controller: _districtController,
              decoration: const InputDecoration(
                labelText: "Quận/Huyện",
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
              ),
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            // Tỉnh/Thành phố
            TextFormField(
              controller: _provinceController,
              decoration: const InputDecoration(
                labelText: "Tỉnh/Thành phố",
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
              ),
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),

            // Ngày sinh
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                leading: const Icon(Icons.cake, color: Colors.greenAccent),
                title: const Text("Ngày sinh"),
                subtitle: Text(
                  _selectedDob != null
                      ? DateFormat('dd/MM/yyyy').format(_selectedDob!)
                      : 'Chọn ngày sinh',
                ),
                trailing: const Icon(Icons.calendar_today),
                onTap: _pickDate,
              ),
            ),
            const SizedBox(height: 16),

            // Bệnh nền
            TextFormField(
              controller: _medicalHistoryController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: "Bệnh nền",
                prefixIcon: Icon(Icons.medical_information, color: Colors.greenAccent),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
              ),
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 32),

            // Nút lưu
            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.greenAccent,
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
            const SizedBox(height: 20),
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
    _bioController.dispose();
    _medicalHistoryController.dispose();
    _streetController.dispose();
    _districtController.dispose();
    _provinceController.dispose();
    super.dispose();
  }
}