import 'package:flutter/material.dart';
import '../domain/entities/schedule.dart';

class ScheduleProvider extends ChangeNotifier {

  ScheduleProvider({
  });

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

}
