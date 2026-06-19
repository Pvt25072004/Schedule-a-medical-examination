import 'package:flutter/material.dart';
import '../domain/entities/hospital.dart';

class HospitalProvider extends ChangeNotifier {

  HospitalProvider({
  });

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

}
