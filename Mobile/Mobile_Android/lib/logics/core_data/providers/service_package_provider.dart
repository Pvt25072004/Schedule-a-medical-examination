import 'package:flutter/material.dart';
import '../domain/entities/service_package.dart';

class ${word[0].toUpperCase()}${word.substring(1)}${word[0].toUpperCase()}${word.substring(1)}Provider extends ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // TODO: Add UseCases and methods
}
