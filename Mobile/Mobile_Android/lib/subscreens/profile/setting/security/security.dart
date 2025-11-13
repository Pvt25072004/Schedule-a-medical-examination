import 'package:flutter/material.dart';
import '../../../password/resetpass.dart';
import '../../../password/createandresetpin.dart';

class SecurityScreen extends StatefulWidget {
  const SecurityScreen({Key? key}) : super(key: key);

  @override
  State<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends State<SecurityScreen> {
  bool _twoFactorEnabled = false;
  bool _biometricEnabled = false;
  bool _faceIdEnabled = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.teal),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'Bảo mật & Đăng nhập',
              style: TextStyle(
                  color: Colors.teal,
                  fontSize: 16,
                  fontWeight: FontWeight.bold),
            ),
            Text(
              'Quản lý bảo mật tài khoản của bạn',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
        elevation: 0,
        backgroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSecurityBanner(),
              const SizedBox(height: 24),
              _buildSectionTitle('Mật khẩu & Mã PIN'),
              _buildPasswordCard(),
              const SizedBox(height: 16),
              _buildPinCard(),
              const SizedBox(height: 24),
              _buildSectionTitle('Xác minh nâng cao'),
              _build2FACard(),
              const SizedBox(height: 16),
              _buildAuthenticatorCard(),
              const SizedBox(height: 24),
              _buildSectionTitle('Sinh trắc học'),
              _buildBiometricCard(),
              const SizedBox(height: 16),
              _buildFaceIdCard(),
              const SizedBox(height: 24),
              _buildSectionTitle('Lịch sử & Thiết bị'),
              _buildActivityCard(),
              const SizedBox(height: 16),
              _buildDevicesCard(),
              const SizedBox(height: 16),
              _buildSecurityWarningCard(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Colors.grey,
        ),
      ),
    );
  }

  Widget _buildSecurityBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.teal.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.teal.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.shield, color: Colors.teal, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: const Text(
              'Tài khoản của bạn đang được bảo vệ với vân tay',
              style: TextStyle(
                color: Colors.teal,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPasswordCard() {
    return _buildMenuCard(
      icon: Icons.lock,
      title: 'Đổi mật khẩu',
      subtitle: 'Cập nhật mật khẩu đăng nhập của bạn',
      badge: 'Bắt buộc',
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ResetPasswordScreen()),
        );
      },
    );
  }

  Widget _buildPinCard() {
    return _buildMenuCard(
      icon: Icons.pin,
      title: 'Mã PIN',
      subtitle: 'Tạo hoặc thay đổi mã PIN 6 số',
      badge: 'Đã thiết lập',
      badgeColor: Colors.teal,
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const CreateAndResetPinScreen()),
        );
      },
    );
  }

  Widget _build2FACard() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.teal.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.security, color: Colors.teal),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Xác minh hai bước (2FA)',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  Text(
                    'Thêm lớp bảo vệ thứ hai cho tài khoản',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ),
            Transform.scale(
              scale: 0.8,
              child: Switch(
                value: _twoFactorEnabled,
                onChanged: (value) => setState(() => _twoFactorEnabled = value),
                activeColor: Colors.teal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAuthenticatorCard() {
    return _buildMenuCard(
      icon: Icons.phone_android,
      title: 'Ứng dụng xác thực',
      subtitle: 'Sử dụng Google Authenticator hoặc tương tự',
      onTap: () {},
    );
  }

  Widget _buildBiometricCard() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.teal.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.fingerprint, color: Colors.teal),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Vân tay',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  Text(
                    'Đã kích hoạt vân tay để đăng nhập',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ),
            Transform.scale(
              scale: 0.8,
              child: Switch(
                value: _biometricEnabled,
                onChanged: (value) => setState(() => _biometricEnabled = value),
                activeColor: Colors.teal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFaceIdCard() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.teal.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.face, color: Colors.teal),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Face ID / Nhận diện khuôn mặt',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  Text(
                    'Mở khóa bằng khuôn mặt của bạn',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ),
            Transform.scale(
              scale: 0.8,
              child: Switch(
                value: _faceIdEnabled,
                onChanged: (value) => setState(() => _faceIdEnabled = value),
                activeColor: Colors.green,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityCard() {
    return _buildMenuCard(
      icon: Icons.history,
      title: 'Hoạt động gần đây',
      subtitle: 'Xem lịch sử đăng nhập và hoạt động',
      iconColor: Colors.orangeAccent,
      onTap: () {},
    );
  }

  Widget _buildDevicesCard() {
    return _buildMenuCard(
      icon: Icons.devices,
      title: 'Thiết bị tin cậy',
      subtitle: 'Quản lý các thiết bị đã đăng nhập',
      badge: '3 thiết bị',
      badgeColor: Colors.blue,
      iconColor: Colors.grey,
      onTap: () {},
    );
  }

  Widget _buildSecurityWarningCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.yellow.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.yellow.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.warning, color: Colors.red, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Lời khuyên bảo mật',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: Colors.red,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildWarningTip('Sử dụng mật khẩu mạnh với ít nhất 8 ký tự'),
          _buildWarningTip('Bật xác thực hai lớp để bảo vệ tài khoản'),
          _buildWarningTip('Đăng xuất khỏi các thiết bị không quen thuộc'),
          _buildWarningTip('Không chia sẻ mật khẩu với bất kỳ ai'),
          _buildWarningTip('Cập nhật ứng dụng thường xuyên'),
        ],
      ),
    );
  }

  Widget _buildWarningTip(String tip) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(Icons.check_circle, color: Colors.green, size: 14),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              tip,
              style: TextStyle(fontSize: 12, color: Colors.grey[800]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuCard({
    required IconData icon,
    required String title,
    required String subtitle,
    String? badge,
    Color? badgeColor,
    Color iconColor = Colors.teal,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: Colors.white,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: iconColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        if (badge != null) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: badgeColor?.withOpacity(0.2) ??
                                  Colors.orange.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              badge,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: badgeColor ?? Colors.orange,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, color: Colors.grey, size: 16),
            ],
          ),
        ),
      ),
    );
  }
}
