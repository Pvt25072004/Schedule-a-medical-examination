// step6_patient_info.dart (Đã sửa lỗi lưu trạng thái)
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';

import '../settings/editprofile.dart';

class Step6PatientInfo extends StatefulWidget {
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;
  // THÊM CÁC BIẾN INITIAL
  final String initialReason;
  final String initialNote;

  const Step6PatientInfo({
    super.key,
    required this.onNext,
    required this.onBack,
    this.initialReason = '', // Gán giá trị mặc định an toàn
    this.initialNote = '',
  });

  @override
  State<Step6PatientInfo> createState() => _Step6PatientInfoState();
}

class _Step6PatientInfoState extends State<Step6PatientInfo> {
  final _formKey = GlobalKey<FormState>();

  // Controllers & Scroll Controller
  final _scrollController = ScrollController();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _reasonController = TextEditingController();
  final _noteController = TextEditingController();

  // GlobalKey cho các trường bắt buộc để ScrollToError hoạt động
  final GlobalKey _phoneKey = GlobalKey(); // Key cho SĐT
  final GlobalKey _reasonKey = GlobalKey(); // Key cho Lý do khám

  // Realtime Firebase Logic
  StreamSubscription<DatabaseEvent>? _userSubscription;
  Map<dynamic, dynamic>? _firebaseUserData;

  // Màu chủ đạo giả định
  final Color primaryColor = Colors.greenAccent;
  final Color primaryDarkColor = const Color(0xFF1B5E20);
  final Color errorColor = Colors.red.shade700;

  @override
  void initState() {
    super.initState();
    // KHỞI TẠO CONTROLLERS VỚI GIÁ TRỊ TỪ WIDGET CHA
    _reasonController.text = widget.initialReason;
    _noteController.text = widget.initialNote;

    _subscribeToUserData();
  }

  // ... (Các hàm _subscribeToUserData, _updateControllersFromFirebase, _scrollToError giữ nguyên)
  // --- HÀM LẮNG NGHE REALTIME DATA TỪ FIREBASE ---
  void _subscribeToUserData() {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final ref = FirebaseDatabase.instance.ref('users/${user.uid}');

    _userSubscription = ref.onValue.listen((event) {
      if (mounted) {
        final data = event.snapshot.value;
        if (data != null && data is Map<dynamic, dynamic>) {
          setState(() {
            _firebaseUserData = data;
            _updateControllersFromFirebase();
          });
        }
      }
    });
  }

  // --- CẬP NHẬT CONTROLLERS DỰA TRÊN DỮ LIỆU FIREBASE ---
  void _updateControllersFromFirebase() {
    if (_firebaseUserData != null) {
      _nameController.text = _firebaseUserData!['displayName'] ?? '';
      _phoneController.text = _firebaseUserData!['phone'] ?? '';
      _emailController.text = _firebaseUserData!['email'] ?? '';
    }
  }

  // --- LOGIC CUỘN ĐẾN LỖI (SCROLL TO ERROR) ---
  void _scrollToError() {
    if (!_formKey.currentState!.validate()) {
      Future.delayed(const Duration(milliseconds: 100), () {
        final errorKeys = [_phoneKey, _reasonKey];

        for (final key in errorKeys) {
          final context = key.currentContext;
          if (context != null) {
            final formField = context.widget as TextFormField;

            final String? errorMessage = formField.validator?.call(formField.controller?.text);

            if (errorMessage != null) {
              FocusScope.of(context).unfocus();

              Scrollable.ensureVisible(
                context,
                duration: const Duration(milliseconds: 500),
                alignment: 0.25,
                curve: Curves.easeInOut,
              );
              return;
            }
          }
        }
      });
    }
  }
  // ... (Các hàm _buildReadOnlyField, _buildInputField, _goToEditProfile giữ nguyên)

  // --- Widget TextField Chung cho Read-Only ---
  Widget _buildReadOnlyField({
    required TextEditingController controller,
    required String labelText,
    required IconData icon,
    GlobalKey? key,
    TextInputType keyboardType = TextInputType.text,
    bool required = false,
  }) {
    return TextFormField(
      key: key,
      controller: controller,
      readOnly: true,
      decoration: InputDecoration(
        labelText: required ? null : labelText,
        label: required
            ? RichText(
          text: TextSpan(
            text: labelText,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
            children: [
              TextSpan(
                text: ' *',
                style: TextStyle(color: errorColor, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        )
            : null,
        prefixIcon: Icon(icon, color: primaryDarkColor),
        border: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
        filled: true,
        fillColor: Colors.grey.shade100,
      ),
      keyboardType: keyboardType,
      validator: (value) {
        if (required && (value == null || value.isEmpty)) {
          return 'Thông tin này không được để trống trong hồ sơ cá nhân';
        }
        return null;
      },
    );
  }

  // --- Widget TextField Chung cho Input ---
  Widget _buildInputField({
    required TextEditingController controller,
    required String labelText,
    required String validationMessage,
    GlobalKey? key,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
    bool required = false,
  }) {
    return TextFormField(
      key: key,
      controller: controller,
      decoration: InputDecoration(
        labelText: required ? null : labelText,
        label: required
            ? RichText(
          text: TextSpan(
            text: labelText,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
            children: [
              TextSpan(
                text: ' *',
                style: TextStyle(color: errorColor, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        )
            : null,
        border: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
      ),
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: (value) => (validationMessage.isNotEmpty && (value == null || value.isEmpty))
          ? validationMessage
          : null,
    );
  }

  // --- Logic Chuyển đến Màn hình Sửa Hồ sơ ---
  void _goToEditProfile(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const EditProfileScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_firebaseUserData == null && FirebaseAuth.instance.currentUser != null) {
      return const Center(child: CircularProgressIndicator(color: Colors.greenAccent));
    }

    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: Column(
        children: [
          // --- Header Tùy Chỉnh (Bước 6) ---
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: Colors.grey.shade200, width: 1)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Thông tin Bệnh nhân',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Kiểm tra và xác nhận thông tin hồ sơ của bạn.',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          // --- Kết thúc Header Tùy Chỉnh ---

          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(20.0, 20.0, 20.0, 120.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // --- Thông báo và Nút Sửa Hồ sơ ---
                    Card(
                      color: Colors.blue.shade50,
                      elevation: 2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      margin: const EdgeInsets.only(bottom: 20),
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Row(
                          children: [
                            Icon(Icons.info_outline, color: Colors.blue.shade700, size: 20),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'Thông tin Hồ sơ (Họ tên, SĐT, Email) được lấy tự động.',
                                style: TextStyle(fontSize: 13),
                              ),
                            ),
                            TextButton(
                              onPressed: () => _goToEditProfile(context),
                              child: Text('Sửa hồ sơ', style: TextStyle(color: Colors.blue.shade700, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // 1. Họ và tên (Read-only)
                    _buildReadOnlyField(
                      controller: _nameController,
                      labelText: 'Họ và tên',
                      icon: Icons.person_outline,
                      required: true,
                    ),
                    const SizedBox(height: 16),

                    // 2. Số điện thoại (Read-only)
                    _buildReadOnlyField(
                      key: _phoneKey,
                      controller: _phoneController,
                      labelText: 'Số điện thoại',
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                      required: true,
                    ),
                    const SizedBox(height: 16),

                    // 3. Email (Read-only) - KHÔNG BẮT BUỘC
                    _buildReadOnlyField(
                      controller: _emailController,
                      labelText: 'Email',
                      icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                      required: false,
                    ),

                    // --- Thêm Khoảng cách (25px) trước tiêu đề ---
                    const SizedBox(height: 25),

                    // --- Form Bổ sung ---
                    const Text('Thông tin khám bệnh:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87)),
                    const Divider(height: 10, thickness: 1),
                    const SizedBox(height: 10),

                    // 4. Lý do khám (Bắt buộc)
                    _buildInputField(
                      controller: _reasonController,
                      labelText: 'Lý do khám (Triệu chứng chính)',
                      validationMessage: 'Vui lòng nhập lý do khám',
                      maxLines: 3,
                      key: _reasonKey,
                      required: true,
                    ),
                    const SizedBox(height: 16),

                    // 5. Ghi chú
                    _buildInputField(
                      controller: _noteController,
                      labelText: 'Ghi chú thêm (Lịch sử bệnh án, dị ứng...)',
                      validationMessage: '', // Không bắt buộc
                      maxLines: 3,
                      required: false,
                    ),
                    const SizedBox(height: 30),

                    // 6. Nút Xác nhận
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          // 1. Validate Form
                          if (_formKey.currentState!.validate()) {
                            // 2. Chuyển bước nếu hợp lệ
                            widget.onNext({
                              'fullName': _nameController.text,
                              'phone': _phoneController.text,
                              'email': _emailController.text,
                              // GỬI LẠI GIÁ TRỊ CỦA TEXTFIELD (ĐÃ ĐƯỢC LƯU NHỜ CONTROLLER)
                              'reason': _reasonController.text,
                              'note': _noteController.text,
                            });
                          } else {
                            // 3. Cuộn đến lỗi nếu không hợp lệ
                            _scrollToError();
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 4,
                        ),
                        child: const Text('Xác nhận đặt lịch', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    // LƯU TRẠNG THÁI CUỐI CÙNG VÀO CONTROLLERS TRƯỚC KHI DISPOSE
    // (Vì giá trị của controllers sẽ được cha lưu trong goToStep khi onNext)

    _userSubscription?.cancel();
    _scrollController.dispose();

    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _reasonController.dispose();
    _noteController.dispose();
    super.dispose();
  }
}