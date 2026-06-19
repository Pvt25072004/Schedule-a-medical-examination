import 'package:flutter/material.dart';
import '../domain/entities/service_package.dart';

class ServicePackageProvider extends ChangeNotifier {

  ServicePackageProvider({
  });

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

}
