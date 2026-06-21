import 'package:flutter/material.dart';
import '../domain/entities/user_entity.dart';
import '../domain/usecases/auth_usecases.dart';
import '../domain/usecases/login_usecase.dart';
import '../domain/usecases/register_usecase.dart';

class AuthProvider extends ChangeNotifier {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final LogoutUseCase logoutUseCase;
  final GetCurrentUserUseCase getCurrentUserUseCase;

  UserEntity? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserEntity? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _currentUser != null;

  AuthProvider({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.logoutUseCase,
    required this.getCurrentUserUseCase,
  }) {
    _initSession();
  }

  Future<void> _initSession() async {
    await checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    _currentUser = await getCurrentUserUseCase();
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    try {
      _currentUser = await loginUseCase(email, password);
      _errorMessage = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> register(String email, String password, String fullName, String otp) async {
    _setLoading(true);
    try {
      _currentUser = await registerUseCase(email, password, fullName, otp);
      _errorMessage = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    try {
      await logoutUseCase();
      _currentUser = null;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
