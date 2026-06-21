import 'package:flutter/material.dart';
import '../domain/entities/service_package.dart';

class ServicePackageProvider extends ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // TODO: Add UseCases and methods
}
