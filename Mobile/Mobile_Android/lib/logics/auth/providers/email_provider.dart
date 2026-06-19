import 'package:flutter/material.dart';
import '../domain/entities/email.dart';
import '../domain/usecases/sendOtpEmail_usecase.dart';

class EmailProvider extends ChangeNotifier {
  final SendotpemailUseCase sendOtpEmailUseCase;

  EmailProvider({
    required this.sendOtpEmailUseCase,
  });

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> executeSendotpemail(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await sendOtpEmailUseCase(email);
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
