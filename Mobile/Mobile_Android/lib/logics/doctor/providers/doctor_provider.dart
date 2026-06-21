import 'package:flutter/material.dart';
import '../domain/entities/doctor.dart';
import '../domain/usecases/applyForDoctor_usecase.dart';
import '../domain/usecases/registerGuestDoctor_usecase.dart';

class DoctorProvider extends ChangeNotifier {
  final ApplyfordoctorUseCase applyForDoctorUseCase;
  final RegisterguestdoctorUseCase registerGuestDoctorUseCase;

  DoctorProvider({
    required this.applyForDoctorUseCase,
    required this.registerGuestDoctorUseCase,
  });

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> executeApplyfordoctor(Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await applyForDoctorUseCase(data);
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  Future<void> executeRegisterguestdoctor(Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await registerGuestDoctorUseCase(data);
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
