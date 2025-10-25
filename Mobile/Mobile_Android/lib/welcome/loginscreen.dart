import 'package:animations/animations.dart';
import 'package:clinic_booking_system/screens/home.dart';
import 'package:clinic_booking_system/service/auth_service.dart';
import 'package:clinic_booking_system/service/email_service.dart';
import 'package:clinic_booking_system/utils/otp_utils.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import '../screens/onboarding.dart';

class Loginscreen extends StatefulWidget {
  const Loginscreen({super.key, required this.isLogin});

  final bool isLogin;

  @override
  State<Loginscreen> createState() => _Loginscreen();
}

class _Loginscreen extends State<Loginscreen>
    with TickerProviderStateMixin {
  final _authService = AuthService();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPassword = TextEditingController();
  final _displayNameController = TextEditingController();
  String _inputType = 'email';

  late bool isLogin;

  // Controller cho Slide Transition của màn hình
  late AnimationController _mainController;
  late Animation<Offset> _offsetAnimation;

  // Controller cho Looping Animation của mũi tên
  late AnimationController _arrowController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _haloSizeAnimation;
  late Animation<double> _haloOpacityAnimation;

  @override
  void initState() {
    super.initState();
    isLogin = widget.isLogin;

    // ====================== 1. Khởi tạo Main Controller (Slide In) ======================
    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _offsetAnimation = Tween<Offset>(
      begin: const Offset(0.0, 1.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _mainController, curve: Curves.easeInOutCubic));
    _mainController.forward();

    // ====================== 2. Khởi tạo Arrow Controller (Looping) ======================
    _arrowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    // 3. Định nghĩa các Animations (sử dụng _arrowController)
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _arrowController, curve: Curves.easeInOut),
    );
    _haloSizeAnimation = Tween<double>(begin: 0, end: 180).animate(
      CurvedAnimation(parent: _arrowController, curve: Curves.easeInOut),
    );
    _haloOpacityAnimation = Tween<double>(begin: 0.0, end: 0.4).animate(
      CurvedAnimation(parent: _arrowController, curve: Curves.easeInOut),
    );
  }

  void _handleAuth() async {
    try {
      final input = _emailController.text.trim();
      final password = _passwordController.text.trim();
      final confirm = _confirmPassword.text.trim();
      final displayName = _displayNameController.text.trim();

      void showLoadingDialog(String message) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => AlertDialog(
            content: Row(
              children: [
                const CircularProgressIndicator(),
                const SizedBox(width: 16),
                Expanded(child: Text(message)),
              ],
            ),
          ),
        );
      }

      void safePopDialog() {
        if (Navigator.canPop(context)) Navigator.pop(context);
      }

      String normalizePhone(String phone) =>
          phone.startsWith('0') ? '+84${phone.substring(1)}' : phone;

      bool isValidPhone(String phone) =>
          RegExp(r'^(0|\+84)\d{9}$').hasMatch(phone);

      bool isValidEmail(String email) =>
          RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);

      // ======================= ĐĂNG KÝ =======================
      if (!isLogin) {
        if (_inputType == 'email') {
          if (!isValidEmail(input)) {
            _showSnack("❌ Email không hợp lệ!");
            return;
          }
          if (password != confirm) {
            _showSnack("❌ Mật khẩu không khớp!");
            return;
          }
          if (password.length < 6) {
            _showSnack("❌ Mật khẩu phải ít nhất 6 ký tự!");
            return;
          }

          showLoadingDialog("Đang gửi mã xác minh qua Email...");

          // Gửi OTP Email
          final otp = generateOtp();
          await EmailService.sendOtpEmail(input, otp);
          safePopDialog();

          final enteredOtp = await showOtpDialog(context, otp);
          if (enteredOtp == null || enteredOtp != otp) {
            _showSnack("⚠️ Sai OTP hoặc hủy xác minh.");
            return;
          }

          showLoadingDialog("Đang tạo tài khoản...");
          final cred = await _authService.signUpWithEmail(input, password, displayName); // FIXED: Lưu cred để lấy uid
          safePopDialog();

          // FIXED: KHÔNG signOut nữa, trực tiếp update profile với onboarding_needed = true và navigate đến RoleSelection
          final uid = cred.user?.uid;
          if (uid != null) {
            await _authService.updateProfile(uid, {'is_onboarding_needed': true});
          }

          _showSnack("✅ Đăng ký thành công! Hãy chọn vai trò.");
          if (context.mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const OnboardingFlowScreen()),
            );
          }
        } else {
          if (!isValidPhone(input)) {
            _showSnack("❌ Số điện thoại không hợp lệ!");
            return;
          }

          final phone = normalizePhone(input);
          showLoadingDialog("Đang gửi mã OTP...");
          final verificationId = await _authService.sendOtpPhone(phone);
          safePopDialog();

          final smsCode = await showOtpDialog(context, null);
          if (smsCode == null || smsCode.isEmpty) {
            _showSnack("⚠️ Bạn chưa nhập OTP.");
            return;
          }

          // Đăng ký bằng OTP
          showLoadingDialog("Đang xác thực...");
          final userCred = await _authService.verifyOtpAndSignIn(verificationId, smsCode); // FIXED: Lưu userCred
          safePopDialog();

          final uid = userCred.user?.uid;
          if (uid != null) {
            // FIXED: Update profile với displayName, phone, và onboarding_needed = true
            await _authService.updateProfile(uid, {
              'displayName': displayName.isNotEmpty ? displayName : phone,
              'phone': phone,
              'is_onboarding_needed': true, // FIXED: Set onboarding true cho flow mới
              'createdAt': ServerValue.timestamp,
            });
          }

          _showSnack("✅ Đăng ký thành công! Hãy chọn vai trò.");
          if (context.mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const OnboardingFlowScreen()),
            );
          }
        }

        return;
      }

      // ======================= ĐĂNG NHẬP =======================
      showLoadingDialog("Đang đăng nhập...");

      UserCredential? userCred;
      if (_inputType == 'phone') {
        if (!isValidPhone(input)) {
          safePopDialog();
          _showSnack("❌ Số điện thoại không hợp lệ!");
          return;
        }

        final phone = normalizePhone(input);
        final verificationId = await _authService.sendOtpPhone(phone);
        safePopDialog();

        final smsCode = await showOtpDialog(context, null);
        if (smsCode == null || smsCode.isEmpty) {
          _showSnack("⚠️ Hủy đăng nhập vì không nhập OTP.");
          return;
        }

        userCred = await _authService.verifyOtpAndSignIn(verificationId, smsCode);
      } else {
        if (!isValidEmail(input)) {
          safePopDialog();
          _showSnack("❌ Email không hợp lệ!");
          return;
        }

        userCred = await _authService.signInWithEmail(input, password);
      }

      safePopDialog();

      // FIXED: Chờ FirebaseAuth cập nhật user, rồi check onboarding từ DB
      await Future.delayed(const Duration(milliseconds: 800));

      final user = FirebaseAuth.instance.currentUser;
      if (user != null && context.mounted) {
        final userData = await _authService.fetchUserData(user.uid); // FIXED: Fetch từ DB
        final bool isOnboardingNeeded = userData['is_onboarding_needed'] ?? false;
        final String userRole = userData['role'] ?? 'UNASSIGNED';

        _showSnack("🎉 Đăng nhập thành công!");

        if (isOnboardingNeeded || userRole == 'UNASSIGNED') {
          // FIXED: Chuyển đến RoleSelection nếu cần onboarding
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const OnboardingFlowScreen()),
          );
        } else {
          // Đã hoàn tất, chuyển về Home
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const HomeScreen()),
          );
        }
      } else {
        _showSnack("⚠️ Đăng nhập xong nhưng không lấy được user!");
      }
    } catch (e) {
      if (Navigator.canPop(context)) Navigator.pop(context);
      _showSnack("❌ Lỗi: $e");
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), duration: const Duration(seconds: 2)),
    );
  }

  void _toggleAuthMode() {
    setState(() => isLogin = !isLogin);
  }

  void _triggerExitToWelcome() {
    _arrowController.stop();
    _mainController.reverse().then((_) {
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/welcome');
      }
    });
  }

  void _handleGoogleSignIn() async {
    void showLoadingDialog(String message) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => AlertDialog(
          content: Row(
            children: [
              const CircularProgressIndicator(),
              const SizedBox(width: 16),
              Expanded(child: Text(message)),
            ],
          ),
        ),
      );
    }

    void safePopDialog() {
      if (Navigator.canPop(context)) Navigator.pop(context);
    }

    try {
      showLoadingDialog("Đang đăng nhập bằng Google...");

      // FIXED: Sau signInWithGoogle, check onboarding tương tự login
      final userCred = await _authService.signInWithGoogle();

      safePopDialog();

      await Future.delayed(const Duration(milliseconds: 800));

      final user = FirebaseAuth.instance.currentUser;
      if (user != null && context.mounted) {
        final userData = await _authService.fetchUserData(user.uid);
        final bool isOnboardingNeeded = userData['is_onboarding_needed'] ?? true; // Mặc định true cho Google mới
        final String userRole = userData['role'] ?? 'UNASSIGNED';

        _showSnack("🎉 Đăng nhập Google thành công!");

        if (isOnboardingNeeded || userRole == 'UNASSIGNED') {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const OnboardingFlowScreen()),
          );
        } else {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const HomeScreen()),
          );
        }
      } else {
        _showSnack("⚠️ Đăng nhập Google thất bại!");
      }
    } catch (e) {
      if (Navigator.canPop(context)) Navigator.pop(context);
      if (e.toString().contains('canceled')) {
        _showSnack("Đăng nhập Google đã bị hủy.");
      } else {
        _showSnack("❌ Lỗi Google Sign-In: $e");
      }
    }
  }

  @override
  void dispose() {
    _mainController.dispose();
    _arrowController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPassword.dispose();
    _displayNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFF8F0),
      body: Stack(
        children: [
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 250,
              height: 250,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.greenAccent, Colors.green],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.all(Radius.circular(200)),
              ),
            ),
          ),
          Positioned(
            left: -100,
            bottom: -150,
            child: Container(
              width: 220,
              height: 220,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.greenAccent, Colors.green],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.all(Radius.circular(200)),
              ),
            ),
          ),
          Positioned(
            bottom: 50,
            left: 200,
            child: Container(
              width: 100,
              height: 100,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.green, Colors.transparent],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.all(Radius.circular(200)),
              ),
            ),
          ),
          SlideTransition(
            position: _offsetAnimation,
            child: SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      Image.asset('assets/images/logo.png', width: 150, height: 150),
                      AnimatedSize(
                        duration: const Duration(milliseconds: 600),
                        curve: Curves.easeInOut,
                        clipBehavior: Clip.hardEdge,
                        child: ClipRect(
                          child: PageTransitionSwitcher(
                            duration: const Duration(milliseconds: 600),
                            transitionBuilder:
                                (child, animation, secondaryAnimation) =>
                                FadeTransition(
                                  opacity: animation,
                                  child: SizeTransition(
                                    sizeFactor: animation,
                                    axis: Axis.vertical,
                                    child: child,
                                  ),
                                ),
                            child: isLogin
                                ? _buildLoginCard(key: const ValueKey("login"))
                                : _buildRegisterCard(
                              key: const ValueKey("register"),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 600),
                        curve: Curves.easeInOut,
                        height: 30,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            AnimatedScale(
                              duration: const Duration(milliseconds: 600),
                              curve: Curves.easeInOut,
                              scale: isLogin ? 1.0 : 0.6,
                              child: Container(
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  color: isLogin ? Colors.greenAccent : Colors.grey.shade400,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            AnimatedScale(
                              duration: const Duration(milliseconds: 600),
                              curve: Curves.easeInOut,
                              scale: !isLogin ? 1.0 : 0.6,
                              child: Container(
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  color: !isLogin ? Colors.greenAccent : Colors.grey.shade400,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            top: 30,
            left: 30,
            child: IgnorePointer(
              ignoring: false,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () {
                  _arrowController.stop();
                  _triggerExitToWelcome();
                },
                child: AnimatedBuilder(
                  animation: _arrowController,
                  builder: (context, child) {
                    return Container(
                      width: 70,
                      height: 70,
                      alignment: Alignment.center,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          Opacity(
                            opacity: _haloOpacityAnimation.value,
                            child: Container(
                              width: _haloSizeAnimation.value,
                              height: _haloSizeAnimation.value,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.greenAccent.withOpacity(0.1),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.greenAccent.withOpacity(1),
                                    blurRadius: 20,
                                    spreadRadius: 5,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          Transform.scale(
                            scale: _scaleAnimation.value,
                            child: Container(
                              width: 55,
                              height: 55,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.transparent,
                              ),
                              child: const Icon(Icons.keyboard_arrow_down,
                                  size: 36, color: Colors.white),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoginCard({required Key key}) {
    return Card(
      key: key,
      elevation: 6,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Hello 👋",
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const Text("Sign in to your account"),
            const SizedBox(height: 20),

            // Email/SĐT
            _buildTextField("Email", Icons.person, _emailController),

            // Password chỉ hiện khi chọn email
            if (_inputType == 'email') ...[
              const SizedBox(height: 10),
              _buildTextField(
                "Password",
                Icons.lock,
                _passwordController,
                obscure: true,
              ),
              const SizedBox(height: 8),
              Text(
                "Forgot your Password?",
                textAlign: TextAlign.end,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
              ),
            ],

            const SizedBox(height: 20),
            _buildAuthButton("Login"),
            const SizedBox(height: 10),
            const Center(child: Text("Or Login using social media")),
            const SizedBox(height: 10),
            _buildSocialRow(),
            const SizedBox(height: 10),
            _buildSwitchText("Don't have an account? ", "Register Now"),
          ],
        ),
      ),
    );
  }

  Widget _buildRegisterCard({required Key key}) {
    return Card(
      key: key,
      elevation: 6,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Create Account ✨",
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),

            // Email hoặc SĐT
            _buildTextField("Email", Icons.person, _emailController),

            // Nếu là email thì có password
            if (_inputType == 'email') ...[
              const SizedBox(height: 10),
              _buildTextField(
                "Password",
                Icons.lock,
                _passwordController,
                obscure: true,
              ),
              const SizedBox(height: 10),
              _buildTextField(
                "Confirm Password",
                Icons.lock_outline,
                _confirmPassword,
                obscure: true,
              ),
            ],

            const SizedBox(height: 10),
            Row(
              children: [
                Checkbox(value: true, onChanged: (f) {}),
                const Expanded(
                  child: Text(
                    "I have read and agree to the Terms & Conditions",
                    style: TextStyle(fontSize: 13),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),
            _buildAuthButton("Register Now"),
            const SizedBox(height: 10),
            const Center(child: Text("Or Register using social media")),
            const SizedBox(height: 10),
            _buildSocialRow(),
            const SizedBox(height: 10),
            _buildSwitchText("Already have an account? ", "Login"),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(
      String hint,
      IconData icon,
      TextEditingController controller, {
        bool obscure = false,
      }) {
    // Xác định đây có phải là trường nhập email/số điện thoại không
    bool isEmailOrPhoneField = controller == _emailController;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: isEmailOrPhoneField
          ? Row(
        children: [
          // Dropdown chọn loại đăng nhập
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade400),
              borderRadius: BorderRadius.circular(12),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _inputType,
                items: const [
                  DropdownMenuItem(value: 'email', child: Text('Email')),
                  DropdownMenuItem(value: 'phone', child: Text('SĐT')),
                ],
                onChanged: (value) {
                  setState(() {
                    _inputType = value!;
                    _emailController.clear(); // reset khi đổi loại
                    _passwordController.clear();
                    _confirmPassword.clear();
                  });
                },
                icon: const Icon(Icons.arrow_drop_down),
              ),
            ),
          ),
          const SizedBox(width: 10),

          // TextField chính
          Expanded(
            child: TextField(
              controller: controller,
              obscureText: obscure,
              keyboardType: _inputType == 'phone'
                  ? TextInputType.phone
                  : TextInputType.emailAddress,
              decoration: InputDecoration(
                prefixIcon: Icon(
                  _inputType == 'phone' ? Icons.phone : Icons.email,
                  color: Colors.greenAccent,
                ),
                hintText: _inputType == 'phone'
                    ? 'Nhập số điện thoại'
                    : 'Nhập email',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      )
          : TextField(
        controller: controller,
        obscureText: obscure,
        decoration: InputDecoration(
          prefixIcon: Icon(icon, color: Colors.greenAccent),
          hintText: hint,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  Widget _buildAuthButton(String text) {
    return ElevatedButton(
      onPressed: _handleAuth,
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.greenAccent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        minimumSize: const Size(double.infinity, 50),
      ),
      child: Text(
        text,
        style: const TextStyle(color: Colors.white, fontSize: 16),
      ),
    );
  }

  Widget _buildSocialRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // 1. Facebook
        InkWell(
          onTap: () {
            _showSnack("Tính năng Facebook chưa được triển khai.");
          },
          child: const Icon(Icons.facebook, color: Colors.blue, size: 36),
        ),
        const SizedBox(width: 24),

        // 2. Google (Đã thêm)
        InkWell(
          onTap: _handleGoogleSignIn,
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.grey.shade300)
            ),
            child: Center(
              child: Icon(Icons.g_mobiledata, color: Colors.red.shade600, size: 36),
            ),
          ),
        ),
        const SizedBox(width: 24),

        // 3. Email (Hoặc bất kỳ Icon thứ 3 nào)
        InkWell(
          onTap: () {
            _showSnack("Tính năng khác chưa được triển khai.");
          },
          child: const Icon(Icons.alternate_email, color: Colors.lightBlue, size: 36),
        ),
      ],
    );
  }

  Widget _buildSwitchText(String prefix, String action) {
    return Center(
      child: InkWell(
        onTap: _toggleAuthMode,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
          child: RichText(
            text: TextSpan(
              text: prefix,
              style: const TextStyle(
                color: Colors.black,
                fontSize: 16,
              ),
              children: [
                TextSpan(
                  text: action,
                  style: const TextStyle(
                    color: Colors.greenAccent,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
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