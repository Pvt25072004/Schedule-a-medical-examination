import 'package:flutter/material.dart';
import '../domain/entities/payment.dart';
import '../domain/usecases/createVnpayUrl_usecase.dart';
import '../domain/usecases/createPayosUrl_usecase.dart';

class PaymentProvider extends ChangeNotifier {
  final CreatevnpayurlUseCase createVnpayUrlUseCase;
  final CreatepayosurlUseCase createPayosUrlUseCase;

  PaymentProvider({
    required this.createVnpayUrlUseCase,
    required this.createPayosUrlUseCase,
  });

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> executeCreatevnpayurl({
    required int appointmentId,
    required double amount,
    required String orderInfo,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await createVnpayUrlUseCase(appointmentId, amount: amount, orderInfo: orderInfo, : );
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  Future<void> executeCreatepayosurl({
    required int appointmentId,
    required double amount,
    required String orderInfo,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await createPayosUrlUseCase(appointmentId, amount: amount, orderInfo: orderInfo, : );
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
