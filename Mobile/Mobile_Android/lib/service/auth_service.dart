import 'dart:async';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/material.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final DatabaseReference _db = FirebaseDatabase.instance.ref();
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  bool _isInitialized = false;

  /// ---------------- Email / Password ----------------
  Future<UserCredential> signUpWithEmail(
      String email,
      String password,
      String displayName,
      ) async {
    try {
      final cred = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      await cred.user?.sendEmailVerification();

      final fcmToken = await FirebaseMessaging.instance.getToken();

      // FIXED: Thêm is_onboarding_needed = true khi tạo user mới
      await _db.child('users/${cred.user?.uid}').set({
        'email': email,
        'displayName': displayName.isNotEmpty
            ? displayName
            : email.split('@')[0],
        'photoUrl': '',
        'bio': '',
        'fcmToken': fcmToken,
        'is_onboarding_needed': true, // FIXED: Set onboarding true
        'role': 'UNASSIGNED', // FIXED: Role mặc định
        'createdAt': ServerValue.timestamp,
      });

      return cred;
    } catch (e) {
      debugPrint('🔥 Lỗi đăng ký email: $e');
      throw Exception('Đăng ký thất bại: $e');
    }
  }

  Future<UserCredential> signInWithEmail(String email, String password) async {
    try {
      final cred = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final fcmToken = await FirebaseMessaging.instance.getToken();
      await _db.child('users/${cred.user?.uid}/fcmToken').set(fcmToken);

      return cred;
    } catch (e) {
      debugPrint('🔥 Lỗi đăng nhập email: $e');
      throw Exception('Đăng nhập thất bại: $e');
    }
  }

  /// ---------------- Phone (OTP) ----------------
  Future<String> sendOtpPhone(String phoneNumber) async {
    final completer = Completer<String>();

    try {
      await _auth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        timeout: const Duration(seconds: 60),
        verificationCompleted: (PhoneAuthCredential credential) async {
          final userCred = await _auth.signInWithCredential(credential);
          final fcmToken = await FirebaseMessaging.instance.getToken();
          await _db.child('users/${userCred.user?.uid}/fcmToken').set(fcmToken);

          debugPrint('✅ OTP auto-verified');
          completer.complete('auto-verified');
        },
        verificationFailed: (FirebaseAuthException e) {
          debugPrint('❌ OTP failed: ${e.message}');
          completer.completeError(Exception(_getOtpErrorMessage(e.code)));
        },
        codeSent: (String verificationId, int? resendToken) {
          debugPrint('📩 OTP đã gửi, verificationId: $verificationId');
          completer.complete(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          if (!completer.isCompleted) completer.complete(verificationId);
        },
      );

      return completer.future;
    } catch (e) {
      throw Exception('Không thể gửi OTP: $e');
    }
  }

  // Trong file: lib/service/auth_service.dart

  Future<UserCredential> verifyOtpAndSignIn(
      String verificationId,
      String smsCode,
      ) async {
    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: smsCode,
      );

      final userCred = await _auth.signInWithCredential(credential);
      final uid = userCred.user?.uid;
      if (uid == null) throw Exception("UID is null after phone sign-in.");

      final fcmToken = await FirebaseMessaging.instance.getToken();
      final userRef = _db.child('users/$uid');
      final snapshot = await userRef.get();

      final phoneData = {
        'phone': userCred.user?.phoneNumber ?? '',
        'displayName': userCred.user?.displayName ?? 'Người dùng',
        'photoUrl': userCred.user?.photoURL ?? '',
        'fcmToken': fcmToken,
        // KHÔNG BAO GỒM is_onboarding_needed và role
      };

      if (snapshot.exists) {
        // 🎯 FIX: USER CŨ ĐĂNG NHẬP LẠI (Chỉ update các thông tin mới, giữ nguyên cờ trạng thái)
        await userRef.update(phoneData);
      } else {
        // USER MỚI (Cần set các cờ trạng thái lần đầu)
        await userRef.set({
          'phone': userCred.user?.phoneNumber ?? '',
          'displayName': userCred.user?.displayName ?? '',
          'photoUrl': userCred.user?.photoURL ?? '',
          'fcmToken': fcmToken,
          'bio': '',
          'is_onboarding_needed': true, // Chỉ set TRUE cho user mới
          'role': 'UNASSIGNED',
          'createdAt': ServerValue.timestamp,
        });
      }

      return userCred;
    } catch (e) {
      debugPrint('🔥 Lỗi xác thực OTP: $e');
      throw Exception('Xác thực OTP thất bại: $e');
    }
  }

  String _getOtpErrorMessage(String code) {
    switch (code) {
      case 'invalid-phone-number':
        return 'Số điện thoại không hợp lệ.';
      case 'quota-exceeded':
        return 'Đã vượt quá giới hạn gửi OTP. Thử lại sau.';
      case 'billing-not-enabled':
        return 'Chưa bật thanh toán trong Google Cloud Console.';
      default:
        return 'Lỗi không xác định ($code)';
    }
  }

  /// ---------------- Google Sign-In ----------------
  Future<void> _initGoogleSignIn() async {
    if (!_isInitialized) {
      _isInitialized = true;
    }
  }

  Future<UserCredential> signInWithGoogle() async {
    try {
      await _initGoogleSignIn();

      final googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        throw Exception('Người dùng đã hủy hoặc không chọn tài khoản Google.');
      }

      final googleAuth = await googleUser.authentication;

      final credential = GoogleAuthProvider.credential(
        idToken: googleAuth.idToken,
      );

      final userCred = await _auth.signInWithCredential(credential);

      // FIXED: Thêm is_onboarding_needed = true cho Google mới
      final fcmToken = await FirebaseMessaging.instance.getToken();
      final userRef = _db.child('users/${userCred.user?.uid}');
      final snapshot = await userRef.get();

      if (!snapshot.exists) {
        await userRef.set({
          'email': userCred.user?.email,
          'displayName': userCred.user?.displayName ?? '',
          'photoUrl': userCred.user?.photoURL ?? '',
          'bio': '',
          'fcmToken': fcmToken,
          'is_onboarding_needed': true, // FIXED: Set onboarding true
          'role': 'UNASSIGNED', // FIXED: Role mặc định
          'createdAt': ServerValue.timestamp,
        });
      } else {
        await userRef.child('fcmToken').set(fcmToken);
      }

      return userCred;
    } catch (e) {
      debugPrint('🔥 Lỗi đăng nhập Google: $e');
      throw Exception('Đăng nhập Google thất bại: $e');
    }
  }

  /// ---------------- Logout ----------------
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
    debugPrint('✅ Đăng xuất thành công');
  }

  /// ---------------- Common ----------------
  Future<void> updateProfile(String uid, Map<String, dynamic> updates) async {
    await _db.child('users/$uid').update(updates);
  }

  // Hàm mới để kiểm tra trạng thái Onboarding (Lấy dữ liệu từ Backend/DB)
  Future<Map<String, dynamic>> fetchUserData(String uid) async {
    final snapshot = await _db.child('users/$uid').get();

    if (snapshot.exists && snapshot.value != null) {
      // 🎯 FIX GỐC: Chuyển đổi an toàn kiểu dữ liệu Map<Object?, Object?>
      final data = Map<String, dynamic>.from(snapshot.value as Map);

      // Đảm bảo các trường cần thiết không null để tránh lỗi Map sau này
      data['is_onboarding_needed'] ??= true;
      data['role'] ??= 'UNASSIGNED';

      return data;
    }

    // Trả về mặc định nếu không tồn tại hoặc lỗi đọc
    return {
      'role': 'UNASSIGNED',
      'is_onboarding_needed': true,
    };
  }

  Stream<User?> get userChanges => _auth.userChanges();
}