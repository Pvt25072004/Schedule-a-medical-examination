import 'package:flutter/material.dart';
import '../../service/auth_service.dart';
import '../profile/editprofile.dart';

class Step6PatientInfo extends StatefulWidget {
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;
  final String initialReason;
  final String initialNote;

  const Step6PatientInfo({
    super.key,
    required this.onNext,
    required this.onBack,
    this.initialReason = '', 
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
  final GlobalKey _phoneKey = GlobalKey(); 
  final GlobalKey _reasonKey = GlobalKey(); 

  // --- Cho Người Thân ---
  bool _isForRelative = false;
  final _relativeNameController = TextEditingController();
  final _relativePhoneController = TextEditingController();
  final _relativeDobController = TextEditingController();
  final _relativeAddressController = TextEditingController();
  String _relativeGender = 'Nam';
  String _relativeRelationship = 'Cha mẹ';

  final List<String> _genderOptions = ['Nam', 'Nữ', 'Khác'];
  final List<String> _relationshipOptions = ['Cha mẹ', 'Vợ chồng', 'Con cái', 'Anh chị em', 'Khác'];

  Map<String, dynamic>? _userData;
  final AuthService _authService = AuthService();

  // Màu chủ đạo
  final Color primaryColor = const Color(0xFF48A1F3);
  final Color primaryDarkColor = const Color(0xFF143250);
  final Color errorColor = Colors.red.shade700;

  @override
  void initState() {
    super.initState();
    _reasonController.text = widget.initialReason;
    _noteController.text = widget.initialNote;
    _loadUserData();
  }

  // Lấy thông tin bệnh nhân từ REST API để điền tự động
  Future<void> _loadUserData() async {
    final user = AuthService.currentUser;
    if (user == null) return;

    try {
      final data = await _authService.fetchUserData(user.uid);
      if (mounted) {
        setState(() {
          _userData = data;
          _nameController.text = data['displayName'] ?? '';
          _phoneController.text = data['phone'] ?? '';
          _emailController.text = data['email'] ?? (user.email ?? '');
        });
      }
    } catch (e) {
      debugPrint('🔥 Lỗi Step6 load user: $e');
    }
  }

  // LOGIC CUỘN ĐẾN LỖI (SCROLL TO ERROR)
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

  void _goToEditProfile(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const EditProfileScreen()),
    ).then((_) {
      // Tải lại thông tin sau khi quay lại từ màn hình sửa hồ sơ
      _loadUserData();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_userData == null && AuthService.currentUser != null) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF48A1F3)));
    }

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Column(
        children: [
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

          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(20.0, 20.0, 20.0, 120.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Card(
                      color: Colors.blue.shade50,
                      elevation: 2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      margin: const EdgeInsets.only(bottom: 20),
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: RadioListTile<bool>(
                                    title: const Text('Cho bản thân', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                                    value: false,
                                    groupValue: _isForRelative,
                                    activeColor: primaryColor,
                                    contentPadding: EdgeInsets.zero,
                                    onChanged: (val) => setState(() => _isForRelative = val!),
                                  ),
                                ),
                                Expanded(
                                  child: RadioListTile<bool>(
                                    title: const Text('Cho người thân', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                                    value: true,
                                    groupValue: _isForRelative,
                                    activeColor: primaryColor,
                                    contentPadding: EdgeInsets.zero,
                                    onChanged: (val) => setState(() => _isForRelative = val!),
                                  ),
                                ),
                              ],
                            ),
                            if (!_isForRelative) ...[
                              const Divider(),
                              Row(
                                children: [
                                  Icon(Icons.info_outline, color: Colors.blue.shade700, size: 20),
                                  const SizedBox(width: 8),
                                  const Expanded(
                                    child: Text(
                                      'Thông tin Hồ sơ được lấy tự động.',
                                      style: TextStyle(fontSize: 13),
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: () => _goToEditProfile(context),
                                    child: Text('Sửa', style: TextStyle(color: Colors.blue.shade700, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            ]
                          ],
                        ),
                      ),
                    ),

                    // 1. Họ và tên
                    if (!_isForRelative)
                      _buildReadOnlyField(
                        controller: _nameController,
                        labelText: 'Họ và tên',
                        icon: Icons.person_outline,
                        required: true,
                      )
                    else
                      _buildInputField(
                        controller: _relativeNameController,
                        labelText: 'Họ và tên người thân',
                        validationMessage: 'Vui lòng nhập họ tên người thân',
                        required: true,
                      ),
                    const SizedBox(height: 16),

                    // 2. Số điện thoại
                    if (!_isForRelative)
                      _buildReadOnlyField(
                        key: _phoneKey,
                        controller: _phoneController,
                        labelText: 'Số điện thoại',
                        icon: Icons.phone_outlined,
                        keyboardType: TextInputType.phone,
                        required: true,
                      )
                    else
                      _buildInputField(
                        controller: _relativePhoneController,
                        labelText: 'SĐT người thân',
                        validationMessage: 'Vui lòng nhập SĐT',
                        keyboardType: TextInputType.phone,
                        required: true,
                      ),
                    const SizedBox(height: 16),

                    // 3. Giới tính, Năm sinh, Mối quan hệ, Địa chỉ (Dành cho người thân)
                    if (_isForRelative) ...[
                      DropdownButtonFormField<String>(
                        value: _relativeGender,
                        decoration: const InputDecoration(
                          labelText: 'Giới tính',
                          border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                        ),
                        items: _genderOptions.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                        onChanged: (val) => setState(() => _relativeGender = val!),
                      ),
                      const SizedBox(height: 16),
                      _buildInputField(
                        controller: _relativeDobController,
                        labelText: 'Năm sinh (VD: 1990)',
                        validationMessage: 'Vui lòng nhập năm sinh',
                        keyboardType: TextInputType.number,
                        required: true,
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _relativeRelationship,
                        decoration: const InputDecoration(
                          labelText: 'Mối quan hệ',
                          border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                        ),
                        items: _relationshipOptions.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                        onChanged: (val) => setState(() => _relativeRelationship = val!),
                      ),
                      const SizedBox(height: 16),
                      _buildInputField(
                        controller: _relativeAddressController,
                        labelText: 'Địa chỉ người thân (Không bắt buộc)',
                        validationMessage: '',
                        required: false,
                      ),
                      const SizedBox(height: 16),
                    ] else ...[
                      _buildReadOnlyField(
                        controller: _emailController,
                        labelText: 'Email',
                        icon: Icons.email_outlined,
                        keyboardType: TextInputType.emailAddress,
                        required: false,
                      ),
                      const SizedBox(height: 25),
                    ],

                    const Text('Thông tin khám bệnh:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87)),
                    const Divider(height: 10, thickness: 1),
                    const SizedBox(height: 10),

                    // 4. Lý do khám
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
                      validationMessage: '', 
                      maxLines: 3,
                      required: false,
                    ),
                    const SizedBox(height: 30),

                    // 6. Nút Xác nhận
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          if (_formKey.currentState!.validate()) {
                            widget.onNext({
                              'fullName': _isForRelative ? _relativeNameController.text : _nameController.text,
                              'phone': _isForRelative ? _relativePhoneController.text : _phoneController.text,
                              'email': _isForRelative ? '' : _emailController.text,
                              'reason': _reasonController.text,
                              'note': _noteController.text,
                              'isForRelative': _isForRelative,
                              'patientGender': _isForRelative ? _relativeGender : null,
                              'patientDob': _isForRelative ? _relativeDobController.text : null,
                              'relationship': _isForRelative ? _relativeRelationship : null,
                              'patientAddress': _isForRelative ? _relativeAddressController.text : null,
                            });
                          } else {
                            _scrollToError();
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF48A1F3),
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
    _scrollController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _reasonController.dispose();
    _noteController.dispose();
    super.dispose();
  }
}