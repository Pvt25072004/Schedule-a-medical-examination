import 'package:flutter/material.dart';
import '../domain/entities/news.dart';

class NewsProvider extends ChangeNotifier {

  NewsProvider({
  });

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

}
