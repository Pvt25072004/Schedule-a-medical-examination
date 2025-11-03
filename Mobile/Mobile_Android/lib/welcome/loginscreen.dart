import 'dart:async';
import 'package:animations/animations.dart';
import 'package:clinic_booking_system/screens/dashboard.dart';
import 'package:clinic_booking_system/service/auth_service.dart';
import 'package:clinic_booking_system/service/email_service.dart';
import 'package:clinic_booking_system/subscreens/password/emailforpass.dart';
import 'package:clinic_booking_system/utils/otp_utils.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'onboarding.dart';

class Loginscreen extends StatefulWidget {
  const Loginscreen({super.key, required this.isLogin});

  final bool isLogin;

  @override
  State<Loginscreen> createState() => _Loginscreen();
}

class _Loginscreen extends State<Loginscreen> with TickerProviderStateMixin {
  final _authService = AuthService();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPassword = TextEditingController();
  final _displayNameController = TextEditingController();
  String _inputType = 'email';
  bool _agreed = false;

  late bool isLogin;

  // Controller cho Slide Transition của màn hình
  late AnimationController _mainController;
  late Animation<Offset> _offsetAnimation;

  // Controller cho Looping Animation của mũi tên
  late AnimationController _arrowController;
  late Animation<double> _scaleAnimation;

  // Tọa độ cho quả bóng
  late AnimationController _borderFlashController;

  late double x2, y2, dx2, dy2;
  late double x3, y3, dx3, dy3;
  late double x4, y4, dx4, dy4;
  late double x5, y5, dx5, dy5;
  late double x6, y6, dx6, dy6;

  late AnimationController _borderFlashController2;
  late AnimationController _borderFlashController3;
  late AnimationController _borderFlashController4;
  late AnimationController _borderFlashController5;
  late AnimationController _borderFlashController6;

  late Animation<double> _borderFlashAnimation2;
  late Animation<double> _borderFlashAnimation3;
  late Animation<double> _borderFlashAnimation4;
  late Animation<double> _borderFlashAnimation5;
  late Animation<double> _borderFlashAnimation6;

  Timer? _timer;

  final double speed = 1.2;

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
    ).animate(
        CurvedAnimation(parent: _mainController, curve: Curves.easeInOutCubic));
    _mainController.forward();

    // ====================== 2. Khởi tạo Arrow Controller (Looping) ======================
    _arrowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(
      begin: 0.9,
      end: 1.1,
    ).animate(
      CurvedAnimation(parent: _arrowController, curve: Curves.easeInOut),
    );

    // ====================== 3. Khởi tạo bóng bay ======================
    // ====================== Bóng 2 ======================
    dx2 = speed;
    dy2 = -speed;
    x2 = 50;
    y2 = 530;

    _borderFlashController2 = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );

    _borderFlashAnimation2 = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _borderFlashController2,
        curve: Curves.easeOut,
      ),
    );

    _borderFlashController2.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _borderFlashController2.reverse();
      }
    });

    // ====================== Bóng 3 ======================
    dx3 = -speed;
    dy3 = speed;
    x3 = 260;
    y3 = 80;

    _borderFlashController3 = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );

    _borderFlashAnimation3 = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _borderFlashController3,
        curve: Curves.easeOut,
      ),
    );

    _borderFlashController3.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _borderFlashController3.reverse();
      }
    });

    // ====================== Bóng 4 ======================
    dx4 = -speed;
    dy4 = -speed;
    x4 = 300;
    y4 = 400;

    _borderFlashController4 = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );

    _borderFlashAnimation4 = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _borderFlashController4,
        curve: Curves.easeOut,
      ),
    );

    _borderFlashController4.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _borderFlashController4.reverse();
      }
    });

    // ====================== Bóng 5 ======================
    dx5 = speed;
    dy5 = speed;
    x5 = 100;
    y5 = 200;

    _borderFlashController5 = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );

    _borderFlashAnimation5 = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _borderFlashController5,
        curve: Curves.easeOut,
      ),
    );

    _borderFlashController5.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _borderFlashController5.reverse();
      }
    });

    // ====================== Bóng 6 ======================
    dx6 = -speed;
    dy6 = speed;
    x6 = 200;
    y6 = 300;

    _borderFlashController6 = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );

    _borderFlashAnimation6 = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _borderFlashController6,
        curve: Curves.easeOut,
      ),
    );

    _borderFlashController6.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _borderFlashController6.reverse();
      }
    });

    _timer = Timer.periodic(const Duration(milliseconds: 16), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        _updateBall(
          x2,
          y2,
          dx2,
          dy2,
          _borderFlashController2,
          (newX, newY, newDX, newDY) {
            x2 = newX;
            y2 = newY;
            dx2 = newDX;
            dy2 = newDY;
          },
        );

        _updateBall(
          x3,
          y3,
          dx3,
          dy3,
          _borderFlashController3,
          (newX, newY, newDX, newDY) {
            x3 = newX;
            y3 = newY;
            dx3 = newDX;
            dy3 = newDY;
          },
        );

        _updateBall(
          x4,
          y4,
          dx4,
          dy4,
          _borderFlashController4,
          (newX, newY, newDX, newDY) {
            x4 = newX;
            y4 = newY;
            dx4 = newDX;
            dy4 = newDY;
          },
        );

        _updateBall(
          x5,
          y5,
          dx5,
          dy5,
          _borderFlashController5,
          (newX, newY, newDX, newDY) {
            x5 = newX;
            y5 = newY;
            dx5 = newDX;
            dy5 = newDY;
          },
        );

        _updateBall(
          x6,
          y6,
          dx6,
          dy6,
          _borderFlashController6,
          (newX, newY, newDX, newDY) {
            x6 = newX;
            y6 = newY;
            dx6 = newDX;
            dy6 = newDY;
          },
        );
      });
    });
  }

  void _updateBall(
    double x,
    double y,
    double dx,
    double dy,
    AnimationController flash,
    Function(double, double, double, double) applyChanges,
  ) {
    x += dx;
    y += dy;

    final w = MediaQuery.of(context).size.width;
    final h = MediaQuery.of(context).size.height;

    if (x <= 0 || x >= w - 60) {
      dx = -dx;
      flash.forward(from: 0);
    }
    if (y <= 0 || y >= h - 60) {
      dy = -dy;
      flash.forward(from: 0);
    }

    applyChanges(x, y, dx, dy);
  }

  void _showTermsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Điều khoản & Điều kiện"),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Chào mừng bạn đến với ứng dụng Clinic Booking System!\n\n"
                "Bằng việc sử dụng ứng dụng này, bạn đồng ý với các điều khoản và điều kiện sau:\n\n"
                "1. Quyền sử dụng: Ứng dụng được cung cấp miễn phí cho mục đích đặt lịch khám bệnh. Bạn không được sao chép, phân phối hoặc sửa đổi nội dung mà không có sự cho phép.\n\n"
                "2. Bảo mật thông tin: Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo quy định GDPR và luật bảo vệ dữ liệu Việt Nam. Dữ liệu chỉ được sử dụng để cung cấp dịch vụ.\n\n"
                "3. Trách nhiệm: Người dùng chịu trách nhiệm về tính chính xác của thông tin cung cấp. Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng ứng dụng.\n\n"
                "4. Thay đổi điều khoản: Chúng tôi có quyền thay đổi điều khoản này bất cứ lúc nào. Việc tiếp tục sử dụng ứng dụng sau thay đổi có nghĩa là bạn chấp nhận.\n\n"
                "5. Liên hệ: Nếu có thắc mắc, vui lòng liên hệ support@clinicbooking.com.\n\n"
                "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi! (Nội dung mẫu dài để demo scroll)",
                style: TextStyle(fontSize: 14),
              ),
              // Thêm nội dung dài hơn nếu cần để test scroll
              ...List.generate(
                  10,
                  (index) => Text(
                      "Đoạn văn ${index + 1}: Nội dung chi tiết về điều khoản số ${index + 1}. Đây là nội dung mẫu để làm dài popup.\n\n")),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Đóng"),
          ),
        ],
      ),
    );
  }

  void _handleAuth() async {
    try {
      final input = _emailController.text.trim();
      final password = _passwordController.text.trim();
      final confirm = _confirmPassword.text.trim();
      final displayName = _displayNameController.text.trim();

      if (!isLogin && !_agreed) {
        _showSnack("⚠️ Vui lòng đồng ý với Điều khoản & Điều kiện!");
        return;
      }

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
          final UserCredential createdCred =
              await _authService.signUpWithEmail(input, password, displayName);

          if (createdCred.user != null) {
            await _authService.updateProfile(createdCred.user!.uid, {
              'is_onboarding_needed': true,
              'role': 'UNASSIGNED', // Đảm bảo role được set cho fetchUserData
              // ... (có thể update thêm displayName, phone nếu cần)
            });
          }

          final cred = await _authService.signInWithEmail(
              input, password); // SỬA ĐỔI LỚN
          safePopDialog();

          final uid = cred.user?.uid;
          if (uid != null) {
            await _authService
                .updateProfile(uid, {'is_onboarding_needed': true});
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

        userCred =
            await _authService.verifyOtpAndSignIn(verificationId, smsCode);
      } else {
        if (!isValidEmail(input)) {
          safePopDialog();
          _showSnack("❌ Email không hợp lệ!");
          return;
        }

        userCred = await _authService.signInWithEmail(input, password);
      }

      safePopDialog();

      final user = FirebaseAuth.instance.currentUser;
      if (user != null && context.mounted) {
        final userData =
            await _authService.fetchUserData(user.uid); // FIXED: Fetch từ DB
        final bool isOnboardingNeeded =
            userData['is_onboarding_needed'] ?? false;
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
            MaterialPageRoute(builder: (_) => const MainScreen()),
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
    _mainController.reverse().then((_) {
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/welcome');
      }
    });
  }

  void _navigateToForgotPassword() {
    Navigator.pushNamed(context, '/forgot_password');
  }

  //Đăng nhập bằng GooGle Signin
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

      final user = FirebaseAuth.instance.currentUser;
      if (user != null && context.mounted) {
        final userData = await _authService.fetchUserData(user.uid);
        final bool isOnboardingNeeded = userData['is_onboarding_needed'] ??
            true; // Mặc định true cho Google mới
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
            MaterialPageRoute(builder: (_) => const MainScreen()),
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
    _timer?.cancel();
    _mainController.dispose();
    _arrowController.dispose();
    _borderFlashController.dispose();
    _borderFlashController2.dispose();
    _borderFlashController3.dispose();
    _borderFlashController4.dispose();
    _borderFlashController5.dispose();
    _borderFlashController6.dispose();
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
            bottom: -120,
            child: Container(
              width: 220,
              height: 220,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.greenAccent, Colors.lightGreen],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.all(Radius.circular(200)),
              ),
            ),
          ),
          Positioned(
            bottom: 50,
            left: 250,
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
          Positioned(
            top: 200,
            left: -50,
            child: Container(
              width: 150,
              height: 150,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.green, Colors.lightGreen],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.all(Radius.circular(200)),
              ),
            ),
          ),
          AnimatedBuilder(
            animation: _borderFlashController2,
            builder: (context, child) {
              return Positioned(
                left: x2,
                top: y2,
                child: _buildBall(_borderFlashAnimation2, Colors.amberAccent),
              );
            },
          ),
          AnimatedBuilder(
            animation: _borderFlashController3,
            builder: (context, child) {
              return Positioned(
                left: x3,
                top: y3,
                child: _buildBall(_borderFlashAnimation3, Colors.cyan),
              );
            },
          ),
          AnimatedBuilder(
            animation: _borderFlashController4,
            builder: (context, child) {
              return Positioned(
                left: x4,
                top: y4,
                child: _buildBall(_borderFlashAnimation4, Colors.greenAccent),
              );
            },
          ),
          AnimatedBuilder(
            animation: _borderFlashController5,
            builder: (context, child) {
              return Positioned(
                left: x5,
                top: y5,
                child: _buildBall(_borderFlashAnimation5, Colors.blueGrey),
              );
            },
          ),
          AnimatedBuilder(
            animation: _borderFlashController6,
            builder: (context, child) {
              return Positioned(
                left: x6,
                top: y6,
                child: _buildBall(_borderFlashAnimation6, Colors.pinkAccent),
              );
            },
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
                      Image.asset('assets/images/logo.png',
                          width: 150, height: 150),
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
                                  color: isLogin
                                      ? Colors.greenAccent
                                      : Colors.grey.shade400,
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
                                  color: !isLogin
                                      ? Colors.greenAccent
                                      : Colors.grey.shade400,
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
            child: AnimatedBuilder(
              animation: _mainController,
              builder: (context, child) {
                return Opacity(
                  opacity: _mainController.value,
                  child: IgnorePointer(
                    ignoring: _mainController.value < 0.01,
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: _mainController.isAnimating
                          ? null
                          : _triggerExitToWelcome,
                      child: AnimatedBuilder(
                          animation: _arrowController,
                          builder: (context, child) {
                            final double scale = _scaleAnimation.value;

                            // scale = 0.9 → độ sáng nền thấp
                            // scale = 1.1 → nền sáng hơn
                            final double backgroundOpacity =
                                0.12 + (scale - 0.9) * 1.6;

                            return Container(
                              width: 70,
                              height: 70,
                              alignment: Alignment.center,
                              child: Transform.scale(
                                scale: scale,
                                child: Container(
                                  width: 55,
                                  height: 55,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: Colors.black.withOpacity(
                                        backgroundOpacity), // nền tối để nổi avatar
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.white.withOpacity(
                                          0.3 +
                                              (scale - 0.9) *
                                                  2.2, // scale to, glow sáng gấp đôi
                                        ),
                                        blurRadius: 8 +
                                            (scale - 0.9) *
                                                30, // tăng blur khi to để cảm giác nở sáng
                                        spreadRadius: (scale - 0.9) * 14,
                                      ),
                                    ],
                                    border: Border.all(
                                      color: Colors.white,
                                      width: 2 +
                                          (scale - 0.9) *
                                              4, // border trắng sáng mạnh khi scale max
                                    ),
                                  ),
                                  child: const Icon(
                                    Icons.keyboard_arrow_down_rounded,
                                    size: 32,
                                    color: Colors
                                        .white, // icon trắng để đồng bộ ánh sáng
                                  ),
                                ),
                              ),
                            );
                          }),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoginCard({required Key key}) {
    return Card(
      key: key,
      color: Colors.white.withOpacity(0.8),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.greenAccent.withOpacity(0.5), width: 2),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Xin chào 👋",
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const Text("Đăng nhập vào tài khoản của bạn"),
            const SizedBox(height: 20),

            // Email/SĐT
            _buildTextField("Email/SĐT", Icons.person, _emailController),

            // Password chỉ hiện khi chọn email
            if (_inputType == 'email') ...[
              const SizedBox(height: 10),
              _buildTextField(
                "Mật khẩu",
                Icons.lock,
                _passwordController,
                obscure: true,
              ),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ForgotPasswordScreen(),
                    ),
                  );
                },
                child: Text(
                  "Quên mật khẩu?",
                  textAlign: TextAlign.end,
                  style: TextStyle(color: Colors.greenAccent, fontSize: 15),
                ),
              ),
            ],

            const SizedBox(height: 20),
            _buildAuthButton("Đăng nhập"),
            const SizedBox(height: 10),
            const Center(child: Text("Hoặc đăng nhập bằng mạng xã hội")),
            const SizedBox(height: 10),
            _buildSocialRow(),
            const SizedBox(height: 10),
            _buildSwitchText("Chưa có tài khoản? ", "Đăng ký ngay"),
          ],
        ),
      ),
    );
  }

  Widget _buildRegisterCard({required Key key}) {
    return Card(
      key: key,
      color: Colors.white.withOpacity(0.8),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.greenAccent.withOpacity(0.5), width: 2),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Tạo tài khoản ✨",
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),

            // Email hoặc SĐT
            _buildTextField("Email", Icons.email, _emailController),

            // Nếu là email thì có password
            if (_inputType == 'email') ...[
              const SizedBox(height: 10),
              _buildTextField(
                "Mật khẩu",
                Icons.lock,
                _passwordController,
                obscure: true,
              ),
              const SizedBox(height: 10),
              _buildTextField(
                "Xác nhận mật khẩu",
                Icons.lock_outline,
                _confirmPassword,
                obscure: true,
              ),
            ],

            const SizedBox(height: 10),
            Row(
              children: [
                Checkbox(
                  value: _agreed,
                  onChanged: (value) {
                    setState(() {
                      _agreed = value!;
                    });
                  },
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: _showTermsDialog,
                    child: const Text(
                      "Tôi đã đọc và đồng ý với Điều khoản & Điều kiện",
                      style: TextStyle(
                          fontSize: 13,
                          color: Colors.blue,
                          decoration: TextDecoration.underline),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),
            _buildAuthButton("Đăng ký ngay"),
            const SizedBox(height: 10),
            const Center(child: Text("Hoặc đăng ký bằng mạng xã hội")),
            const SizedBox(height: 10),
            _buildSocialRow(),
            const SizedBox(height: 10),
            _buildSwitchText("Đã có tài khoản? ", "Đăng nhập"),
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
          ? (isLogin
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
                            DropdownMenuItem(
                                value: 'email', child: Text('Email')),
                            DropdownMenuItem(
                                value: 'phone', child: Text('SĐT')),
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
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    prefixIcon: Icon(Icons.email, color: Colors.greenAccent),
                    hintText: 'Nhập email',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ))
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
                border: Border.all(color: Colors.grey.shade300)),
            child: Center(
              child: Icon(Icons.g_mobiledata,
                  color: Colors.red.shade600, size: 36),
            ),
          ),
        ),
        const SizedBox(width: 24),

        // 3. Email (Hoặc bất kỳ Icon thứ 3 nào)
        InkWell(
          onTap: () {
            _showSnack("Tính năng khác chưa được triển khai.");
          },
          child: const Icon(Icons.alternate_email,
              color: Colors.lightBlue, size: 36),
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

  Widget _buildBall(Animation<double> flashAnim, Color color) {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withOpacity(0.3),
        boxShadow: [
          BoxShadow(
            color: Colors.white.withOpacity(0.3 + flashAnim.value * 0.7),
            blurRadius: 10 + flashAnim.value * 18,
            spreadRadius: 1 + flashAnim.value * 3,
          ),
        ],
        border: Border.all(
          width: 2 + flashAnim.value * 3,
          color: Colors.white.withOpacity(0.4 + flashAnim.value * 0.6),
        ),
      ),
    );
  }
}
