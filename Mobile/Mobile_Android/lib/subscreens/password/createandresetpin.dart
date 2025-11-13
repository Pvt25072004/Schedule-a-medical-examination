import 'package:flutter/material.dart';

class CreateAndResetPinScreen extends StatefulWidget {
  final bool isReset;

  const CreateAndResetPinScreen({
    Key? key,
    this.isReset = false,
  }) : super(key: key);

  @override
  State<CreateAndResetPinScreen> createState() =>
      _CreateAndResetPinScreenState();
}

class _CreateAndResetPinScreenState extends State<CreateAndResetPinScreen> {
  late TextEditingController _currentPinController;
  late TextEditingController _newPinController;
  late TextEditingController _confirmPinController;
  bool _showCurrentPin = false;
  bool _showNewPin = false;
  bool _showConfirmPin = false;

  @override
  void initState() {
    super.initState();
    _currentPinController = TextEditingController();
    _newPinController = TextEditingController();
    _confirmPinController = TextEditingController();
  }

  @override
  void dispose() {
    _currentPinController.dispose();
    _newPinController.dispose();
    _confirmPinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.teal),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.isReset ? 'Thay đổi Mã PIN' : 'Tạo Mã PIN',
          style:
              const TextStyle(color: Colors.teal, fontWeight: FontWeight.bold),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 32),
              if (widget.isReset) ...[
                _buildCurrentPinField(),
                const SizedBox(height: 24),
              ],
              _buildNewPinField(),
              const SizedBox(height: 24),
              _buildConfirmPinField(),
              const SizedBox(height: 24),
              _buildSecurityTips(),
              const SizedBox(height: 32),
              _buildSubmitButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.teal.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.pin, color: Colors.teal, size: 40),
        ),
        const SizedBox(height: 24),
        Text(
          widget.isReset ? 'Thay đổi Mã PIN' : 'Tạo Mã PIN bảo mật',
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          widget.isReset
              ? 'Cập nhật Mã PIN 6 số của bạn để tăng cường bảo mật'
              : 'Tạo Mã PIN 6 số để bảo vệ các giao dịch quan trọng',
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildCurrentPinField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Mã PIN hiện tại',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _currentPinController,
          obscureText: !_showCurrentPin,
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: InputDecoration(
            hintText: '• • • • • •',
            counterText: '',
            prefixIcon: const Icon(Icons.lock_outline, color: Colors.teal),
            suffixIcon: IconButton(
              icon: Icon(
                _showCurrentPin ? Icons.visibility : Icons.visibility_off,
                color: Colors.teal,
              ),
              onPressed: () {
                setState(() => _showCurrentPin = !_showCurrentPin);
              },
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.grey),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.teal, width: 2),
            ),
            filled: true,
            fillColor: Colors.grey.withOpacity(0.05),
          ),
        ),
      ],
    );
  }

  Widget _buildNewPinField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Mã PIN mới',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _newPinController,
          obscureText: !_showNewPin,
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: InputDecoration(
            hintText: '• • • • • •',
            counterText: '',
            prefixIcon: const Icon(Icons.lock, color: Colors.teal),
            suffixIcon: IconButton(
              icon: Icon(
                _showNewPin ? Icons.visibility : Icons.visibility_off,
                color: Colors.teal,
              ),
              onPressed: () {
                setState(() => _showNewPin = !_showNewPin);
              },
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.grey),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.teal, width: 2),
            ),
            filled: true,
            fillColor: Colors.grey.withOpacity(0.05),
          ),
        ),
      ],
    );
  }

  Widget _buildConfirmPinField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Xác nhận Mã PIN',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _confirmPinController,
          obscureText: !_showConfirmPin,
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: InputDecoration(
            hintText: '• • • • • •',
            counterText: '',
            prefixIcon: const Icon(Icons.lock_outline, color: Colors.teal),
            suffixIcon: IconButton(
              icon: Icon(
                _showConfirmPin ? Icons.visibility : Icons.visibility_off,
                color: Colors.teal,
              ),
              onPressed: () {
                setState(() => _showConfirmPin = !_showConfirmPin);
              },
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.grey),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.teal, width: 2),
            ),
            filled: true,
            fillColor: Colors.grey.withOpacity(0.05),
          ),
        ),
      ],
    );
  }

  Widget _buildSecurityTips() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lightbulb, color: Colors.blue, size: 18),
              const SizedBox(width: 8),
              const Text(
                'Lời khuyên bảo mật',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _buildTip('Sử dụng 6 chữ số duy nhất'),
          _buildTip('Tránh dùng ngày tháng sinh'),
          _buildTip('Không sử dụng các số liên tiếp (123456)'),
          _buildTip('Giữ bí mật Mã PIN của bạn'),
        ],
      ),
    );
  }

  Widget _buildTip(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          const Icon(Icons.check, color: Colors.green, size: 14),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(fontSize: 11, color: Colors.grey[700]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _handleSubmit,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.teal,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: Text(
          widget.isReset ? 'Cập nhật Mã PIN' : 'Tạo Mã PIN',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  void _handleSubmit() {
    if (_newPinController.text.isEmpty || _confirmPinController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng điền đầy đủ thông tin'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_newPinController.text.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Mã PIN phải có 6 chữ số'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_newPinController.text != _confirmPinController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Mã PIN không khớp'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          widget.isReset
              ? 'Mã PIN đã cập nhật thành công'
              : 'Mã PIN đã tạo thành công',
        ),
        backgroundColor: Colors.green,
      ),
    );

    Future.delayed(const Duration(seconds: 1), () {
      Navigator.pop(context);
    });
  }
}
