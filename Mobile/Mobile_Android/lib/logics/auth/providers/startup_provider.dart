import 'package:flutter/material.dart';
import '../domain/entities/startup.dart';

class StartupProvider extends ChangeNotifier {

  StartupProvider();

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

}
