import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_database/firebase_database.dart';
import '../utils/api_config.dart';

// Lớp giả lập để thay thế Firebase User
class AppUser {
  final String uid;
  final String? email;
  final String? displayName;
  final String? photoURL;
  final String? phoneNumber;

  AppUser({
    required this.uid,
    this.email,
    this.displayName,
    this.photoURL,
    this.phoneNumber,
  });

  Map<String, dynamic> toJson() => {
    'uid': uid,
    'email': email,
    'displayName': displayName,
    'photoURL': photoURL,
    'phoneNumber': phoneNumber,
  };

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
    uid: json['uid'] ?? '',
    email: json['email'],
    displayName: json['displayName'],
    photoURL: json['photoURL'],
    phoneNumber: json['phoneNumber'],
  );
}

// Lớp giả lập thay thế UserCredential
class AppUserCredential {
  final AppUser? user;
  AppUserCredential({this.user});
}

class AuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  bool _isInitialized = false;
  // Static current user để truy xuất mọi nơi giống FirebaseAuth.instance.currentUser
  static AppUser? _currentUser;
  static AppUser? get currentUser => _currentUser;

  // Stream giả lập stream user thay đổi
  static final StreamController<AppUser?> _userStreamController = StreamController<AppUser?>.broadcast();
  Stream<AppUser?> get userChanges => _userStreamController.stream;

  // Cache cho token JWT
  static String? _accessToken;
  static String? get accessToken => _accessToken;

  AuthService() {
    // Đảm bảo cập nhật controller nếu session đã được load
    if (_currentUser != null) {
      _userStreamController.add(_currentUser);
    }
  }

  // Hàm khởi tạo static để load session trước khi app khởi chạy
  static Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('app_user');
      _accessToken = prefs.getString('access_token');

      if (userJson != null) {
        _currentUser = AppUser.fromJson(jsonDecode(userJson));
      }
    } catch (e) {
      debugPrint('⚠️ Lỗi khởi tạo AuthService: $e');
    }
  }

  // Tải session đã lưu (giữ lại để tương thích)
  Future<void> _loadLocalSession() async {
    if (_currentUser != null) {
      _userStreamController.add(_currentUser);
    }
  }

  // Lưu session xuống máy local
  Future<void> _saveLocalSession(AppUser user, String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('app_user', jsonEncode(user.toJson()));
    await prefs.setString('access_token', token);
    _currentUser = user;
    _accessToken = token;
    _userStreamController.add(user);

    // Tự động đồng bộ FCM Token lên NestJS Backend (MySQL)
    try {
      final fcmToken = await FirebaseMessaging.instance.getToken();
      if (fcmToken != null) {
        final url = Uri.parse('${ApiConfig.baseUrl}/users/${user.uid}');
        final resp = await http.patch(
          url,
          headers: _headers(auth: true),
          body: jsonEncode({'fcm_token': fcmToken}),
        );
        if (resp.statusCode == 200 || resp.statusCode == 201) {
          debugPrint('🔔 Đã đồng bộ FCM Token lên NestJS Backend MySQL cho tài khoản ${user.uid}: $fcmToken');
        } else {
          debugPrint('❌ Lỗi đồng bộ FCM Token lên NestJS: ${resp.body}');
        }
      }
    } catch (e) {
      debugPrint('⚠️ Lỗi đồng bộ FCM Token: $e');
    }
  }

  /// ---------------- Helper: Headers cho Request ----------------
  Map<String, String> _headers({bool auth = false}) {
    final map = {'Content-Type': 'application/json'};
    if (auth && _accessToken != null) {
      map['Authorization'] = 'Bearer $_accessToken';
    }
    return map;
  }

  /// ---------------- Đăng ký Email ----------------
  Future<AppUserCredential> signUpWithEmail(
      String email,
      String password,
      String displayName,
      String otp,
      ) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/auth/register');

      // Sinh số điện thoại duy nhất và các giá trị mặc định do API BE bắt buộc NOT NULL
      final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
      final dummyPhone = '0${timestamp.substring(timestamp.length - 9)}';

      final body = {
        'full_name': displayName.isNotEmpty ? displayName : email.split('@')[0],
        'email': email,
        'phone': dummyPhone,
        'password': password,
        'otp': otp,
        'date_of_birth': '2000-01-01', // Giá trị mặc định, sẽ cập nhật ở Onboarding
        'gender': 'male' // Giá trị mặc định, sẽ cập nhật ở Onboarding
      };

      debugPrint('➡️ Gọi API Đăng Ký: $url, body: $body');
      final resp = await http.post(url, headers: _headers(), body: jsonEncode(body));

      if (resp.statusCode == 201) {
        final data = jsonDecode(utf8.decode(resp.bodyBytes));
        final backendUser = data['user'];
        final token = data['access_token'];

        final appUser = AppUser(
          uid: backendUser['id'].toString(),
          email: backendUser['email'],
          displayName: backendUser['full_name'],
          phoneNumber: backendUser['phone'],
        );

        // Tự động lưu session sau khi đăng ký thành công
        await _saveLocalSession(appUser, token);
        return AppUserCredential(user: appUser);
      } else {
        final errorBody = jsonDecode(utf8.decode(resp.bodyBytes));
        final message = errorBody['message'] ?? 'Đăng ký không thành công.';
        throw Exception(message);
      }
    } catch (e) {
      debugPrint('🔥 Lỗi đăng ký: $e');
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// ---------------- Đăng nhập Email ----------------
  Future<AppUserCredential> signInWithEmail(String email, String password) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/auth/login');
      final body = {'email': email, 'password': password};

      debugPrint('➡️ Gọi API Đăng Nhập: $url');
      final resp = await http.post(url, headers: _headers(), body: jsonEncode(body));

      if (resp.statusCode == 200) {
        final data = jsonDecode(utf8.decode(resp.bodyBytes));
        final backendUser = data['user'];
        final token = data['access_token'];

        final appUser = AppUser(
          uid: backendUser['id'].toString(),
          email: backendUser['email'],
          displayName: backendUser['full_name'],
          phoneNumber: backendUser['phone'],
          photoURL: backendUser['avatar_url'],
        );

        await _saveLocalSession(appUser, token);
        return AppUserCredential(user: appUser);
      } else {
        final errorBody = jsonDecode(utf8.decode(resp.bodyBytes));
        final message = errorBody['message'] ?? 'Email hoặc mật khẩu không chính xác.';
        throw Exception(message);
      }
    } catch (e) {
      debugPrint('🔥 Lỗi đăng nhập: $e');
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// ---------------- Logout ----------------
  Future<void> signOut() async {
    try {
      final user = _currentUser;
      if (user != null) {
        // Vô hiệu hóa FCM token của user trên NestJS Backend
        try {
          final url = Uri.parse('${ApiConfig.baseUrl}/users/${user.uid}');
          await http.patch(
            url,
            headers: _headers(auth: true),
            body: jsonEncode({'fcm_token': ''}),
          );
        } catch (_) {}
      }

      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('app_user');
      await prefs.remove('access_token');
      _currentUser = null;
      _accessToken = null;
      _userStreamController.add(null);
      debugPrint('✅ Đăng xuất và xóa session thành công');
    } catch (e) {
      debugPrint('❌ Lỗi đăng xuất: $e');
    }
  }

  /// ---------------- Cập nhật Hồ sơ người dùng ----------------
  Future<void> updateProfile(String uid, Map<String, dynamic> updates) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/users/$uid');

      // Biến đổi dữ liệu frontend thành dạng backend hiểu
      final Map<String, dynamic> backendPayload = {};

      if (updates.containsKey('displayName')) {
        backendPayload['full_name'] = updates['displayName'];
      }
      if (updates.containsKey('dateOfBirth')) {
        backendPayload['date_of_birth'] = updates['dateOfBirth'];
      }
      if (updates.containsKey('role')) {
        // Map role FE sang BE
        final feRole = updates['role'].toString().toUpperCase();
        if (feRole.contains('BỆNH NHÂN') || feRole.contains('PATIENT')) {
          backendPayload['role'] = 'patient';
        } else if (feRole.contains('BÁC SĨ') || feRole.contains('DOCTOR')) {
          backendPayload['role'] = 'doctor';
        } else {
          backendPayload['role'] = 'patient';
        }
      }
      if (updates.containsKey('address')) {
        // Address trong FE là Map, Backend lưu dưới dạng text string
        final addressData = updates['address'];
        if (addressData is Map) {
          backendPayload['address'] = jsonEncode(addressData);
        } else {
          backendPayload['address'] = addressData.toString();
        }
      }
      if (updates.containsKey('email')) {
        backendPayload['email'] = updates['email'];
      }
      if (updates.containsKey('phone')) {
        backendPayload['phone'] = updates['phone'];
      }
      if (updates.containsKey('gender')) {
        final genderStr = updates['gender'].toString().toLowerCase();
        if (genderStr == 'nam' || genderStr == 'male') {
          backendPayload['gender'] = 'male';
        } else if (genderStr == 'nữ' || genderStr == 'female') {
          backendPayload['gender'] = 'female';
        } else {
          backendPayload['gender'] = 'other';
        }
      }
      if (updates.containsKey('medicalHistory')) {
        // Nếu BE không có cột medical_history, ta có thể lưu tạm vào address hoặc meta,
        // nhưng hiện tại cứ pass vào, nếu backend throw lỗi thì ta ignore hoặc map phù hợp.
        // Ở đây ta có thể lưu meta tùy biến, hoặc bỏ qua nếu BE chưa hỗ trợ.
      }
      if (updates.containsKey('is_onboarding_needed')) {
        // Backend user entity dùng `is_welcome` để biết đã onboarding xong chưa
        backendPayload['is_welcome'] = updates['is_onboarding_needed'] == false;
        // Ta cũng lưu cục bộ cờ này trên SharedPreferences cho an toàn
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('onboarding_needed_$uid', updates['is_onboarding_needed'] == true);
      }

      debugPrint('➡️ Gọi API Cập Nhật Profile ($uid): $url, body: $backendPayload');
      final resp = await http.patch(url, headers: _headers(auth: true), body: jsonEncode(backendPayload));

      if (resp.statusCode == 200 || resp.statusCode == 201) {
        debugPrint('✅ Cập nhật profile thành công');
        // Cập nhật lại local AppUser nếu có đổi tên
        if (updates.containsKey('displayName') && _currentUser != null) {
          final updatedUser = AppUser(
            uid: _currentUser!.uid,
            email: _currentUser!.email,
            displayName: updates['displayName'],
            photoURL: _currentUser!.photoURL,
            phoneNumber: _currentUser!.phoneNumber,
          );
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('app_user', jsonEncode(updatedUser.toJson()));
          _currentUser = updatedUser;
          _userStreamController.add(updatedUser);
        }
      } else {
        debugPrint('❌ Lỗi cập nhật profile BE: ${resp.body}');
      }
    } catch (e) {
      debugPrint('🔥 Lỗi updateProfile: $e');
    }
  }

  /// ---------------- Lấy Dữ liệu Người dùng (Kiểm tra Onboarding) ----------------
  Future<Map<String, dynamic>> fetchUserData(String uid) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/users/$uid');
      debugPrint('➡️ Gọi API Lấy Thông tin User ($uid): $url');
      final resp = await http.get(url, headers: _headers(auth: true));

      if (resp.statusCode == 200) {
        final backendUser = jsonDecode(utf8.decode(resp.bodyBytes));

        // Đọc trạng thái onboarding từ Backend (dùng is_welcome) hoặc local cache
        final bool isBackendWelcome = backendUser['is_welcome'] ?? false;
        final prefs = await SharedPreferences.getInstance();
        final bool isLocalOnboardingNeeded = prefs.getBool('onboarding_needed_$uid') ?? true;
        // Onboarding chỉ thực sự cần nếu Backend báo chưa hoàn tất (is_welcome = false)
        final bool isOnboardingNeeded = isBackendWelcome ? false : isLocalOnboardingNeeded;

        // Parser an toàn cho Address JSON
        Map<String, dynamic> addressMap = {};
        final rawAddress = backendUser['address'];
        if (rawAddress != null && rawAddress.toString().startsWith('{')) {
          try {
            addressMap = Map<String, dynamic>.from(jsonDecode(rawAddress));
          } catch (_) {}
        } else if (rawAddress != null) {
          addressMap = {'province': '', 'district': '', 'street': rawAddress};
        }

        // Chuyển đổi schema backend thành Map format mà Flutter UI mong đợi
        final Map<String, dynamic> frontendUserData = {
          'role': backendUser['role'] == 'doctor' ? 'Bác sĩ' : (backendUser['role'] == 'patient' ? 'Bệnh nhân' : 'UNASSIGNED'),
          'is_onboarding_needed': isOnboardingNeeded,
          'displayName': backendUser['full_name'] ?? '',
          'dateOfBirth': backendUser['date_of_birth'],
          'address': addressMap,
          'photoUrl': backendUser['avatar_url'] ?? '',
          'phone': backendUser['phone'] ?? '',
          'email': backendUser['email'] ?? '',
          'gender': backendUser['gender'] == 'male' ? 'Nam' : (backendUser['gender'] == 'female' ? 'Nữ' : 'Khác'),
          'medicalHistory': '', // Fallback
          'notification_settings': backendUser['notification_settings'],
        };

        return frontendUserData;
      }
    } catch (e) {
      debugPrint('🔥 Lỗi fetchUserData: $e');
    }

    // Trả về giá trị mặc định nếu lỗi hoặc không lấy được
    return {
      'role': 'UNASSIGNED',
      'is_onboarding_needed': true,
    };
  }

  /// ---------------- Phone Auth & Google Signin (Gác tạm thời) ----------------
  Future<String> sendOtpPhone(String phoneNumber) async {
    throw Exception('Tính năng Đăng nhập SMS hiện chưa hỗ trợ bởi máy chủ. Vui lòng dùng Email.');
  }

  Future<AppUserCredential> verifyOtpAndSignIn(String verificationId, String smsCode) async {
    throw Exception('Tính năng Đăng nhập SMS hiện chưa hỗ trợ.');
  }

  Future<void> _initGoogleSignIn() async {
    if (!_isInitialized) {
      _isInitialized = true;
    }
  }

  Future<AppUserCredential> signInWithGoogle() async {
    try {
      await _initGoogleSignIn();
      final googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        throw Exception('Người dùng đã hủy hoặc không chọn tài khoản Google.');
      }

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;
      if (idToken == null) {
        throw Exception('Không lấy được ID Token từ Google.');
      }

      final url = Uri.parse('${ApiConfig.baseUrl}/auth/social-login');
      debugPrint('➡️ Gọi API Social Login (Google): $url');
      final resp = await http.post(
        url,
        headers: _headers(),
        body: jsonEncode({
          'token': idToken,
          'provider': 'google',
        }),
      );

      if (resp.statusCode == 200 || resp.statusCode == 201) {
        final data = jsonDecode(utf8.decode(resp.bodyBytes));
        final backendUser = data['user'];
        final token = data['access_token'];

        final appUser = AppUser(
          uid: backendUser['id'].toString(),
          email: backendUser['email'],
          displayName: backendUser['full_name'],
          phoneNumber: backendUser['phone'],
          photoURL: backendUser['avatar_url'],
        );

        await _saveLocalSession(appUser, token);
        return AppUserCredential(user: appUser);
      } else {
        final errorBody = jsonDecode(utf8.decode(resp.bodyBytes));
        final message = errorBody['message'] ?? 'Đăng nhập Google thất bại.';
        throw Exception(message);
      }
    } catch (e) {
      debugPrint('🔥 Lỗi đăng nhập Google: $e');
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<AppUserCredential> signInWithFacebook() async {
    try {
      final LoginResult result = await FacebookAuth.instance.login(
        permissions: ['public_profile', 'email'],
      );

      if (result.status == LoginStatus.success) {
        final AccessToken accessToken = result.accessToken!;
        
        final url = Uri.parse('${ApiConfig.baseUrl}/auth/social-login');
        debugPrint('➡️ Gọi API Social Login (Facebook): $url');
        final resp = await http.post(
          url,
          headers: _headers(),
          body: jsonEncode({
            'token': accessToken.tokenString,
            'provider': 'facebook',
          }),
        );

        if (resp.statusCode == 200 || resp.statusCode == 201) {
          final data = jsonDecode(utf8.decode(resp.bodyBytes));
          final backendUser = data['user'];
          final token = data['access_token'];

          final appUser = AppUser(
            uid: backendUser['id'].toString(),
            email: backendUser['email'],
            displayName: backendUser['full_name'],
            phoneNumber: backendUser['phone'],
            photoURL: backendUser['avatar_url'],
          );

          await _saveLocalSession(appUser, token);
          return AppUserCredential(user: appUser);
        } else {
          final errorBody = jsonDecode(utf8.decode(resp.bodyBytes));
          final message = errorBody['message'] ?? 'Đăng nhập Facebook thất bại.';
          throw Exception(message);
        }
      } else if (result.status == LoginStatus.cancelled) {
        throw Exception('Đăng nhập Facebook đã bị hủy bởi người dùng.');
      } else {
        throw Exception('Lỗi Facebook: ${result.message}');
      }
    } catch (e) {
      debugPrint('🔥 Lỗi đăng nhập Facebook: $e');
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }
}