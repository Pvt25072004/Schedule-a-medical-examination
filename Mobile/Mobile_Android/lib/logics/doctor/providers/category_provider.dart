import 'package:flutter/material.dart';
import '../domain/entities/category.dart';

class CategoryProvider extends ChangeNotifier {

  CategoryProvider({
  });

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

}
