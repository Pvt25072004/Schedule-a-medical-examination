import 'package:flutter/material.dart';
import '../domain/entities/medical_record.dart';

class MedicalRecordProvider extends ChangeNotifier {

  MedicalRecordProvider();

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

}
