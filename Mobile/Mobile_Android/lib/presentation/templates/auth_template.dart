import 'dart:async';
import 'package:flutter/material.dart';

class AuthTemplate extends StatefulWidget {
  const AuthTemplate({super.key, required this.child});
  final Widget child;

  @override
  State<AuthTemplate> createState() => _AuthTemplateState();
}

class _AuthTemplateState extends State<AuthTemplate> with TickerProviderStateMixin {
  // Controller cho Slide Transition của màn hình
  late AnimationController _mainController;
  late Animation<Offset> _offsetAnimation;

  // Controller cho Looping Animation của mũi tên
  late AnimationController _arrowController;
  late Animation<double> _scaleAnimation;

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
    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _offsetAnimation = Tween<Offset>(
      begin: const Offset(0.0, 1.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _mainController, curve: Curves.easeInOutCubic));
    _mainController.forward();

    _arrowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 0.9, end: 1.1).animate(
      CurvedAnimation(parent: _arrowController, curve: Curves.easeInOut),
    );

    dx2 = speed; dy2 = -speed; x2 = 50; y2 = 530;
    _borderFlashController2 = AnimationController(vsync: this, duration: const Duration(milliseconds: 250));
    _borderFlashAnimation2 = Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _borderFlashController2, curve: Curves.easeOut));
    _borderFlashController2.addStatusListener((status) { if (status == AnimationStatus.completed) _borderFlashController2.reverse(); });

    dx3 = -speed; dy3 = speed; x3 = 260; y3 = 80;
    _borderFlashController3 = AnimationController(vsync: this, duration: const Duration(milliseconds: 250));
    _borderFlashAnimation3 = Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _borderFlashController3, curve: Curves.easeOut));
    _borderFlashController3.addStatusListener((status) { if (status == AnimationStatus.completed) _borderFlashController3.reverse(); });

    dx4 = -speed; dy4 = -speed; x4 = 300; y4 = 400;
    _borderFlashController4 = AnimationController(vsync: this, duration: const Duration(milliseconds: 250));
    _borderFlashAnimation4 = Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _borderFlashController4, curve: Curves.easeOut));
    _borderFlashController4.addStatusListener((status) { if (status == AnimationStatus.completed) _borderFlashController4.reverse(); });

    dx5 = speed; dy5 = speed; x5 = 100; y5 = 200;
    _borderFlashController5 = AnimationController(vsync: this, duration: const Duration(milliseconds: 250));
    _borderFlashAnimation5 = Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _borderFlashController5, curve: Curves.easeOut));
    _borderFlashController5.addStatusListener((status) { if (status == AnimationStatus.completed) _borderFlashController5.reverse(); });

    dx6 = -speed; dy6 = speed; x6 = 200; y6 = 300;
    _borderFlashController6 = AnimationController(vsync: this, duration: const Duration(milliseconds: 250));
    _borderFlashAnimation6 = Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _borderFlashController6, curve: Curves.easeOut));
    _borderFlashController6.addStatusListener((status) { if (status == AnimationStatus.completed) _borderFlashController6.reverse(); });

    _timer = Timer.periodic(const Duration(milliseconds: 16), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        _updateBall(x2, y2, dx2, dy2, _borderFlashController2, (nx, ny, ndx, ndy) { x2=nx; y2=ny; dx2=ndx; dy2=ndy; });
        _updateBall(x3, y3, dx3, dy3, _borderFlashController3, (nx, ny, ndx, ndy) { x3=nx; y3=ny; dx3=ndx; dy3=ndy; });
        _updateBall(x4, y4, dx4, dy4, _borderFlashController4, (nx, ny, ndx, ndy) { x4=nx; y4=ny; dx4=ndx; dy4=ndy; });
        _updateBall(x5, y5, dx5, dy5, _borderFlashController5, (nx, ny, ndx, ndy) { x5=nx; y5=ny; dx5=ndx; dy5=ndy; });
        _updateBall(x6, y6, dx6, dy6, _borderFlashController6, (nx, ny, ndx, ndy) { x6=nx; y6=ny; dx6=ndx; dy6=ndy; });
      });
    });
  }

  void _updateBall(double x, double y, double dx, double dy, AnimationController flash, Function(double, double, double, double) applyChanges) {
    x += dx; y += dy;
    final w = MediaQuery.of(context).size.width;
    final h = MediaQuery.of(context).size.height;
    if (x <= 0 || x >= w - 60) { dx = -dx; flash.forward(from: 0); }
    if (y <= 0 || y >= h - 60) { dy = -dy; flash.forward(from: 0); }
    applyChanges(x, y, dx, dy);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _mainController.dispose();
    _arrowController.dispose();
    _borderFlashController2.dispose();
    _borderFlashController3.dispose();
    _borderFlashController4.dispose();
    _borderFlashController5.dispose();
    _borderFlashController6.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFF8F0),
      body: Stack(
        children: [
          Positioned(top: -100, right: -100, child: _buildGradientCircle(const [Colors.greenAccent, Colors.green], 250)),
          Positioned(left: -100, bottom: -120, child: _buildGradientCircle(const [Colors.greenAccent, Colors.lightGreen], 220)),
          Positioned(bottom: 50, left: 250, child: _buildGradientCircle(const [Colors.green, Colors.transparent], 100)),
          Positioned(top: 200, left: -50, child: _buildGradientCircle(const [Colors.green, Colors.lightGreen], 150)),
          
          AnimatedBuilder(animation: _borderFlashController2, builder: (ctx, child) => Positioned(left: x2, top: y2, child: _buildBallWidget(_borderFlashAnimation2, Colors.amberAccent))),
          AnimatedBuilder(animation: _borderFlashController3, builder: (ctx, child) => Positioned(left: x3, top: y3, child: _buildBallWidget(_borderFlashAnimation3, Colors.cyan))),
          AnimatedBuilder(animation: _borderFlashController4, builder: (ctx, child) => Positioned(left: x4, top: y4, child: _buildBallWidget(_borderFlashAnimation4, Colors.greenAccent))),
          AnimatedBuilder(animation: _borderFlashController5, builder: (ctx, child) => Positioned(left: x5, top: y5, child: _buildBallWidget(_borderFlashAnimation5, Colors.blueGrey))),
          AnimatedBuilder(animation: _borderFlashController6, builder: (ctx, child) => Positioned(left: x6, top: y6, child: _buildBallWidget(_borderFlashAnimation6, Colors.pinkAccent))),

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
                      const SizedBox(height: 20),
                      widget.child,
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
                      onTap: _mainController.isAnimating ? null : () => Navigator.of(context).pushReplacementNamed('/welcome'),
                      child: AnimatedBuilder(
                        animation: _arrowController,
                        builder: (context, child) {
                          final double scale = _scaleAnimation.value;
                          final double backgroundOpacity = 0.12 + (scale - 0.9) * 1.6;
                          return Container(
                            width: 70, height: 70, alignment: Alignment.center,
                            child: Transform.scale(
                              scale: scale,
                              child: Container(
                                width: 55, height: 55,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.black.withValues(alpha: backgroundOpacity.clamp(0.0, 1.0)),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.white.withValues(alpha: (0.3 + (scale - 0.9) * 2.2).clamp(0.0, 1.0)),
                                      blurRadius: 8 + (scale - 0.9) * 30,
                                      spreadRadius: (scale - 0.9) * 14,
                                    ),
                                  ],
                                  border: Border.all(color: Colors.white, width: 2 + (scale - 0.9) * 4),
                                ),
                                child: const Icon(Icons.keyboard_arrow_down_rounded, size: 32, color: Colors.white),
                              ),
                            ),
                          );
                        }
                      ),
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

  Widget _buildGradientCircle(List<Color> colors, double size) {
    return Container(
      width: size, height: size,
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: colors, begin: Alignment.topLeft, end: Alignment.bottomRight),
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _buildBallWidget(Animation<double> flashAnim, Color color) {
    return Container(
      width: 80, height: 80,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.3),
        boxShadow: [
          BoxShadow(
            color: Colors.white.withValues(alpha: (0.3 + flashAnim.value * 0.7).clamp(0.0, 1.0)),
            blurRadius: 10 + flashAnim.value * 18,
            spreadRadius: 1 + flashAnim.value * 3,
          ),
        ],
        border: Border.all(
          width: 2 + flashAnim.value * 3,
          color: Colors.white.withValues(alpha: (0.4 + flashAnim.value * 0.6).clamp(0.0, 1.0)),
        ),
      ),
    );
  }
}